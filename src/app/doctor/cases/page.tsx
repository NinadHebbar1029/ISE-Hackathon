'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api-client';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import UrgencyBadge from '@/components/ui/UrgencyBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import Link from 'next/link';
import type { CaseWithTriage } from '@shared/types';

type UrgencyFilter = 'all' | 'critical' | 'urgent' | 'moderate' | 'routine';

export default function DoctorCasesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cases, setCases] = useState<CaseWithTriage[]>([]);
  const [filteredCases, setFilteredCases] = useState<CaseWithTriage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>('all');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'doctor')) {
      router.push('/login');
    } else if (user) {
      fetchCases();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    applyFilters();
  }, [cases, searchTerm, urgencyFilter]);

  const fetchCases = async () => {
    try {
      const response = await apiClient.get('/cases');
      // Filter for cases needing doctor review
      const doctorCases = response.data.filter(
        (c: CaseWithTriage) => 
          c.status === 'awaiting_doctor' || 
          c.assignment?.doctorId === user?.id
      );
      setCases(doctorCases);
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...cases];

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.id.toString().includes(searchTerm)
      );
    }

    if (urgencyFilter !== 'all') {
      filtered = filtered.filter((c) => c.triage?.urgencyLevel === urgencyFilter);
    }

    // Sort by urgency (critical first)
    filtered.sort((a, b) => {
      const urgencyOrder = { critical: 0, urgent: 1, moderate: 2, routine: 3 };
      const aUrgency = a.triage?.urgencyLevel || 'routine';
      const bUrgency = b.triage?.urgencyLevel || 'routine';
      
      if (urgencyOrder[aUrgency as keyof typeof urgencyOrder] !== urgencyOrder[bUrgency as keyof typeof urgencyOrder]) {
        return urgencyOrder[aUrgency as keyof typeof urgencyOrder] - urgencyOrder[bUrgency as keyof typeof urgencyOrder];
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredCases(filtered);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const criticalCount = cases.filter((c) => c.triage?.urgencyLevel === 'critical').length;
  const urgentCount = cases.filter((c) => c.triage?.urgencyLevel === 'urgent').length;
  const awaitingCount = cases.filter((c) => c.status === 'awaiting_doctor').length;

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Case Queue</h1>
          <p className="text-gray-600 mt-1">Review triaged cases and provide medical guidance</p>
        </div>

        {/* Priority Alerts */}
        {criticalCount > 0 && (
          <div className="mb-6 bg-urgent-50 border-l-4 border-urgent-600 p-4 rounded-r shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-urgent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-bold text-urgent-900">
                  {criticalCount} CRITICAL case{criticalCount > 1 ? 's' : ''} require{criticalCount === 1 ? 's' : ''} IMMEDIATE medical attention!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Awaiting Review</p>
              <p className="text-3xl font-bold text-primary-600">{awaitingCount}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Critical</p>
              <p className="text-3xl font-bold text-urgent-600">{criticalCount}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Urgent</p>
              <p className="text-3xl font-bold text-warning-600">{urgentCount}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Queue</p>
              <p className="text-3xl font-bold text-gray-900">{cases.length}</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search by case ID, symptoms, or patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Urgency Level
              </label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'critical', 'urgent', 'moderate', 'routine'] as UrgencyFilter[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setUrgencyFilter(level)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      urgencyFilter === level
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level === 'all' ? 'All Cases' : level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Results summary */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredCases.length} of {cases.length} case{cases.length !== 1 ? 's' : ''}
        </div>

        {/* Cases list */}
        {filteredCases.length === 0 ? (
          <Card>
            <EmptyState
              title={cases.length === 0 ? 'No cases in queue' : 'No cases match your filters'}
              description={
                cases.length === 0
                  ? 'There are currently no cases awaiting doctor review. Check back later.'
                  : 'Try adjusting your search or filter criteria.'
              }
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredCases.map((caseItem) => (
              <Card key={caseItem.id} hover className={
                caseItem.triage?.urgencyLevel === 'critical' 
                  ? 'border-l-4 border-l-urgent-600' 
                  : caseItem.triage?.urgencyLevel === 'urgent'
                  ? 'border-l-4 border-l-warning-600'
                  : ''
              }>
                <Link href={`/doctor/cases/${caseItem.id}`}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Case #{caseItem.id}
                        </h3>
                        {caseItem.triage && (
                          <UrgencyBadge urgency={caseItem.triage.urgencyLevel} />
                        )}
                        <StatusBadge status={caseItem.status} />
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(caseItem.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {caseItem.patientName && (
                      <p className="text-sm text-gray-600">
                        Patient: <span className="font-medium text-gray-900">{caseItem.patientName}</span>
                        {caseItem.patientAge && <span>, {caseItem.patientAge} years old</span>}
                      </p>
                    )}

                    {caseItem.triage?.summary && (
                      <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-primary-900 mb-1">AI Triage Summary:</p>
                        <p className="text-sm text-primary-800">{caseItem.triage.summary}</p>
                      </div>
                    )}

                    {caseItem.triage?.symptoms && caseItem.triage.symptoms.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Key Symptoms:</p>
                        <div className="flex flex-wrap gap-2">
                          {caseItem.triage.symptoms.slice(0, 5).map((symptom, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {caseItem.area && <span>Area: {caseItem.area.name}</span>}
                        {caseItem.assignment?.workerName && (
                          <span>Triaged by: {caseItem.assignment.workerName}</span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                        Review Case
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
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
