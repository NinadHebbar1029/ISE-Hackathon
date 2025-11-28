'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api-client';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DoctorProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [languages, setLanguages] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'doctor')) {
      router.push('/login');
    } else if (user) {
      loadProfile();
    }
  }, [user, authLoading, router]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const response = await apiClient.get(`/users/${user.id}`);
      const userData = response.data;
      
      setName(userData.name || '');
      setEmail(userData.email || '');
      setSpecialties(userData.specialties?.join(', ') || '');
      setLanguages(userData.languages?.join(', ') || '');
      setBio(userData.bio || '');
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setMessage('');

    try {
      await apiClient.put(`/users/${user.id}`, {
        name,
        specialties: specialties.split(',').map(s => s.trim()).filter(Boolean),
        languages: languages.split(',').map(l => l.trim()).filter(Boolean),
        bio,
      });

      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
      setMessage('Failed to update profile. Please try again.');
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
        role="doctor"
        links={[
          { href: '/doctor/dashboard', label: 'Dashboard' },
          { href: '/doctor/cases', label: 'Case Queue' },
          { href: '/doctor/history', label: 'History' },
          { href: '/doctor/profile', label: 'Profile' },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Profile</h1>
          <p className="text-gray-600">
            Manage your professional information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
              
              <div className="space-y-4">
                <Input
                  label="Full Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. John Smith"
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled
                  helperText="Email cannot be changed"
                />
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Professional Details</h2>
              
              <div className="space-y-4">
                <Input
                  label="Medical Specialties"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  placeholder="General Practice, Internal Medicine, Pediatrics"
                  helperText="Separate multiple specialties with commas"
                />

                <Input
                  label="Languages Spoken"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="English, Spanish, French"
                  helperText="Separate multiple languages with commas"
                />

                <Textarea
                  label="Professional Bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={5}
                  placeholder="Brief overview of your medical background, experience, and areas of expertise..."
                />
              </div>
            </Card>

            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.includes('success')
                    ? 'bg-success-50 text-success-700 border border-success-200'
                    : 'bg-urgent-50 text-urgent-700 border border-urgent-200'
                }`}
              >
                {message}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={saving || !name.trim()}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="secondary" onClick={loadProfile}>
                Reset
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Account Details</h3>
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
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Professional Guidelines</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Maintain patient confidentiality</p>
                <p>• Provide evidence-based advice</p>
                <p>• Document all consultations</p>
                <p>• Escalate emergencies promptly</p>
                <p>• Follow medical ethics standards</p>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Quick Tips</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>💡 Keep specialties updated for better case matching</p>
                <p>💡 Language skills help serve diverse communities</p>
                <p>💡 A complete bio builds patient trust</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
