'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api-client';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import type { User, Area } from '@shared/types';

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New user form
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient' as 'patient' | 'worker' | 'doctor' | 'admin',
    areaIds: [] as number[],
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      const [usersRes, areasRes] = await Promise.all([
        apiClient.get('/users'),
        apiClient.get('/areas'),
      ]);
      setUsers(usersRes.data || []);
      setFilteredUsers(usersRes.data || []);
      setAreas(areasRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...users];

    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.id.toString().includes(term)
      );
    }

    setFilteredUsers(result);
  }, [searchTerm, roleFilter, users]);

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await apiClient.post('/users', newUser);
      setShowCreateModal(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'patient',
        areaIds: [],
      });
      fetchData();
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await apiClient.delete(`/users/${userId}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const roleColors = {
    patient: 'bg-primary-100 text-primary-700',
    worker: 'bg-warning-100 text-warning-700',
    doctor: 'bg-success-100 text-success-700',
    admin: 'bg-urgent-100 text-urgent-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">
              Manage all users in the VerboCare system
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            + Create New User
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-3xl font-bold text-primary-600 mt-1">{users.length}</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-gray-600">Patients</p>
            <p className="text-3xl font-bold text-primary-600 mt-1">
              {users.filter((u) => u.role === 'patient').length}
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-gray-600">Health Workers</p>
            <p className="text-3xl font-bold text-warning-600 mt-1">
              {users.filter((u) => u.role === 'worker').length}
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-gray-600">Doctors</p>
            <p className="text-3xl font-bold text-success-600 mt-1">
              {users.filter((u) => u.role === 'doctor').length}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Search Users"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select
              label="Filter by Role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'patient', label: 'Patients' },
                { value: 'worker', label: 'Health Workers' },
                { value: 'doctor', label: 'Doctors' },
                { value: 'admin', label: 'Administrators' },
              ]}
            />
          </div>
        </Card>

        {/* Results */}
        {searchTerm || roleFilter !== 'all' ? (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredUsers.length}</span> of{' '}
              <span className="font-semibold">{users.length}</span> users
            </p>
          </div>
        ) : null}

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <EmptyState
            title="No Users Found"
            description="Try adjusting your search or filter criteria."
          />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-700 font-semibold text-sm">
                              {userItem.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                            <div className="text-sm text-gray-500">ID: {userItem.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {userItem.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                            roleColors[userItem.role]
                          }`}
                        >
                          {userItem.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userItem.createdAt
                          ? new Date(userItem.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteUser(userItem.id)}
                          className="text-urgent-600 hover:text-urgent-900"
                          disabled={userItem.id === user?.id}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New User</h2>
              
              <div className="space-y-4">
                <Input
                  label="Full Name *"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="John Smith"
                  required
                />

                <Input
                  label="Email Address *"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />

                <Input
                  label="Password *"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />

                <Select
                  label="Role *"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      role: e.target.value as 'patient' | 'worker' | 'doctor' | 'admin',
                    })
                  }
                  options={[
                    { value: 'patient', label: 'Patient' },
                    { value: 'worker', label: 'Health Worker' },
                    { value: 'doctor', label: 'Doctor' },
                    { value: 'admin', label: 'Administrator' },
                  ]}
                />

                <div className="flex gap-3 pt-4">
                  <Button variant="primary" onClick={handleCreateUser} className="flex-1">
                    Create User
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewUser({
                        name: '',
                        email: '',
                        password: '',
                        role: 'patient',
                        areaIds: [],
                      });
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
