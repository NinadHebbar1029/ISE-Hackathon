'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api-client';
import Navbar from '@/components/ui/Navbar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatusBadge from '@/components/ui/StatusBadge';
import UrgencyBadge from '@/components/ui/UrgencyBadge';
import type { CaseWithTriage } from '@shared/types';

export default function PatientDashboardPage() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();
	const [cases, setCases] = useState<CaseWithTriage[]>([]);
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState({ total: 0, urgent: 0, high: 0, resolved: 0 });

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
			const casesData = res.data || [];
			setCases(casesData);
			
			// Calculate stats
			const urgent = casesData.filter((c: any) => c.triage?.urgencyLevel === 'urgent').length;
			const high = casesData.filter((c: any) => c.triage?.urgencyLevel === 'high').length;
			const resolved = casesData.filter((c: any) => c.status === 'resolved').length;
			setStats({ total: casesData.length, urgent, high, resolved });
		} catch (e) {
			console.error('Failed to load cases', e);
		} finally {
			setLoading(false);
		}
	};

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
				{/* Hero Section */}
				<div className="relative mb-8 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 md:p-12 text-white overflow-hidden">
					<div className="absolute inset-0 bg-black/10"></div>
					<div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
					<div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
					
					<div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
						<div>
							<h1 className="text-4xl md:text-5xl font-bold mb-3">
								Welcome back{user?.name ? `, ${user.name}` : ''}! 👋
							</h1>
							<p className="text-blue-100 text-lg max-w-2xl">
								Your health journey at a glance. Track your cases, view AI triage results, and connect with healthcare professionals.
							</p>
						</div>
						<Link href="/patient/new-case">
							<button className="group relative px-6 py-4 bg-white text-indigo-600 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
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

				{/* Stats Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					{[
						{ label: 'Total Cases', value: stats.total, icon: '📋', gradient: 'from-blue-500 to-cyan-500', bgGradient: 'from-blue-50 to-cyan-50' },
						{ label: 'Urgent', value: stats.urgent, icon: '🚨', gradient: 'from-red-500 to-pink-500', bgGradient: 'from-red-50 to-pink-50' },
						{ label: 'High Priority', value: stats.high, icon: '⚡', gradient: 'from-orange-500 to-yellow-500', bgGradient: 'from-orange-50 to-yellow-50' },
						{ label: 'Resolved', value: stats.resolved, icon: '✅', gradient: 'from-green-500 to-emerald-500', bgGradient: 'from-green-50 to-emerald-50' },
					].map((stat, idx) => (
						<div
							key={idx}
							className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden"
						>
							<div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
							<div className="relative z-10">
								<div className="flex items-center justify-between mb-4">
									<div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-2xl shadow-lg`}>
										{stat.icon}
									</div>
									<div className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
										{stat.value}
									</div>
								</div>
								<p className="text-gray-600 font-medium">{stat.label}</p>
							</div>
						</div>
					))}
				</div>

				{/* Recent Cases */}
				<div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h2 className="text-2xl font-bold text-gray-900">Recent Cases</h2>
							<p className="text-gray-600 mt-1">Your latest health consultations</p>
						</div>
						<Link href="/patient/cases">
							<button className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2 group">
								View All
								<svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
								</svg>
							</button>
						</Link>
					</div>

					{cases.length === 0 ? (
						<div className="text-center py-12">
							<div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
								<svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-2">No cases yet</h3>
							<p className="text-gray-600 mb-6">Start your first case to get instant AI-powered health assessment</p>
							<Link href="/patient/new-case">
								<button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
									Start Your First Case
								</button>
							</Link>
						</div>
					) : (
						<div className="space-y-4">
							{cases.slice(0, 5).map((c) => (
								<Link href={`/patient/cases/${c.id}`} key={c.id}>
									<div className="group relative bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 cursor-pointer">
										<div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 rounded-2xl transition-all duration-300"></div>
										
										<div className="relative z-10 flex items-start justify-between">
											<div className="flex-1 space-y-3">
												<div className="flex items-center gap-3">
													<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
														#{c.id}
													</div>
													<div>
														<p className="text-lg font-semibold text-gray-900">Case #{c.id}</p>
														<p className="text-sm text-gray-500">
															{new Date(c.createdAt).toLocaleDateString('en-US', { 
																year: 'numeric', 
																month: 'long', 
																day: 'numeric' 
															})}
														</p>
													</div>
												</div>
												
												<p className="text-gray-700 line-clamp-2 pl-13">{c.description}</p>
												
												{c.triage?.summary && (
													<div className="flex items-start gap-2 pl-13 bg-blue-50 rounded-xl p-3">
														<svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
														</svg>
														<div>
															<p className="text-sm font-medium text-blue-900 mb-1">AI Analysis</p>
															<p className="text-sm text-blue-700">{c.triage.summary}</p>
														</div>
													</div>
												)}
												
												<div className="flex flex-wrap gap-2 pl-13">
													{c.triage && <UrgencyBadge urgency={c.triage.urgencyLevel} />}
													<StatusBadge status={c.status} />
													{c.triage?.aiModel && (
														<span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
															AI: {c.triage.aiModel}
														</span>
													)}
												</div>
											</div>
											
											<svg className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
											</svg>
										</div>
									</div>
								</Link>
							))}
						</div>
					)}
				</div>

				{/* Quick Actions */}
				<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
					{[
						{
							title: 'New Consultation',
							description: 'Start a new case with AI triage',
							icon: (
								<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
								</svg>
							),
							href: '/patient/new-case',
							gradient: 'from-blue-500 to-indigo-500'
						},
						{
							title: 'View All Cases',
							description: 'Browse your medical history',
							icon: (
								<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
							),
							href: '/patient/cases',
							gradient: 'from-purple-500 to-pink-500'
						},
						{
							title: 'Update Profile',
							description: 'Manage your information',
							icon: (
								<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
							),
							href: '/patient/profile',
							gradient: 'from-green-500 to-emerald-500'
						},
					].map((action, idx) => (
						<Link href={action.href} key={idx}>
							<div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden">
								<div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
								<div className="relative z-10">
									<div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
										{action.icon}
									</div>
									<h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
									<p className="text-gray-600 text-sm">{action.description}</p>
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
