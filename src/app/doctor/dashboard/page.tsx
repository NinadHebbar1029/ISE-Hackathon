'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api-client';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Link from 'next/link';
import UrgencyBadge from '@/components/ui/UrgencyBadge';
import type { CaseWithTriage } from '@shared/types';

export default function DoctorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cases, setCases] = useState<CaseWithTriage[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'doctor')) {
      router.push('/login');
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      const [casesRes, statsRes] = await Promise.all([
        apiClient.get('/cases'),
        apiClient.get('/cases/stats'),
      ]);
      setCases(casesRes.data.filter((c: any) => c.status === 'awaiting_doctor' || c.assignment?.doctorId === user?.id));
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        role="doctor"
        links={[
          { href: '/doctor/dashboard', label: 'Dashboard' },
          { href: '/doctor/cases', label: 'Case Queue' },
          { href: '/doctor/history', label: 'History' },
          { href: '/doctor/profile', label: 'Profile' },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-gray-600 mt-2">Review triaged cases and provide medical guidance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Awaiting Review</p>
              <p className="text-3xl font-bold text-primary-600">
                {cases.filter(c => c.status === 'awaiting_doctor').length}
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-warning-600">
                {cases.filter(c => c.status === 'in_progress').length}
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Cases</p>
              <p className="text-3xl font-bold text-gray-900">{cases.length}</p>
            </div>
          </Card>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-4">Case Queue</h2>

        {cases.length === 0 ? (
          <Card>
            <EmptyState
              title="No cases in queue"
              description="There are currently no cases awaiting doctor review. Check back later."
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {cases.map((caseItem) => (
              <Card key={caseItem.id} hover>
                <Link href={`/doctor/cases/${caseItem.id}`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">Case #{caseItem.id}</h3>
                        {caseItem.triage && (
                          <UrgencyBadge urgency={caseItem.triage.urgencyLevel} />
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(caseItem.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {caseItem.triage?.summary && (
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">AI Summary:</p>
                        <p className="text-sm text-gray-600">{caseItem.triage.summary}</p>
                      </div>
                    )}

                    <p className="text-gray-600 text-sm">{caseItem.description.substring(0, 200)}...</p>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
