'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api-client';
import Navbar from '@/components/ui/Navbar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import UrgencyBadge from '@/components/ui/UrgencyBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import type { CaseWithTriage } from '@shared/types';

export default function PatientCasesPage() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();
	const [cases, setCases] = useState<CaseWithTriage[]>([]);
	const [search, setSearch] = useState('');
	const [filterUrgency, setFilterUrgency] = useState<string>('all');
	const [filterStatus, setFilterStatus] = useState<string>('all');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!authLoading && (!user || user.role !== 'patient')) {
			router.push('/login');
		} else if (user) {
			fetchCases();
		}
	}, [user, authLoading, router]);

	const fetchCases = async () => {
		try {
			const res = await apiClient.get('/cases');
			setCases(res.data || []);
		} catch (e) {
			console.error('Failed to load cases', e);
		} finally {
			setLoading(false);
		}
	};

	const filtered = cases.filter((c) => {
		const matchesSearch = !search || 
			c.description.toLowerCase().includes(search.toLowerCase()) ||
			c.id.toString().includes(search);
		const matchesUrgency = filterUrgency === 'all' || c.triage?.urgencyLevel === filterUrgency;
		const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
		return matchesSearch && matchesUrgency && matchesStatus;
	});

	if (authLoading || loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
			<Navbar
				role="patient"
				links={[
					{ href: '/patient/dashboard', label: 'Dashboard' },
					{ href: '/patient/cases', label: 'My Cases' },
					{ href: '/patient/new-case', label: 'New Case' },
					{ href: '/patient/profile', label: 'Profile' },
				]}
			/>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8 relative rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white overflow-hidden">
					<div className="absolute inset-0 bg-black/10"></div>
					<div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
					
					<div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
						<div>
							<h1 className="text-4xl font-bold mb-2">My Cases 📋</h1>
							<p className="text-indigo-100">Track and manage all your medical consultations</p>
						</div>
						<Link href="/patient/new-case">
							<button className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
								<span className="flex items-center gap-2">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
									</svg>
									New Case
								</span>
							</button>
						</Link>
					</div>
				</div>

				{/* Filters */}
				<div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-8 border-2 border-white">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						{/* Search */}
						<div className="md:col-span-2">
							<div className="relative">
								<svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
								<input
									type="text"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									placeholder="Search by ID or description..."
									className="w-full pl-12 pr-4 py-3 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 outline-none transition-all duration-300"
								/>
							</div>
						</div>

						{/* Urgency Filter */}
						<div>
							<select
								value={filterUrgency}
								onChange={(e) => setFilterUrgency(e.target.value)}
								className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 outline-none transition-all duration-300"
							>
								<option value="all">All Urgencies</option>
								<option value="urgent">🚨 Urgent</option>
								<option value="high">⚡ High</option>
								<option value="moderate">⚠️ Moderate</option>
								<option value="low">📋 Low</option>
							</select>
						</div>

						{/* Status Filter */}
						<div>
							<select
								value={filterStatus}
								onChange={(e) => setFilterStatus(e.target.value)}
								className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 outline-none transition-all duration-300"
							>
								<option value="all">All Statuses</option>
								<option value="pending">Pending</option>
								<option value="assigned">Assigned</option>
								<option value="in-progress">In Progress</option>
								<option value="resolved">Resolved</option>
							</select>
						</div>
					</div>

					{/* Results Count */}
					<div className="mt-4 flex items-center justify-between text-sm text-gray-600">
						<span>
							Showing <span className="font-semibold text-indigo-600">{filtered.length}</span> of{' '}
							<span className="font-semibold">{cases.length}</span> cases
						</span>
						{(search || filterUrgency !== 'all' || filterStatus !== 'all') && (
							<button
								onClick={() => {
									setSearch('');
									setFilterUrgency('all');
									setFilterStatus('all');
								}}
								className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
								Clear Filters
							</button>
						)}
					</div>
				</div>

				{/* Cases Grid */}
				{filtered.length === 0 ? (
					<div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-12 text-center border-2 border-white">
						<div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
							<svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
						</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-2">
							{cases.length === 0 ? 'No cases yet' : 'No matching cases'}
						</h3>
						<p className="text-gray-600 mb-6">
							{cases.length === 0 
								? 'Start your first case to get instant AI-powered health assessment'
								: 'Try adjusting your filters to see more results'}
						</p>
						{cases.length === 0 && (
							<Link href="/patient/new-case">
								<button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
									Create Your First Case
								</button>
							</Link>
						)}
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{filtered.map((c) => (
							<Link href={`/patient/cases/${c.id}`} key={c.id}>
								<div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 border-2 border-white hover:border-indigo-300 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden">
									<div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300 rounded-3xl"></div>
									
									<div className="relative z-10">
										{/* Header */}
										<div className="flex items-start justify-between mb-4">
											<div className="flex items-center gap-3">
												<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
													#{c.id}
												</div>
												<div>
													<p className="font-bold text-gray-900">Case #{c.id}</p>
													<p className="text-sm text-gray-500">
														{new Date(c.createdAt).toLocaleDateString('en-US', { 
															month: 'short', 
															day: 'numeric', 
															year: 'numeric' 
														})}
													</p>
												</div>
											</div>
											<svg className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
											</svg>
										</div>

										{/* Description */}
										<p className="text-gray-700 line-clamp-2 mb-4">{c.description}</p>

										{/* AI Summary */}
										{c.triage?.summary && (
											<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 mb-4">
												<div className="flex items-start gap-2">
													<svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
													</svg>
													<div className="flex-1">
														<p className="text-xs font-semibold text-blue-900 mb-1">AI Analysis</p>
														<p className="text-sm text-blue-800 line-clamp-2">{c.triage.summary}</p>
													</div>
												</div>
											</div>
										)}

										{/* Badges */}
										<div className="flex flex-wrap gap-2">
											{c.triage && <UrgencyBadge urgency={c.triage.urgencyLevel} />}
											<StatusBadge status={c.status} />
											{c.triage?.aiModel && (
												<span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
													<span>🤖</span>
													{c.triage.aiModel.split('-')[0]}
												</span>
											)}
										</div>
									</div>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
