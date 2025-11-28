'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api-client';
import Navbar from '@/components/ui/Navbar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatusBadge from '@/components/ui/StatusBadge';
import UrgencyBadge from '@/components/ui/UrgencyBadge';
import type { CaseWithTriage } from '@shared/types';

export default function PatientCaseDetailPage() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();
	const params = useParams();
	const id = params?.id;
	const [data, setData] = useState<CaseWithTriage | null>(null);
	const [loading, setLoading] = useState(true);
	const [retrying, setRetrying] = useState(false);

	useEffect(() => {
		if (!authLoading && (!user || user.role !== 'patient')) {
			router.push('/login');
		} else if (user && id) {
			fetchCase();
		}
	}, [user, authLoading, router, id]);

	const fetchCase = async () => {
		try {
			const res = await apiClient.get(`/cases/${id}`);
			setData(res.data);
		} catch (e) {
			console.error('Failed to fetch case', e);
		} finally {
			setLoading(false);
		}
	};

	const handleRetryTriage = async () => {
		if (!id) return;
		setRetrying(true);
		try {
			const res = await apiClient.post(`/cases/${id}/retriage`);
			setData(res.data);
		} catch (e) {
			console.error('Failed to retriage case', e);
		} finally {
			setRetrying(false);
		}
	};

	if (authLoading || loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	if (!data) {
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
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-12 text-center">
						<svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						<p className="text-xl text-gray-600">Case not found</p>
					</div>
				</div>
			</div>
		);
	}

	const urgencyConfig = {
		urgent: { bg: 'from-red-500 to-pink-600', icon: '🚨', text: 'Urgent' },
		high: { bg: 'from-orange-500 to-red-500', icon: '⚡', text: 'High Priority' },
		moderate: { bg: 'from-yellow-500 to-orange-500', icon: '⚠️', text: 'Moderate' },
		low: { bg: 'from-blue-500 to-indigo-500', icon: '📋', text: 'Low Priority' },
	};

	const currentUrgency = data.triage?.urgencyLevel ? urgencyConfig[data.triage.urgencyLevel as keyof typeof urgencyConfig] : null;

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

			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className={`mb-8 relative rounded-3xl bg-gradient-to-br ${currentUrgency?.bg || 'from-indigo-600 to-purple-600'} p-8 text-white overflow-hidden`}>
					<div className="absolute inset-0 bg-black/10"></div>
					<div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
					
					<div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
						<div className="flex items-center gap-4">
							<div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-3xl">
								{currentUrgency?.icon || '📋'}
							</div>
							<div>
								<h1 className="text-4xl font-bold">Case #{data.id}</h1>
								<p className="text-white/80 text-sm mt-1">
									Created {new Date(data.createdAt).toLocaleDateString('en-US', { 
										month: 'long', 
										day: 'numeric', 
										year: 'numeric',
										hour: '2-digit',
										minute: '2-digit'
									})}
								</p>
							</div>
						</div>
						<div className="flex gap-3">
							{data.triage && <UrgencyBadge urgency={data.triage.urgencyLevel} />}
							<StatusBadge status={data.status} />
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-6">
						{/* Symptoms */}
						<div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 border-2 border-white">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
								</div>
								<h2 className="text-2xl font-bold text-gray-900">Symptoms Description</h2>
							</div>
							<p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">{data.description}</p>
						</div>

						{/* AI Triage Summary */}
						{data.triage?.summary && (
							<div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-xl p-8 border-2 border-indigo-200">
								<div className="flex items-center gap-3 mb-4">
									<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
										<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
										</svg>
									</div>
									<h2 className="text-2xl font-bold text-gray-900">AI Analysis</h2>
								</div>
								<p className="text-gray-800 leading-relaxed text-lg mb-4">{data.triage.summary}</p>
								
								<button
									onClick={handleRetryTriage}
									disabled={retrying}
									className="group relative px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
								>
									{retrying ? (
										<span className="flex items-center gap-2">
											<svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
											</svg>
											Re-analyzing...
										</span>
									) : (
										<span className="flex items-center gap-2">
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
											</svg>
											Retry AI Triage
										</span>
									)}
								</button>
							</div>
						)}

						{/* Recommendations */}
						{data.triage?.recommendations && (
							<div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-xl p-8 border-2 border-green-200">
								<div className="flex items-center gap-3 mb-4">
									<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
										<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									</div>
									<h2 className="text-2xl font-bold text-gray-900">Recommendations</h2>
								</div>
								<p className="text-gray-800 leading-relaxed text-lg">{data.triage.recommendations}</p>
							</div>
						)}
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Case Info */}
						<div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border-2 border-white">
							<h3 className="text-lg font-bold text-gray-900 mb-4">Case Information</h3>
							<div className="space-y-4 text-sm">
								<div>
									<p className="text-gray-600 mb-1">Case ID</p>
									<p className="font-semibold text-gray-900">#{data.id}</p>
								</div>
								<div>
									<p className="text-gray-600 mb-1">Status</p>
									<StatusBadge status={data.status} />
								</div>
								{data.triage && (
									<div>
										<p className="text-gray-600 mb-1">Urgency Level</p>
										<UrgencyBadge urgency={data.triage.urgencyLevel} />
									</div>
								)}
								<div>
									<p className="text-gray-600 mb-1">Created</p>
									<p className="font-medium text-gray-900">
										{new Date(data.createdAt).toLocaleDateString('en-US', { 
											month: 'short', 
											day: 'numeric', 
											year: 'numeric' 
										})}
									</p>
								</div>
								{data.triage?.aiModel && (
									<div>
										<p className="text-gray-600 mb-1">AI Model</p>
										<p className="font-medium text-gray-900">{data.triage.aiModel}</p>
									</div>
								)}
							</div>
						</div>

						{/* Quick Actions */}
						<div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border-2 border-white">
							<h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
							<div className="space-y-3">
								<button
									onClick={() => router.push('/patient/cases')}
									className="w-full px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 transition-all duration-300 flex items-center justify-center gap-2"
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
									</svg>
									Back to All Cases
								</button>
								<button
									onClick={() => router.push('/patient/new-case')}
									className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2"
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
									</svg>
									Create New Case
								</button>
							</div>
						</div>

						{/* Urgency Guide */}
						<div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl shadow-xl p-6 border-2 border-amber-200">
							<h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
								<span>ℹ️</span>
								Urgency Levels
							</h3>
							<div className="space-y-2 text-xs">
								<div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
									<div className="w-3 h-3 bg-red-500 rounded-full"></div>
									<span className="font-semibold">Urgent</span> - Immediate care
								</div>
								<div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
									<div className="w-3 h-3 bg-orange-500 rounded-full"></div>
									<span className="font-semibold">High</span> - Within 24 hours
								</div>
								<div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
									<div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
									<span className="font-semibold">Moderate</span> - 2-3 days
								</div>
								<div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
									<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
									<span className="font-semibold">Low</span> - Routine care
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
