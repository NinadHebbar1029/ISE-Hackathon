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
import type { CaseWithTriage, Area, CaseStatus } from '@shared/types';

type UrgencyFilter = 'all' | 'critical' | 'urgent' | 'moderate' | 'routine';
type ViewScope = 'all' | 'mine';
type StatusFilter = 'all' | CaseStatus;

export default function WorkerCasesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cases, setCases] = useState<CaseWithTriage[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [filteredCases, setFilteredCases] = useState<CaseWithTriage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [viewScope, setViewScope] = useState<ViewScope>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<'urgency' | 'date_desc' | 'date_asc'>('urgency');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'worker')) {
      router.push('/login');
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    applyFilters();
  }, [cases, searchTerm, urgencyFilter, areaFilter, viewScope, statusFilter, sortBy, user]);

  const fetchData = async () => {
    try {
      const [casesRes, areasRes] = await Promise.all([
        apiClient.get('/cases'),
        apiClient.get('/areas'),
      ]);
      setCases(casesRes.data);
      setAreas(areasRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
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

    if (viewScope === 'mine' && user?.id) {
      filtered = filtered.filter((c) => c.createdByUserId === user.id);
    }

    if (urgencyFilter !== 'all') {
      filtered = filtered.filter((c) => c.triage?.urgencyLevel === urgencyFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (areaFilter !== 'all') {
      filtered = filtered.filter((c) => c.areaId?.toString() === areaFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'urgency') {
        const urgencyOrder = { critical: 0, urgent: 1, moderate: 2, routine: 3 } as const;
        const aUrgency = a.triage?.urgencyLevel || 'routine';
        const bUrgency = b.triage?.urgencyLevel || 'routine';
        if (urgencyOrder[aUrgency] !== urgencyOrder[bUrgency]) {
          return urgencyOrder[aUrgency] - urgencyOrder[bUrgency];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'date_asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Case Management</h1>
            <p className="text-gray-600 mt-1">Monitor and manage cases in your assigned areas</p>
          </div>
          <Link href="/worker/new-case">
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
              + Submit Case
            </button>
          </Link>
        </div>

        {/* Alert banners */}
        {criticalCount > 0 && (
          <div className="mb-6 bg-urgent-50 border-l-4 border-urgent-500 p-4 rounded-r">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-urgent-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-urgent-800">
                  {criticalCount} critical case{criticalCount > 1 ? 's' : ''} require{criticalCount === 1 ? 's' : ''} immediate attention
                </p>
              </div>
            </div>
          </div>
        )}

        {urgentCount > 0 && (
          <div className="mb-6 bg-warning-50 border-l-4 border-warning-500 p-4 rounded-r">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-warning-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-warning-800">
                  {urgentCount} urgent case{urgentCount > 1 ? 's' : ''} need{urgentCount === 1 ? 's' : ''} attention soon
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <div className="space-y-4">
            {/* Scope tabs */}
            <div className="flex w-full items-center justify-between flex-wrap gap-3">
              <div className="inline-flex rounded-xl bg-gray-100 p-1">
                {(['all', 'mine'] as ViewScope[]).map((scope) => (
                  <button
                    key={scope}
                    onClick={() => setViewScope(scope)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                      viewScope === scope ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {scope === 'all' ? 'All Cases' : 'My Cases'}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="urgency">Urgency</option>
                  <option value="date_desc">Newest first</option>
                  <option value="date_asc">Oldest first</option>
                </select>
              </div>
            </div>

            <input
              type="text"
              placeholder="Search cases by ID, symptoms, or patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level
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
                      {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['all','new','assigned','in_progress','awaiting_doctor','completed','closed','resolved'] as StatusFilter[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        statusFilter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {s === 'all' ? 'All' : s.replace('_', ' ').replace('_', ' ').replace(/^./, (c) => c.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area
                </label>
                <select
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="all">All Areas</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id.toString()}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Results summary */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredCases.length} of {cases.length} case{cases.length !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-2 text-sm">
            <span className="px-3 py-1 bg-urgent-100 text-urgent-700 rounded-full">
              Critical: {criticalCount}
            </span>
            <span className="px-3 py-1 bg-warning-100 text-warning-700 rounded-full">
              Urgent: {urgentCount}
            </span>
          </div>
        </div>

        {/* Cases list */}
        {filteredCases.length === 0 ? (
          <Card>
            <EmptyState
              title={cases.length === 0 ? 'No cases assigned' : 'No cases match your filters'}
              description={
                cases.length === 0
                  ? 'There are no cases in your assigned areas yet. Check back later or submit a case on behalf of a patient.'
                  : 'Try adjusting your search or filter criteria.'
              }
              action={
                cases.length === 0 ? (
                  <Link href="/worker/new-case">
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
                      Submit New Case
                    </button>
                  </Link>
                ) : undefined
              }
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredCases.map((caseItem) => (
              <Card key={caseItem.id} hover>
                <Link href={`/worker/cases/${caseItem.id}`}>
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
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          Patient: <span className="font-medium text-gray-900">{caseItem.patientName}</span>
                          {caseItem.patientAge && <span> ({caseItem.patientAge} yrs)</span>}
                        </span>
                        {caseItem.location && (
                          <span className="text-gray-600">
                            Location: <span className="font-medium text-gray-900">{caseItem.location}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {caseItem.triage?.summary && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">AI Triage Summary:</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{caseItem.triage.summary}</p>
                      </div>
                    )}

                    <p className="text-gray-700 line-clamp-2">{caseItem.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {caseItem.area && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {caseItem.area.name}
                          </span>
                        )}
                        {caseItem.assignment?.doctorName && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Dr. {caseItem.assignment.doctorName}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-primary-600 hover:text-primary-700">
                        View Details →
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
