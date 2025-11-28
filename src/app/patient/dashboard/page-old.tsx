'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api-client';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatusBadge from '@/components/ui/StatusBadge';
import UrgencyBadge from '@/components/ui/UrgencyBadge';
import type { CaseWithTriage } from '@shared/types';

export default function PatientDashboardPage() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();
	const [cases, setCases] = useState<CaseWithTriage[]>([]);
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
				role="patient"
				links={[
					{ href: '/patient/dashboard', label: 'Dashboard' },
					{ href: '/patient/cases', label: 'My Cases' },
					{ href: '/patient/new-case', label: 'New Case' },
					{ href: '/patient/profile', label: 'Profile' },
				]}
			/>

			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8 rounded-2xl bg-gradient-to-br from-primary-50 to-white border border-primary-100 p-6">
					<div className="flex items-start justify-between gap-4">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">Welcome{user?.name ? `, ${user.name}` : ''}</h1>
							<p className="text-gray-600 mt-2">View your recent cases and start a new one if needed.</p>
						</div>
						<Link href="/patient/new-case">
							<button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">+ New Case</button>
						</Link>
					</div>
				</div>

				<div className="space-y-4">
					<h2 className="text-xl font-semibold text-gray-900">Recent Cases</h2>
								{cases.length === 0 ? (
						<Card>
							<div className="text-center py-8">
								<p className="text-gray-600 mb-4">You have no cases yet.</p>
								<Link href="/patient/new-case">
									<button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">Start a New Case</button>
								</Link>
							</div>
						</Card>
					) : (
									cases.slice(0,5).map((c) => (
							<Link href={`/patient/cases/${c.id}`} key={c.id}>
								<Card hover>
									<div className="flex items-start justify-between">
										<div className="space-y-1">
											<p className="text-gray-900 font-medium">Case #{c.id}</p>
														<p className="text-sm text-gray-600 line-clamp-2">{c.description}</p>
														<p className="text-xs text-gray-500">
															{c.triage?.summary ? (
																<>AI Summary: {c.triage.summary}</>
															) : (
																<>AI triage pending…</>
															)}
														</p>
											<div className="flex gap-2 pt-1">
												{c.triage && <UrgencyBadge urgency={c.triage.urgencyLevel} />}
												<StatusBadge status={c.status} />
											</div>
										</div>
										<span className="text-sm text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
									</div>
								</Card>
							</Link>
						))
					)}
				</div>
			</div>
		</div>
	);
}
