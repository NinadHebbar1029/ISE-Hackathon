'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api-client';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import type { User, Area } from '@shared/types';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, areasRes] = await Promise.all([
        apiClient.get('/cases/stats'),
        apiClient.get('/users'),
        apiClient.get('/areas'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setAreas(areasRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
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

  const statusCounts = stats?.byStatus?.reduce((acc: any, item: any) => {
    acc[item.status] = item.count;
    return acc;
  }, {}) || {};

  const totalCases = Number(
    String(Object.values(statusCounts).reduce((a, b) => Number(a) + Number(b), 0))
  );

  const byUrgency = (stats?.byUrgency ?? []).map((u: any) => ({
    label: u.urgency_level,
    value: Number(u.count),
    colorClass:
      u.urgency_level === 'critical'
        ? 'bg-urgent-500'
        : u.urgency_level === 'urgent'
        ? 'bg-warning-500'
        : u.urgency_level === 'moderate'
        ? 'bg-primary-500'
        : 'bg-green-500',
  }));

  const byStatusItems = Object.entries(statusCounts).map(([label, value]) => ({
    label,
    value: Number(value),
  }));

  const roleItems = ['patient', 'worker', 'doctor', 'admin'].map((role) => ({
    role,
    count: users.filter((u) => u.role === role).length,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar
        role="admin"
        links={[
          { href: '/admin/dashboard', label: 'Dashboard' },
          { href: '/admin/users', label: 'Users' },
          { href: '/admin/areas', label: 'Areas' },
          { href: '/admin/reports', label: 'Reports' },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 text-white p-8 mb-8 shadow-lg">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 2px, transparent 2px), radial-gradient(circle at 80% 30%, white 2px, transparent 2px), radial-gradient(circle at 40% 80%, white 2px, transparent 2px)'
          }} />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Administrator Dashboard</h1>
              <p className="mt-2 text-white/90">Monitor platform health, users, cases and areas at a glance.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/users">
                <Button className="bg-white text-primary-700 hover:bg-white/90" variant="primary">Manage Users</Button>
              </Link>
              <Link href="/admin/areas">
                <Button className="bg-white/10 hover:bg-white/20 border-white text-white" variant="secondary">Manage Areas</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Users"
            value={users.length}
            accent="primary"
            icon={
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary-600">
                <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.33 0-8 2.17-8 5v1h16v-1c0-2.83-3.67-5-8-5Z"/>
              </svg>
            }
          />
          <StatCard
            title="Total Cases"
            value={totalCases}
            accent="teal"
            icon={
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-teal-600">
                <path fill="currentColor" d="M20 6h-4V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v9a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V8a2 2 0 0 0-2-2ZM10 4h4v2h-4Zm9 13H5a1 1 0 0 1-1-1v-5h6v2h4v-2h6v5a1 1 0 0 1-1 1Z"/>
              </svg>
            }
          />
          <StatCard
            title="Active Areas"
            value={areas.length}
            accent="success"
            icon={
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-green-600">
                <path fill="currentColor" d="M3 11h18v10H3zM7 3h10v6H7z"/>
              </svg>
            }
          />
          <StatCard
            title="New Cases"
            value={statusCounts.new || 0}
            accent="warning"
            icon={
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-yellow-600">
                <path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10.012 10.012 0 0 0 12 2Zm1 15h-2v-2h2Zm0-4h-2V7h2Z"/>
              </svg>
            }
          />
        </div>

        {/* Distributions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Cases by Status</h2>
              <Link href="/admin/reports"><Button variant="secondary" size="sm">View Reports</Button></Link>
            </div>
            <ProgressBar items={byStatusItems} total={totalCases} />
          </Card>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Cases by Urgency</h2>
              <Link href="/admin/reports"><Button variant="secondary" size="sm">View Reports</Button></Link>
            </div>
            <ProgressBar items={byUrgency} />
          </Card>
        </div>

        {/* Users by Role and Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Users by Role</h2>
              <Link href="/admin/users">
                <Button variant="secondary" size="sm">Manage Users</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {roleItems.map(({ role, count }) => (
                <div key={role} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 capitalize">{role}s</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full ${role === 'patient' ? 'bg-primary-500' : role === 'worker' ? 'bg-teal-500' : role === 'doctor' ? 'bg-purple-500' : 'bg-gray-500'}`}
                      style={{ width: `${users.length ? Math.min(100, Math.round((count / users.length) * 100)) : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Areas</h2>
              <Link href="/admin/areas">
                <Button variant="primary" size="sm">Manage Areas</Button>
              </Link>
            </div>
            {areas.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No areas configured yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {areas.map((area) => (
                  <div
                    key={area.id}
                    className="group relative rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{area.name}</h3>
                      <span className="text-xs text-gray-500">ID: {area.id}</span>
                    </div>
                    {area.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">{area.description}</p>
                    )}
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-transparent transition group-hover:ring-primary-200" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
