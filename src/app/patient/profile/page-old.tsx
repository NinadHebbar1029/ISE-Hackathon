'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api-client';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function PatientProfilePage() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState('');
	const [form, setForm] = useState({ name: '', email: '' });

	useEffect(() => {
		if (!authLoading && (!user || user.role !== 'patient')) {
			router.push('/login');
		} else if (user) {
			setForm({ name: user.name, email: user.email });
		}
	}, [user, authLoading, router]);

	const handleSave = async () => {
		setSaving(true);
		setMessage('');
		try {
			await apiClient.put(`/users/${user?.id}`, { name: form.name });
			setMessage('Profile updated successfully');
		} catch (e) {
			setMessage('Failed to update profile');
		} finally {
			setSaving(false);
		}
	};

	if (authLoading) {
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

			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
					<p className="text-gray-600 mt-1">Manage your account details</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2 space-y-6">
						<Card>
							<h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
							<div className="space-y-4">
								<Input
									label="Full Name"
									value={form.name}
									onChange={(e) => setForm({ ...form, name: e.target.value })}
									placeholder="Enter your full name"
								/>
								<Input
									label="Email"
									type="email"
									value={form.email}
									disabled
									className="bg-gray-50"
								/>
								<p className="text-sm text-gray-500">Email cannot be changed.</p>
							</div>
						</Card>

						{message && (
							<div className={`px-4 py-3 rounded ${
								message.includes('success') ? 'bg-success-50 border border-success-200 text-success-700' : 'bg-urgent-50 border border-urgent-200 text-urgent-700'
							}`}>
								{message}
							</div>
						)}

						<Button variant="primary" onClick={handleSave} disabled={saving} className="w-full">
							{saving ? 'Saving...' : 'Save Changes'}
						</Button>
					</div>

					<div className="space-y-6">
						<Card>
							<h3 className="font-semibold text-gray-900 mb-3">Account Details</h3>
							<div className="space-y-3 text-sm">
								<div>
									<p className="text-gray-600">Role</p>
									<p className="font-medium text-gray-900 capitalize">{user?.role}</p>
								</div>
								<div>
									<p className="text-gray-600">User ID</p>
									<p className="font-medium text-gray-900">{user?.id}</p>
								</div>
								<div>
									<p className="text-gray-600">Member Since</p>
									<p className="font-medium text-gray-900">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
								</div>
							</div>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
