'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api-client';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import UrgencyBadge from '@/components/ui/UrgencyBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import type { CaseWithTriage } from '@shared/types';

export default function PatientCasesPage() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();
	const [cases, setCases] = useState<CaseWithTriage[]>([]);
	const [search, setSearch] = useState('');
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
		if (!search) return true;
		const s = search.toLowerCase();
		return (
			c.description.toLowerCase().includes(s) ||
			c.id.toString().includes(s)
		);
	});

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
				<div className="flex justify-between items-center mb-6">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">My Cases</h1>
						<p className="text-gray-600 mt-1">Track the status of your medical cases</p>
					</div>
					<Link href="/patient/new-case">
						<button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">+ New Case</button>
					</Link>
				</div>

				<Card className="mb-6">
					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by ID or description..."
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
					/>
				</Card>

						{filtered.length === 0 ? (
					<Card>
						<p className="text-center text-gray-600 py-8">No cases found.</p>
					</Card>
				) : (
					<div className="space-y-4">
						{filtered.map((c) => (
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
						))}
					</div>
				)}
			</div>
		</div>
	);
}
