'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api-client';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import type { Area } from '@shared/types';

export default function AdminAreasPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);

  // New area form
  const [newArea, setNewArea] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    } else if (user) {
      fetchAreas();
    }
  }, [user, authLoading, router]);

  const fetchAreas = async () => {
    try {
      const response = await apiClient.get('/areas');
      setAreas(response.data || []);
    } catch (error) {
      console.error('Failed to fetch areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArea = async () => {
    if (!newArea.name.trim()) {
      alert('Area name is required');
      return;
    }

    try {
      await apiClient.post('/areas', newArea);
      setShowCreateModal(false);
      setNewArea({ name: '', description: '' });
      fetchAreas();
    } catch (error) {
      console.error('Failed to create area:', error);
      alert('Failed to create area');
    }
  };

  const handleUpdateArea = async () => {
    if (!editingArea || !editingArea.name.trim()) {
      alert('Area name is required');
      return;
    }

    try {
      await apiClient.put(`/areas/${editingArea.id}`, {
        name: editingArea.name,
        description: editingArea.description,
      });
      setEditingArea(null);
      fetchAreas();
    } catch (error) {
      console.error('Failed to update area:', error);
      alert('Failed to update area');
    }
  };

  const handleDeleteArea = async (areaId: number) => {
    if (!confirm('Are you sure you want to delete this area? This may affect assigned workers and cases.')) {
      return;
    }

    try {
      await apiClient.delete(`/areas/${areaId}`);
      fetchAreas();
    } catch (error) {
      console.error('Failed to delete area:', error);
      alert('Failed to delete area');
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Geographic Areas</h1>
            <p className="text-gray-600">
              Manage service areas for health worker assignments
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            + Create New Area
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Areas</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">{areas.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Coverage</p>
                <p className="text-3xl font-bold text-success-600 mt-1">{areas.length}</p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Workers/Area</p>
                <p className="text-3xl font-bold text-warning-600 mt-1">
                  {areas.length > 0 ? Math.round(areas.reduce((sum, a) => sum + (a.workerCount || 0), 0) / areas.length) : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Areas List */}
        {areas.length === 0 ? (
          <EmptyState
            title="No Areas Yet"
            description="Create your first geographic area to start organizing health worker assignments."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {areas.map((area) => (
              <Card
                key={area.id}
                className="hover:shadow-lg transition-shadow"
              >
                {editingArea?.id === area.id ? (
                  <div className="space-y-4">
                    <Input
                      label="Area Name *"
                      value={editingArea.name}
                      onChange={(e) =>
                        setEditingArea({ ...editingArea, name: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="Description"
                      value={editingArea.description || ''}
                      onChange={(e) =>
                        setEditingArea({ ...editingArea, description: e.target.value })
                      }
                    />
                    <div className="flex gap-2">
                      <Button variant="success" onClick={handleUpdateArea} className="flex-1">
                        Save
                      </Button>
                      <Button variant="secondary" onClick={() => setEditingArea(null)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {area.name}
                        </h3>
                        {area.description && (
                          <p className="text-sm text-gray-600 mb-3">{area.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Workers Assigned</span>
                        <span className="font-semibold text-gray-900">
                          {area.workerCount || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Cases</span>
                        <span className="font-semibold text-gray-900">
                          {area.caseCount || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Area ID</span>
                        <span className="font-mono text-xs text-gray-500">#{area.id}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                      <Button
                        variant="secondary"
                        onClick={() => setEditingArea(area)}
                        className="flex-1"
                      >
                        Edit
                      </Button>
                      <button
                        onClick={() => handleDeleteArea(area.id)}
                        className="flex-1 px-4 py-2 text-sm font-medium text-urgent-600 border border-urgent-200 rounded-lg hover:bg-urgent-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Create Area Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Area</h2>
              
              <div className="space-y-4">
                <Input
                  label="Area Name *"
                  value={newArea.name}
                  onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
                  placeholder="e.g., Downtown District, North Region"
                  required
                />

                <Input
                  label="Description (Optional)"
                  value={newArea.description}
                  onChange={(e) => setNewArea({ ...newArea, description: e.target.value })}
                  placeholder="Brief description of the geographic area"
                />

                <div className="flex gap-3 pt-4">
                  <Button variant="primary" onClick={handleCreateArea} className="flex-1">
                    Create Area
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewArea({ name: '', description: '' });
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
