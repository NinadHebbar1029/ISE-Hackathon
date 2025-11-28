'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api-client';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
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

			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{!data ? (
					<Card>
						<p className="text-center text-gray-600 py-8">Case not found</p>
					</Card>
				) : (
					<Card>
						<div className="flex items-start justify-between mb-2">
							<h1 className="text-2xl font-bold text-gray-900">Case #{data.id}</h1>
							<span className="text-sm text-gray-500">{new Date(data.createdAt).toLocaleString()}</span>
						</div>
						<div className="flex gap-2 mb-4">
							{data.triage && <UrgencyBadge urgency={data.triage.urgencyLevel} />}
							<StatusBadge status={data.status} />
						</div>
						<div className="space-y-4">
							<div>
								<p className="text-sm font-medium text-gray-700 mb-1">Symptoms Description</p>
								<p className="text-gray-800 whitespace-pre-wrap">{data.description}</p>
							</div>
							{data.triage?.summary && (
								<div>
									<p className="text-sm font-medium text-gray-700 mb-1">AI Triage Summary</p>
									<p className="text-gray-800">{data.triage.summary}</p>
								</div>
							)}

							<div className="flex justify-end mt-4">
								<Button variant="secondary" onClick={handleRetryTriage} disabled={retrying}>
									{retrying ? 'Re-running AI triage…' : 'Retry AI triage'}
								</Button>
							</div>
							{data.triage?.recommendations && (
								<div>
									<p className="text-sm font-medium text-gray-700 mb-1">Recommendations</p>
									<p className="text-gray-800">{data.triage.recommendations}</p>
								</div>
							)}
						</div>
					</Card>
				)}
			</div>
		</div>
	);
}
