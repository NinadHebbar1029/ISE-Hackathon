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

export default function WorkerCaseDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const caseId = params?.id;

  const [caseData, setCaseData] = useState<CaseWithTriage | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'worker')) {
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

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setSending(true);
    try {
      const response = await apiClient.post(`/cases/${caseId}/messages`, {
        content: newMessage,
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const response = await apiClient.put(`/cases/${caseId}`, {
        status: newStatus,
      });
      setCaseData(response.data);
      
      // Add auto-message about status change
      await apiClient.post(`/cases/${caseId}/messages`, {
        content: `Case status updated to: ${newStatus.replace('_', ' ')}`,
      });
      fetchCaseData(); // Refresh to get new message
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    setSending(true);
    try {
      await apiClient.post(`/cases/${caseId}/messages`, {
        content: `[WORKER NOTE] ${newNote}`,
      });
      setNewNote('');
      fetchCaseData();
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setSending(false);
    }
  };

  const handleRetryTriage = async () => {
    if (!caseData) return;
    setRetrying(true);
    try {
      const res = await apiClient.post(`/cases/${caseId}/retriage`);
      setCaseData(res.data);
    } catch (error) {
      console.error('Failed to retriage case:', error);
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

  if (!caseData) {
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
        role="worker"
        links={[
          { href: '/worker/dashboard', label: 'Dashboard' },
          { href: '/worker/cases', label: 'Cases' },
          { href: '/worker/new-case', label: 'New Case' },
          { href: '/worker/profile', label: 'Profile' },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="secondary" onClick={() => router.back()}>
            ← Back
          </Button>
          <div className="flex gap-2">
            <select
              value={caseData.status}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              disabled={updating}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="new">New</option>
              <option value="triaged">Triaged</option>
              <option value="assigned">Assigned</option>
              <option value="awaiting_doctor">Awaiting Doctor</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            {updating && <LoadingSpinner size="sm" />}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Header */}
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Case #{caseData.id}
                  </h1>
                  <div className="flex gap-3">
                    {caseData.triage && (
                      <UrgencyBadge urgency={caseData.triage.urgencyLevel} />
                    )}
                    <StatusBadge status={caseData.status} />
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(caseData.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="space-y-4">
                {caseData.patientName && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Patient</p>
                    <p className="text-gray-900">
                      {caseData.patientName}
                      {caseData.patientAge && `, ${caseData.patientAge} years old`}
                    </p>
                  </div>
                )}

                {caseData.location && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Location</p>
                    <p className="text-gray-900">{caseData.location}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Symptoms Description</p>
                  <p className="text-gray-900 whitespace-pre-wrap">{caseData.description}</p>
                </div>
              </div>
            </Card>

            {/* AI Triage Analysis */}
            {caseData.triage && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">AI Triage Analysis</h2>
                  <span className="text-xs text-gray-500">
                    {new Date(caseData.triage.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Summary</p>
                    <p className="text-gray-900">{caseData.triage.summary}</p>
                  </div>

                  {caseData.triage.symptoms && caseData.triage.symptoms.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Identified Symptoms</p>
                      <div className="flex flex-wrap gap-2">
                        {caseData.triage.symptoms.map((symptom, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {caseData.triage.recommendations && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Recommendations</p>
                      <p className="text-gray-900">{caseData.triage.recommendations}</p>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <Button variant="secondary" onClick={handleRetryTriage} disabled={retrying}>
                      {retrying ? 'Re-running AI triage…' : 'Retry AI triage'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Worker Actions */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Internal Note</h2>
              <div className="space-y-3">
                <Textarea
                  label="Note (visible to other health workers and doctors)"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={4}
                  placeholder="Add observations, follow-up actions, or important information..."
                />
                <Button
                  variant="primary"
                  onClick={handleAddNote}
                  disabled={sending || !newNote.trim()}
                >
                  {sending ? 'Adding Note...' : 'Add Note'}
                </Button>
              </div>
            </Card>

            {/* Messages */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages & Notes</h2>
              
              <div className="space-y-4 mb-6">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No messages yet</p>
                ) : (
                  messages.map((msg) => {
                    const isWorkerNote = msg.content.startsWith('[WORKER NOTE]');
                    const displayContent = isWorkerNote 
                      ? msg.content.replace('[WORKER NOTE] ', '')
                      : msg.content;
                    
                    return (
                      <div
                        key={msg.id}
                        className={`border-l-4 pl-4 py-2 ${
                          isWorkerNote ? 'border-warning-500 bg-warning-50' : 'border-primary-500'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium text-gray-900 flex items-center gap-2">
                            {msg.authorName || msg.senderName || 'Unknown'}
                            {isWorkerNote && (
                              <span className="text-xs px-2 py-0.5 bg-warning-200 text-warning-800 rounded">
                                INTERNAL NOTE
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-gray-700">{displayContent}</p>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="space-y-3">
                <Textarea
                  label="Add a message to patient"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={3}
                  placeholder="Type a message to the patient..."
                />
                <Button
                  variant="primary"
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                >
                  {sending ? 'Sending...' : 'Send Message to Patient'}
                </Button>
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
                  <p className="text-gray-600">Created</p>
                  <p className="font-medium text-gray-900">
                    {new Date(caseData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>

            {caseData.assignment && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-3">Assignment</h3>
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
                      <p className="text-gray-600">Doctor</p>
                      <p className="font-medium text-gray-900">
                        {caseData.assignment.doctorName}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600">Assignment Status</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {caseData.assignment.status}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleUpdateStatus('awaiting_doctor')}
                  disabled={caseData.status === 'awaiting_doctor'}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Send to Doctor
                </button>
                <button
                  onClick={() => handleUpdateStatus('in_progress')}
                  disabled={caseData.status === 'in_progress'}
                  className="w-full px-4 py-2 bg-warning-600 text-white rounded-lg hover:bg-warning-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() => handleUpdateStatus('resolved')}
                  disabled={caseData.status === 'resolved'}
                  className="w-full px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Mark as Resolved
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
