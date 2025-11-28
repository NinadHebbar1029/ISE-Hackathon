'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api-client';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import UrgencyBadge from '@/components/ui/UrgencyBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import type { CaseWithTriage, Message } from '@shared/types';

export default function DoctorCaseDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const caseId = params?.id;

  const [caseData, setCaseData] = useState<CaseWithTriage | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [advice, setAdvice] = useState('');
  const [aiAdvice, setAiAdvice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draftingAdvice, setDraftingAdvice] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'doctor')) {
      router.push('/login');
    } else if (user && caseId) {
      fetchCaseData();
    }
  }, [user, authLoading, router, caseId]);

  const fetchCaseData = async () => {
    try {
      const [caseRes, messagesRes] = await Promise.all([
        apiClient.get(`/cases/${caseId}`),
        apiClient.get(`/cases/${caseId}/messages`),
      ]);
      setCaseData(caseRes.data);
      setMessages(messagesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch case:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDraftAdvice = async () => {
    if (!caseData) return;

    setDraftingAdvice(true);
    try {
      const response = await apiClient.post('/ai/draft-advice', {
        symptoms: caseData.description,
        triageSummary: caseData.triage?.summary || '',
      });
      setAiAdvice(response.data.advice);
      setAdvice(response.data.advice); // Pre-fill with AI draft
    } catch (error) {
      console.error('Failed to draft advice:', error);
    } finally {
      setDraftingAdvice(false);
    }
  };

  const handleSubmitAdvice = async () => {
    if (!advice.trim()) return;

    setSaving(true);
    try {
      await apiClient.post(`/cases/${caseId}/messages`, {
        content: `[DOCTOR ADVICE]\n\n${advice}`,
      });
      
      await apiClient.put(`/cases/${caseId}`, {
        status: 'in_progress',
      });

      router.push('/doctor/cases');
    } catch (error) {
      console.error('Failed to submit advice:', error);
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

  if (!caseData) {
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
          <Card>
            <p className="text-center text-gray-600">Case not found</p>
          </Card>
        </div>
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
        <div className="mb-6">
          <Button variant="secondary" onClick={() => router.back()}>
            ← Back to Queue
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Header */}
            <Card className={
              caseData.triage?.urgencyLevel === 'critical'
                ? 'border-l-4 border-l-urgent-600'
                : caseData.triage?.urgencyLevel === 'urgent'
                ? 'border-l-4 border-l-warning-600'
                : ''
            }>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Case #{caseData.id} - Medical Review
                  </h1>
                  <div className="flex gap-3">
                    {caseData.triage && (
                      <UrgencyBadge urgency={caseData.triage.urgencyLevel} />
                    )}
                    <StatusBadge status={caseData.status} />
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Submitted: {new Date(caseData.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="space-y-4">
                {caseData.patientName && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Patient</p>
                      <p className="text-gray-900 font-medium">{caseData.patientName}</p>
                    </div>
                    {caseData.patientAge && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Age</p>
                        <p className="text-gray-900">{caseData.patientAge} years</p>
                      </div>
                    )}
                  </div>
                )}

                {caseData.location && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Location</p>
                    <p className="text-gray-900">{caseData.location}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Patient's Description of Symptoms</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{caseData.description}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* AI Triage Analysis */}
            {caseData.triage && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">AI Triage Analysis</h2>
                  <span className="text-xs px-3 py-1 bg-primary-100 text-primary-700 rounded-full">
                    AI Generated
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Clinical Summary</p>
                    <p className="text-gray-900">{caseData.triage.summary}</p>
                  </div>

                  {caseData.triage.symptoms && caseData.triage.symptoms.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Identified Symptoms</p>
                      <div className="flex flex-wrap gap-2">
                        {caseData.triage.symptoms.map((symptom, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {caseData.triage.recommendations && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">AI Recommendations</p>
                      <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                        <p className="text-sm text-warning-900">{caseData.triage.recommendations}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Doctor's Medical Advice */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Provide Medical Advice</h2>
              
              {!aiAdvice ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Use AI to draft initial advice based on the case details, or write your own from scratch.
                  </p>
                  <Button
                    variant="primary"
                    onClick={handleDraftAdvice}
                    disabled={draftingAdvice}
                    className="w-full"
                  >
                    {draftingAdvice ? (
                      <span className="flex items-center justify-center gap-2">
                        <LoadingSpinner size="sm" />
                        Drafting with AI...
                      </span>
                    ) : (
                      '✨ Draft Advice with AI'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 mb-4">
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-primary-900 mb-2">AI-Generated Draft:</p>
                    <p className="text-sm text-primary-800 whitespace-pre-wrap">{aiAdvice}</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Review and modify the AI-generated advice below before submitting to patient.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <Textarea
                  label="Your Medical Advice *"
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  rows={10}
                  placeholder="Provide your medical advice, recommendations, and next steps for the patient..."
                  required
                />

                <div className="flex gap-3">
                  <Button
                    variant="success"
                    onClick={handleSubmitAdvice}
                    disabled={saving || !advice.trim()}
                    className="flex-1"
                  >
                    {saving ? 'Submitting...' : 'Submit Medical Advice'}
                  </Button>
                  {aiAdvice && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setAiAdvice('');
                        setAdvice('');
                      }}
                    >
                      Clear & Redraft
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Case Notes & Messages */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Case Notes & Communication</h2>
              
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No messages or notes yet</p>
                ) : (
                  messages.map((msg) => {
                    const isWorkerNote = msg.content.startsWith('[WORKER NOTE]');
                    const isDoctorAdvice = msg.content.startsWith('[DOCTOR ADVICE]');
                    const displayContent = msg.content
                      .replace('[WORKER NOTE] ', '')
                      .replace('[DOCTOR ADVICE]\n\n', '');
                    
                    return (
                      <div
                        key={msg.id}
                        className={`border-l-4 pl-4 py-2 ${
                          isDoctorAdvice 
                            ? 'border-success-500 bg-success-50'
                            : isWorkerNote 
                            ? 'border-warning-500 bg-warning-50' 
                            : 'border-primary-500'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium text-gray-900 flex items-center gap-2">
                            {msg.senderName || 'Unknown'}
                            {isDoctorAdvice && (
                              <span className="text-xs px-2 py-0.5 bg-success-200 text-success-800 rounded">
                                MEDICAL ADVICE
                              </span>
                            )}
                            {isWorkerNote && (
                              <span className="text-xs px-2 py-0.5 bg-warning-200 text-warning-800 rounded">
                                WORKER NOTE
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{displayContent}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Case Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {caseData.status.replace('_', ' ')}
                  </p>
                </div>
                {caseData.area && (
                  <div>
                    <p className="text-gray-600">Area</p>
                    <p className="font-medium text-gray-900">{caseData.area.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600">Language</p>
                  <p className="font-medium text-gray-900 uppercase">{caseData.language}</p>
                </div>
                <div>
                  <p className="text-gray-600">Submitted</p>
                  <p className="font-medium text-gray-900">
                    {new Date(caseData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>

            {caseData.assignment && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-3">Care Team</h3>
                <div className="space-y-3 text-sm">
                  {caseData.assignment.workerName && (
                    <div>
                      <p className="text-gray-600">Health Worker</p>
                      <p className="font-medium text-gray-900">
                        {caseData.assignment.workerName}
                      </p>
                    </div>
                  )}
                  {caseData.assignment.doctorName && (
                    <div>
                      <p className="text-gray-600">Assigned Doctor</p>
                      <p className="font-medium text-gray-900">
                        {caseData.assignment.doctorName}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Clinical Guidelines</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Verify AI triage assessment</p>
                <p>• Review all symptoms carefully</p>
                <p>• Provide clear, actionable advice</p>
                <p>• Consider patient's language</p>
                <p>• Document any red flags</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
