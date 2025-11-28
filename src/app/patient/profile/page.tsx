'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api-client';
import Navbar from '@/components/ui/Navbar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function PatientProfilePage() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState<'success' | 'error'>('success');
	const [form, setForm] = useState({ name: '', email: '' });
	const [isEditing, setIsEditing] = useState(false);

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
			setMessage('Profile updated successfully! ✨');
			setMessageType('success');
			setIsEditing(false);
		} catch (e) {
			setMessage('Failed to update profile. Please try again.');
			setMessageType('error');
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
		if (user) {
			setForm({ name: user.name, email: user.email });
		}
		setIsEditing(false);
		setMessage('');
	};

	if (authLoading) {
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

			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8 relative rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white overflow-hidden">
					<div className="absolute inset-0 bg-black/10"></div>
					<div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
					
					<div className="relative z-10 flex items-center gap-4">
						<div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-4xl">
							👤
						</div>
						<div>
							<h1 className="text-4xl font-bold">My Profile</h1>
							<p className="text-indigo-100 mt-1">Manage your account settings and preferences</p>
						</div>
					</div>
				</div>

				{/* Success/Error Message */}
				{message && (
					<div className={`mb-6 rounded-2xl p-4 border-2 ${
						messageType === 'success' 
							? 'bg-green-50 border-green-200' 
							: 'bg-red-50 border-red-200'
					} transition-all duration-300`}>
						<div className="flex items-center gap-3">
							{messageType === 'success' ? (
								<svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
								</svg>
							) : (
								<svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
								</svg>
							)}
							<p className={`font-medium ${messageType === 'success' ? 'text-green-800' : 'text-red-800'}`}>
								{message}
							</p>
						</div>
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-6">
						{/* Personal Information */}
						<div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 border-2 border-white">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
									<span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
										<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
										</svg>
									</span>
									Personal Information
								</h2>
								{!isEditing && (
									<button
										onClick={() => setIsEditing(true)}
										className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
									>
										<span className="flex items-center gap-2">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
											</svg>
											Edit
										</span>
									</button>
								)}
							</div>

							<div className="space-y-6">
								{/* Name Field */}
								<div>
									<label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
									{isEditing ? (
										<input
											type="text"
											value={form.name}
											onChange={(e) => setForm({ ...form, name: e.target.value })}
											className="w-full px-4 py-3 bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 outline-none transition-all duration-300 text-gray-900"
											placeholder="Enter your full name"
										/>
									) : (
										<div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl text-gray-900 font-medium">
											{form.name}
										</div>
									)}
								</div>

								{/* Email Field */}
								<div>
									<label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
									<div className="relative">
										<input
											type="email"
											value={form.email}
											disabled
											className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-xl text-gray-600 cursor-not-allowed"
										/>
										<div className="absolute right-4 top-1/2 transform -translate-y-1/2">
											<svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
											</svg>
										</div>
									</div>
									<p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										Email cannot be changed for security reasons
									</p>
								</div>

								{/* Action Buttons */}
								{isEditing && (
									<div className="flex gap-4 pt-4">
										<button
											onClick={handleSave}
											disabled={saving || !form.name}
											className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
										>
											{saving ? (
												<span className="flex items-center justify-center gap-2">
													<svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
														<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
														<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
													</svg>
													Saving...
												</span>
											) : (
												'Save Changes'
											)}
										</button>
										<button
											onClick={handleCancel}
											className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
										>
											Cancel
										</button>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Account Details */}
						<div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border-2 border-white">
							<h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
								<span className="text-xl">ℹ️</span>
								Account Details
							</h3>
							<div className="space-y-4 text-sm">
								<div>
									<p className="text-gray-600 mb-1">User ID</p>
									<p className="font-semibold text-gray-900">#{user?.id}</p>
								</div>
								<div>
									<p className="text-gray-600 mb-1">Role</p>
									<div className="inline-flex px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-xs font-semibold">
										<span className="capitalize">{user?.role}</span>
									</div>
								</div>
								<div>
									<p className="text-gray-600 mb-1">Member Since</p>
									<p className="font-medium text-gray-900">
										{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
											month: 'long', 
											year: 'numeric' 
										}) : 'N/A'}
									</p>
								</div>
							</div>
						</div>

						{/* Quick Stats */}
						<div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-xl p-6 border-2 border-indigo-200">
							<h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
								<span className="text-xl">📊</span>
								Activity
							</h3>
							<div className="space-y-3">
								<div className="flex items-center justify-between p-3 bg-white/80 rounded-xl">
									<span className="text-sm text-gray-600">Total Cases</span>
									<span className="font-bold text-indigo-600">-</span>
								</div>
								<div className="flex items-center justify-between p-3 bg-white/80 rounded-xl">
									<span className="text-sm text-gray-600">Active Cases</span>
									<span className="font-bold text-purple-600">-</span>
								</div>
								<div className="flex items-center justify-between p-3 bg-white/80 rounded-xl">
									<span className="text-sm text-gray-600">Resolved</span>
									<span className="font-bold text-green-600">-</span>
								</div>
							</div>
						</div>

						{/* Quick Actions */}
						<div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border-2 border-white">
							<h3 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h3>
							<div className="space-y-2">
								{[
									{ href: '/patient/dashboard', icon: '🏠', label: 'Dashboard' },
									{ href: '/patient/cases', icon: '📋', label: 'My Cases' },
									{ href: '/patient/new-case', icon: '➕', label: 'New Case' },
								].map((link, idx) => (
									<button
										key={idx}
										onClick={() => router.push(link.href)}
										className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:border-indigo-300 hover:shadow-md transition-all duration-300 flex items-center gap-3"
									>
										<span className="text-xl">{link.icon}</span>
										<span>{link.label}</span>
										<svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
										</svg>
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
