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
import StatCard from '@/components/ui/StatCard';
import type { Area, CaseWithTriage } from '@shared/types';

export default function WorkerProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [myCases, setMyCases] = useState<CaseWithTriage[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, resolved: 0 });

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    languages: '',
    assignedAreas: [] as number[],
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'worker')) {
      router.push('/login');
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      const [areasRes, casesRes] = await Promise.all([
        apiClient.get('/areas'),
        apiClient.get('/cases'),
      ]);
      setAreas(areasRes.data);
      const allCases: CaseWithTriage[] = casesRes.data || [];
      if (user?.id) {
        const mine = allCases.filter((c) => c.createdByUserId === user.id);
        setMyCases(mine);
        const activeStatuses = new Set(['new','assigned','in_progress','awaiting_doctor']);
        const resolvedStatuses = new Set(['completed','closed','resolved']);
        setStats({
          total: mine.length,
          active: mine.filter((c) => activeStatuses.has(c.status)).length,
          resolved: mine.filter((c) => resolvedStatuses.has(c.status)).length,
        });
      }
      
      if (user) {
        setProfileData({
          name: user.name,
          email: user.email,
          languages: '',
          assignedAreas: [],
        });
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      await apiClient.put(`/users/${user?.id}`, {
        name: profileData.name,
      });
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
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
        role="worker"
        links={[
          { href: '/worker/dashboard', label: 'Dashboard' },
          { href: '/worker/cases', label: 'Cases' },
          { href: '/worker/new-case', label: 'New Case' },
          { href: '/worker/profile', label: 'Profile' },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="mb-8 rounded-2xl border bg-gradient-to-br from-gray-50 to-white border-gray-100 p-6">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 shrink-0 rounded-xl bg-primary-600 text-white flex items-center justify-center text-xl font-bold">
              {user?.name ? user.name.split(' ').map(n => n[0]).slice(0,2).join('') : 'HW'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{user?.name || 'Health Worker'}</h1>
              <p className="text-gray-600 mt-1">Manage your account and preferences</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="px-2.5 py-1 rounded-full bg-primary-100 text-primary-800">Role: Worker</span>
                {user?.id && (
                  <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">ID: {user.id}</span>
                )}
                {user?.createdAt && (
                  <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="My Cases"
            value={stats.total}
            subtitle="Created by you"
            accent="primary"
          />
          <StatCard
            title="Active"
            value={stats.active}
            subtitle="New, assigned, in progress"
            accent="warning"
          />
          <StatCard
            title="Resolved"
            value={stats.resolved}
            subtitle="Completed or closed"
            accent="success"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Enter your full name"
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={profileData.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500">Email cannot be changed. Contact admin if needed.</p>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Language Skills</h2>
              <div className="space-y-4">
                <Input
                  label="Languages Spoken"
                  value={profileData.languages}
                  onChange={(e) => setProfileData({ ...profileData, languages: e.target.value })}
                  placeholder="e.g., English, Spanish, French"
                />
                <p className="text-sm text-gray-500">
                  Enter languages you can communicate in, separated by commas
                </p>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Assigned Areas</h2>
              <div className="space-y-3">
                {areas.length === 0 ? (
                  <p className="text-gray-500 text-sm">No areas configured yet. Contact your administrator.</p>
                ) : (
                  areas.map((area) => (
                    <label key={area.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileData.assignedAreas.includes(area.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfileData({
                              ...profileData,
                              assignedAreas: [...profileData.assignedAreas, area.id],
                            });
                          } else {
                            setProfileData({
                              ...profileData,
                              assignedAreas: profileData.assignedAreas.filter(id => id !== area.id),
                            });
                          }
                        }}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="font-medium text-gray-900">{area.name}</span>
                    </label>
                  ))
                )}
              </div>
              <p className="text-sm text-gray-500 mt-3">
                You'll receive cases from selected areas. Changes may require admin approval.
              </p>
            </Card>

            {message && (
              <div className={`px-4 py-3 rounded ${
                message.includes('success') 
                  ? 'bg-success-50 border border-success-200 text-success-700'
                  : 'bg-urgent-50 border border-urgent-200 text-urgent-700'
              }`}>
                {message}
              </div>
            )}

            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
              className="w-full"
            >
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
                  <p className="font-medium text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Recent My Cases</h3>
              {myCases.length === 0 ? (
                <p className="text-sm text-gray-500">No cases created by you yet.</p>
              ) : (
                <ul className="divide-y">
                  {myCases.slice(0,5).map((c) => (
                    <li key={c.id} className="py-2 text-sm flex items-center justify-between">
                      <span className="text-gray-700">Case #{c.id}</span>
                      <span className="text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
