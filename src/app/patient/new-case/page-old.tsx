'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api-client';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

export default function PatientNewCasePage() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [form, setForm] = useState({
		description: '',
		language: 'en',
		location: '',
		areaId: undefined as number | undefined,
		workerId: undefined as number | undefined,
	});
	const [areas, setAreas] = useState<Array<{ id: number; name: string }>>([]);
	const [workers, setWorkers] = useState<Array<{ id: number; name: string }>>([]);
	const [listening, setListening] = useState(false);
	const [voiceSupported, setVoiceSupported] = useState(false);
	const recognitionRef = useRef<any>(null);

	useEffect(() => {
		if (!authLoading && (!user || user.role !== 'patient')) {
			router.push('/login');
		}
		// Fetch areas for selection
		(async () => {
			try {
				const res = await apiClient.get('/areas');
				setAreas(res.data || []);
			} catch {}
		})();
			// Initialize speech recognition if supported
			if (typeof window !== 'undefined') {
				const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
				if (SR) {
					setVoiceSupported(true);
					const recog = new SR();
					recog.continuous = true;
					recog.interimResults = true;
					recog.lang = form.language || 'en-US';
					recog.onresult = (event: any) => {
						let interimTranscript = '';
						let finalTranscript = '';
						for (let i = event.resultIndex; i < event.results.length; ++i) {
							const transcript = event.results[i][0].transcript;
							if (event.results[i].isFinal) finalTranscript += transcript;
							else interimTranscript += transcript;
						}
						const combined = (form.description + ' ' + (finalTranscript || interimTranscript)).trim();
						setForm((prev) => ({ ...prev, description: combined }));
					};
					recog.onerror = () => setListening(false);
					recog.onend = () => setListening(false);
					recognitionRef.current = recog;
				}
			}
	}, [user, authLoading, router]);

	// Load workers when area changes
	useEffect(() => {
		(async () => {
			if (!form.areaId) {
				setWorkers([]);
				setForm((prev) => ({ ...prev, workerId: undefined }));
				return;
			}
			try {
				const res = await apiClient.get('/users/search', { params: { role: 'worker', areaId: form.areaId } });
				setWorkers((res.data || []).map((u: any) => ({ id: u.id, name: u.name })));
			} catch {
				setWorkers([]);
			}
		})();
	}, [form.areaId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setLoading(true);
		try {
			const res = await apiClient.post('/cases', {
				description: form.description,
				language: form.language,
					location: form.location || undefined,
					areaId: form.areaId || undefined,
					workerId: form.workerId || undefined,
			});
			router.push(`/patient/cases/${res.data.id}`);
		} catch (err: any) {
			setError(err.response?.data?.error || 'Failed to create case. Please try again.');
		} finally {
			setLoading(false);
		}
	};

		const toggleVoice = () => {
			const recog = recognitionRef.current;
			if (!recog) return;
			try {
				if (!listening) {
					recog.lang = form.language === 'en' ? 'en-US' : form.language === 'es' ? 'es-ES' : form.language === 'fr' ? 'fr-FR' : form.language === 'hi' ? 'hi-IN' : 'zh-CN';
					recog.start();
					setListening(true);
				} else {
					recog.stop();
					setListening(false);
				}
			} catch {
				setListening(false);
			}
		};

	if (authLoading) {
		return null;
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

			<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8 rounded-2xl bg-gradient-to-br from-primary-50 to-white border border-primary-100 p-6">
					<h1 className="text-3xl font-bold text-gray-900">Start a New Case</h1>
					<p className="text-gray-600 mt-2">Describe your symptoms. Our AI will triage immediately.</p>
				</div>

				<Card>
					<form onSubmit={handleSubmit} className="space-y-6">
						<Textarea
							label="Symptoms Description *"
							value={form.description}
							onChange={(e) => setForm({ ...form, description: e.target.value })}
							required
							rows={8}
							placeholder="Describe your symptoms in detail (onset, severity, duration)"
						/>
								<div className="flex items-center justify-between -mt-3">
									<p className="text-sm text-gray-500">You can type or use your voice to fill the description.</p>
									<button
										type="button"
										onClick={toggleVoice}
										disabled={!voiceSupported}
										className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${listening ? 'bg-urgent-600 text-white border-urgent-700' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'} disabled:bg-gray-100 disabled:text-gray-400`}
										title={voiceSupported ? (listening ? 'Stop voice input' : 'Start voice input') : 'Voice input not supported on this browser'}
									>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
											<path d="M12 14a3 3 0 003-3V7a3 3 0 10-6 0v4a3 3 0 003 3z" />
											<path d="M19 11a1 1 0 10-2 0 5 5 0 11-10 0 1 1 0 10-2 0 7 7 0 0012 0z" />
											<path d="M13 19.938V22h-2v-2.062A8.001 8.001 0 014 12h2a6 6 0 0012 0h2a8.001 8.001 0 01-7 7.938z" />
										</svg>
										{voiceSupported ? (listening ? 'Stop Listening' : 'Use Voice') : 'Voice Not Supported'}
									</button>
								</div>

								{/* Area selection */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Area (optional)</label>
									<select
										value={form.areaId ?? ''}
										onChange={(e) => setForm({ ...form, areaId: e.target.value ? parseInt(e.target.value) : undefined })}
										className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
									>
										<option value="">Select area</option>
										{areas.map((a) => (
											<option key={a.id} value={a.id}>{a.name}</option>
										))}
									</select>
									<p className="text-xs text-gray-500 mt-1">Choosing an area helps us route your case faster.</p>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
								<div className="flex flex-wrap gap-2">
									{['en','es','fr','hi','zh'].map((lng) => (
										<button
											type="button"
											key={lng}
											onClick={() => setForm({ ...form, language: lng })}
											className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
												form.language === lng ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
											}`}
										>
											{lng === 'en' ? 'English' : lng === 'es' ? 'Spanish' : lng === 'fr' ? 'French' : lng === 'hi' ? 'Hindi' : 'Chinese'}
										</button>
									))}
								</div>
							</div>

							<Input
								label="Location (optional)"
								value={form.location}
								onChange={(e) => setForm({ ...form, location: e.target.value })}
								placeholder="City/Area"
							/>
						</div>

						{/* Worker selection */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Assign Health Worker (optional)</label>
							<select
								value={form.workerId ?? ''}
								onChange={(e) => setForm({ ...form, workerId: e.target.value ? parseInt(e.target.value) : undefined })}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
								disabled={workers.length === 0}
							>
								<option value="">{workers.length ? 'Select a health worker' : 'Select an area first'}</option>
								{workers.map((w) => (
									<option key={w.id} value={w.id}>{w.name}</option>
								))}
							</select>
							<p className="text-xs text-gray-500 mt-1">Optional. We’ll match based on your area if you don’t choose.</p>
						</div>

						{error && (
							<div className="bg-urgent-50 border border-urgent-200 text-urgent-700 px-4 py-3 rounded">
								{error}
							</div>
						)}

						<div className="flex gap-4">
							<Button type="submit" variant="primary" className="flex-1" disabled={loading || !form.description}>
								{loading ? 'Submitting...' : 'Submit Case'}
							</Button>
							<Button type="button" variant="secondary" onClick={() => router.push('/patient/cases')}>
								Cancel
							</Button>
						</div>
					</form>
				</Card>
			</div>
		</div>
	);
}
