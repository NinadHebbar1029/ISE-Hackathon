'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api-client';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import UrgencyBadge from '@/components/ui/UrgencyBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import type { CaseWithTriage } from '@shared/types';

export default function DoctorHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cases, setCases] = useState<CaseWithTriage[]>([]);
  const [filteredCases, setFilteredCases] = useState<CaseWithTriage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'doctor')) {
      router.push('/login');
    } else if (user) {
      fetchHistory();
    }
  }, [user, authLoading, router]);

  const fetchHistory = async () => {
    try {
      const response = await apiClient.get('/cases');
      const allCases = response.data || [];
      
      // Filter to only cases handled by this doctor
      const doctorCases = allCases.filter(
        (c: CaseWithTriage) => 
          c.assignment?.doctorId === user?.id && 
          (c.status === 'resolved' || c.status === 'in_progress')
      );

      setCases(doctorCases);
      setFilteredCases(doctorCases);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...cases];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.id.toString().includes(term) ||
          c.description.toLowerCase().includes(term) ||
          c.patientName?.toLowerCase().includes(term)
      );
    }

    setFilteredCases(result);
  }, [searchTerm, statusFilter, cases]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const resolvedCases = cases.filter((c) => c.status === 'resolved');
  const inProgressCases = cases.filter((c) => c.status === 'in_progress');

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Case History</h1>
          <p className="text-gray-600">
            Review all cases you've handled as a medical professional
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cases Handled</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">{cases.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Successfully Resolved</p>
                <p className="text-3xl font-bold text-success-600 mt-1">{resolvedCases.length}</p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-warning-600 mt-1">{inProgressCases.length}</p>
              </div>
              <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Search Cases"
              placeholder="Search by case ID, patient name, or symptoms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select
              label="Filter by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'resolved', label: 'Resolved' },
              ]}
            />
          </div>
        </Card>

        {/* Results Summary */}
        {searchTerm || statusFilter !== 'all' ? (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredCases.length}</span> of{' '}
              <span className="font-semibold">{cases.length}</span> cases
            </p>
          </div>
        ) : null}

        {/* Cases List */}
        {filteredCases.length === 0 ? (
          <EmptyState
            title={
              cases.length === 0
                ? 'No Cases Yet'
                : 'No Matching Cases'
            }
            description={
              cases.length === 0
                ? "You haven't handled any cases yet. Cases you review will appear here."
                : 'Try adjusting your search or filter criteria.'
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredCases.map((caseItem) => (
              <Link
                key={caseItem.id}
                href={`/doctor/cases/${caseItem.id}`}
                className="block"
              >
                <Card
                  className={`hover:shadow-lg transition-shadow cursor-pointer ${
                    caseItem.status === 'resolved'
                      ? 'border-l-4 border-l-success-500'
                      : 'border-l-4 border-l-warning-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Case #{caseItem.id}
                        </h3>
                        <StatusBadge status={caseItem.status} />
                        {caseItem.triage && (
                          <UrgencyBadge urgency={caseItem.triage.urgencyLevel} />
                        )}
                      </div>

                      {caseItem.patientName && (
                        <p className="text-sm text-gray-600 mb-2">
                          Patient: <span className="font-medium text-gray-900">{caseItem.patientName}</span>
                          {caseItem.patientAge && ` • ${caseItem.patientAge} years old`}
                        </p>
                      )}

                      <p className="text-gray-700 line-clamp-2 mb-3">
                        {caseItem.description}
                      </p>

                      {caseItem.triage?.symptoms && caseItem.triage.symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {caseItem.triage.symptoms.slice(0, 5).map((symptom, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium"
                            >
                              {symptom}
                            </span>
                          ))}
                          {caseItem.triage.symptoms.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{caseItem.triage.symptoms.length - 5} more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                        {caseItem.location && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {caseItem.location}
                          </span>
                        )}
                        <span>
                          Submitted: {new Date(caseItem.createdAt).toLocaleDateString()}
                        </span>
                        {caseItem.updatedAt !== caseItem.createdAt && (
                          <span>
                            Updated: {new Date(caseItem.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      <div className="text-primary-600 font-medium text-sm">
                        View Details →
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
