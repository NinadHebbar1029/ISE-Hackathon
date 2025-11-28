'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api-client';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import ProgressBar from '@/components/ui/ProgressBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Link from 'next/link';
import type { CaseWithTriage } from '@shared/types';
import UrgencyBadge from '@/components/ui/UrgencyBadge';

export default function WorkerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cases, setCases] = useState<CaseWithTriage[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'worker')) {
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
      setCases(casesRes.data);
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

  const urgencyCounts =
    stats?.byUrgency?.reduce((acc: any, item: any) => {
      acc[item.urgency_level] = Number(item.count);
      return acc;
    }, {}) || {};

  const statusCounts =
    stats?.byStatus?.reduce((acc: any, item: any) => {
      acc[item.status] = Number(item.count);
      return acc;
    }, {}) || {};

  const totalCases = Object.values(urgencyCounts).reduce((a: any, b: any) => Number(a) + Number(b), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar
        role="worker"
        links={[
          { href: '/worker/dashboard', label: 'Dashboard' },
          { href: '/worker/cases', label: 'Cases' },
          { href: '/worker/new-case', label: 'New Case' },
          { href: '/worker/profile', label: 'Profile' },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 via-teal-500 to-primary-500 text-white p-8 mb-8 shadow-lg">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, white 2px, transparent 2px), radial-gradient(circle at 80% 30%, white 2px, transparent 2px), radial-gradient(circle at 40% 80%, white 2px, transparent 2px)'
            }}
          />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Health Worker Dashboard</h1>
              <p className="mt-2 text-white/90">Triage and track cases in your assigned areas.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/worker/new-case">
                <button className="px-4 py-2 rounded-lg bg-white text-teal-700 hover:bg-white/90 font-medium shadow">+ Submit Case</button>
              </Link>
              <Link href="/worker/cases">
                <button className="px-4 py-2 rounded-lg bg-white/10 border border-white text-white hover:bg-white/20 font-medium">View Cases</button>
              </Link>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Critical" value={urgencyCounts.critical || 0} accent="urgent" />
          <StatCard title="Urgent" value={urgencyCounts.urgent || 0} accent="warning" />
          <StatCard title="Moderate" value={urgencyCounts.moderate || 0} accent="primary" />
          <StatCard title="Routine" value={urgencyCounts.routine || 0} accent="success" />
        </div>

        {/* Workload overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Workload by Urgency</h2>
              <span className="text-sm text-gray-500">Total: {String(totalCases)}</span>
            </div>
            <ProgressBar
              items={[
                { label: 'critical', value: urgencyCounts.critical || 0, colorClass: 'bg-urgent-500' },
                { label: 'urgent', value: urgencyCounts.urgent || 0, colorClass: 'bg-warning-500' },
                { label: 'moderate', value: urgencyCounts.moderate || 0, colorClass: 'bg-primary-500' },
                { label: 'routine', value: urgencyCounts.routine || 0, colorClass: 'bg-green-500' },
              ]}
            />
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3">
              <Link href="/worker/new-case">
                <button className="w-full rounded-lg border bg-white px-4 py-2 text-left font-medium text-gray-700 shadow-sm transition hover:shadow">
                  ➕ Submit New Case
                </button>
              </Link>
              <Link href="/worker/cases">
                <button className="w-full rounded-lg border bg-white px-4 py-2 text-left font-medium text-gray-700 shadow-sm transition hover:shadow">
                  📂 View All Cases
                </button>
              </Link>
              <Link href="/worker/profile">
                <button className="w-full rounded-lg border bg-white px-4 py-2 text-left font-medium text-gray-700 shadow-sm transition hover:shadow">
                  👤 Update Profile
                </button>
              </Link>
            </div>
          </Card>
        </div>

  <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Cases</h2>

        {cases.length === 0 ? (
          <Card>
            <EmptyState
              title="No cases assigned"
              description="There are no cases in your assigned areas yet. Check back later or contact your coordinator."
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {cases.slice(0, 10).map((caseItem) => (
              <Card key={caseItem.id} hover>
                <Link href={`/worker/cases/${caseItem.id}`}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg tracking-tight">Case #{caseItem.id}</h3>
                        {caseItem.triage && (
                          <UrgencyBadge urgency={caseItem.triage.urgencyLevel} />
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{new Date(caseItem.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{caseItem.description.substring(0, 180)}{caseItem.description.length > 180 ? '…' : ''}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>Area: {caseItem.area?.name || 'Unassigned'}</span>
                      {caseItem.patientName && <span>Patient: {caseItem.patientName}</span>}
                      {caseItem.language && <span>Lang: {caseItem.language.toUpperCase()}</span>}
                    </div>
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
