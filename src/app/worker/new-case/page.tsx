'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api-client';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import type { Area } from '@shared/types';

export default function WorkerNewCasePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    location: '',
    language: 'en',
    description: '',
    areaId: '',
  });
  const descriptionLength = formData.description.length;

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'worker')) {
      router.push('/login');
    } else if (user) {
      fetchAreas();
    }
  }, [user, authLoading, router]);

  const fetchAreas = async () => {
    try {
      const response = await apiClient.get('/areas');
      setAreas(response.data);
    } catch (error) {
      console.error('Failed to fetch areas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/cases', {
        ...formData,
        patientAge: formData.patientAge ? parseInt(formData.patientAge) : undefined,
        areaId: formData.areaId ? parseInt(formData.areaId) : undefined,
      });

      router.push(`/worker/cases/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create case. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-primary-50 to-white border border-primary-100 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Submit a New Case</h1>
              <p className="text-gray-600 mt-2">Provide patient details and symptoms. Our AI will triage the case instantly.</p>
            </div>
            <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-white/70 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-primary-600">
                <path d="M7.5 3.75A3.75 3.75 0 0012 7.5h.75v.75A3.75 3.75 0 0016.5 12v.75h.75A3.75 3.75 0 0021 16.5v.75h-1.5A2.25 2.25 0 0017.25 19.5v1.5h-.75a3.75 3.75 0 01-3.75-3.75v-.75H12A3.75 3.75 0 018.25 12v-.75H7.5A3.75 3.75 0 003.75 7.5V6h1.5A2.25 2.25 0 007.5 3.75z" />
              </svg>
            </div>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Patient Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Patient Name *"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                placeholder="Enter patient's full name"
                required
                helperText="Required for identification"
              />

              <Input
                type="number"
                label="Patient Age"
                value={formData.patientAge}
                onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                placeholder="Age in years"
                helperText="Optional"
              />
              </div>
            </div>

            {/* Case Context */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Case Context</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Patient's current location"
                helperText="Optional — include area or landmark if helpful"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area Assignment
                </label>
                <select
                  value={formData.areaId}
                  onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="">Select an area</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">Optional — assign if known, or leave unassigned</p>
              </div>
              </div>
            </div>

            {/* Communication */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Communication</h2>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient's Preferred Language</label>
                  <div className="flex flex-wrap gap-2">
                    {['en','es','fr','hi','zh'].map((lng) => (
                      <button
                        type="button"
                        key={lng}
                        onClick={() => setFormData({ ...formData, language: lng })}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                          formData.language === lng ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {lng === 'en' ? 'English' : lng === 'es' ? 'Spanish' : lng === 'fr' ? 'French' : lng === 'hi' ? 'Hindi' : 'Chinese'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Textarea
              label="Symptoms Description *"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={8}
              placeholder="Describe the patient's symptoms in detail. Include onset, severity, duration, and any other relevant medical information..."
            />
            <div className="flex items-center justify-between -mt-4">
              <p className="text-sm text-gray-500">Be as specific as possible. Avoid personally identifiable information.</p>
              <p className="text-sm text-gray-400">{descriptionLength} characters</p>
            </div>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <h3 className="font-medium text-primary-900 mb-2">Submission Process:</h3>
              <ul className="text-sm text-primary-800 space-y-1">
                <li>• AI will automatically triage the case based on symptoms</li>
                <li>• Urgency level will be assigned (critical, urgent, moderate, routine)</li>
                <li>• Case will be visible to assigned area workers and doctors</li>
                <li>• Patient can be notified via their account if they have one</li>
              </ul>
            </div>

            {error && (
              <div className="bg-urgent-50 border border-urgent-200 text-urgent-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={loading || !formData.description || !formData.patientName}
              >
                {loading ? 'Submitting...' : 'Submit Case'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/worker/cases')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
