'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api-client';
import Navbar from '@/components/ui/Navbar';

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
		(async () => {
			try {
				const res = await apiClient.get('/areas');
				setAreas(res.data || []);
			} catch {}
		})();
		
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

	const languages = [
		{ code: 'en', name: 'English', flag: '🇬🇧' },
		{ code: 'es', name: 'Español', flag: '🇪🇸' },
		{ code: 'fr', name: 'Français', flag: '🇫🇷' },
		{ code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
		{ code: 'zh', name: '中文', flag: '🇨🇳' },
	];

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

			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Hero Header */}
				<div className="mb-8 relative rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 md:p-12 text-white overflow-hidden">
					<div className="absolute inset-0 bg-black/10"></div>
					<div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
					<div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
					
					<div className="relative z-10">
						<h1 className="text-4xl md:text-5xl font-bold mb-4">Create New Case 🏥</h1>
						<p className="text-indigo-100 text-lg max-w-2xl">
							Describe your symptoms and our AI-powered triage system will provide instant assessment and priority routing.
						</p>
					</div>
				</div>

				{/* Main Form */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Form Column */}
					<div className="lg:col-span-2">
						<div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-white">
							<form onSubmit={handleSubmit} className="space-y-8">
								{/* Symptoms Description */}
								<div>
									<label className="block text-lg font-semibold text-gray-900 mb-3">
										Describe Your Symptoms *
									</label>
									<div className="relative group">
										<textarea
											value={form.description}
											onChange={(e) => setForm({ ...form, description: e.target.value })}
											required
											rows={8}
											placeholder="Please provide detailed information: when did symptoms start, severity level, any relevant medical history..."
											className="w-full px-5 py-4 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 group-hover:border-indigo-300 resize-none"
										/>
										
										{/* Voice Input Button */}
										<button
											type="button"
											onClick={toggleVoice}
											disabled={!voiceSupported}
											className={`absolute bottom-4 right-4 p-3 rounded-xl transition-all duration-300 ${
												listening 
													? 'bg-red-500 text-white shadow-lg shadow-red-500/50 animate-pulse' 
													: 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:shadow-indigo-500/50 hover:scale-110'
											} disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed`}
											title={voiceSupported ? (listening ? 'Stop recording' : 'Start voice input') : 'Voice not supported'}
										>
											<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
												<path d="M12 14a3 3 0 003-3V7a3 3 0 10-6 0v4a3 3 0 003 3z" />
												<path d="M19 11a1 1 0 10-2 0 5 5 0 11-10 0 1 1 0 10-2 0 7 7 0 0012 0z" />
												<path d="M13 19.938V22h-2v-2.062A8.001 8.001 0 014 12h2a6 6 0 0012 0h2a8.001 8.001 0 01-7 7.938z" />
											</svg>
										</button>
									</div>
									<p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
										{listening ? (
											<>
												<span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
												Recording... Speak clearly
											</>
										) : (
											<>
												<svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												Type your symptoms or use voice input for faster entry
											</>
										)}
									</p>
								</div>

								{/* Language Selection */}
								<div>
									<label className="block text-lg font-semibold text-gray-900 mb-3">
										Preferred Language
									</label>
									<div className="grid grid-cols-3 md:grid-cols-5 gap-3">
										{languages.map((lng) => (
											<button
												type="button"
												key={lng.code}
												onClick={() => setForm({ ...form, language: lng.code })}
												className={`group relative px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
													form.language === lng.code
														? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/50 scale-105'
														: 'bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-300 hover:shadow-md'
												}`}
											>
												<div className="text-2xl mb-1">{lng.flag}</div>
												<div className="text-xs">{lng.name}</div>
											</button>
										))}
									</div>
								</div>

								{/* Location & Area */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label className="block text-sm font-semibold text-gray-900 mb-2">
											📍 Location (Optional)
										</label>
										<input
											type="text"
											value={form.location}
											onChange={(e) => setForm({ ...form, location: e.target.value })}
											placeholder="City or Area"
											className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 outline-none transition-all duration-300"
										/>
									</div>

									<div>
										<label className="block text-sm font-semibold text-gray-900 mb-2">
											🏥 Medical Area (Optional)
										</label>
										<select
											value={form.areaId ?? ''}
											onChange={(e) => setForm({ ...form, areaId: e.target.value ? parseInt(e.target.value) : undefined })}
											className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 outline-none transition-all duration-300"
										>
											<option value="">Select area</option>
											{areas.map((a) => (
												<option key={a.id} value={a.id}>{a.name}</option>
											))}
										</select>
									</div>
								</div>

								{/* Worker Selection */}
								<div>
									<label className="block text-sm font-semibold text-gray-900 mb-2">
										👨‍⚕️ Assign Health Worker (Optional)
									</label>
									<select
										value={form.workerId ?? ''}
										onChange={(e) => setForm({ ...form, workerId: e.target.value ? parseInt(e.target.value) : undefined })}
										disabled={workers.length === 0}
										className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 outline-none transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
									>
										<option value="">{workers.length ? 'Select a health worker' : 'Select an area first'}</option>
										{workers.map((w) => (
											<option key={w.id} value={w.id}>{w.name}</option>
										))}
									</select>
									<p className="text-xs text-gray-500 mt-1">We'll automatically match you based on your area if not specified</p>
								</div>

								{/* Error Message */}
								{error && (
									<div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3">
										<svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
										</svg>
										<p className="text-red-800 font-medium">{error}</p>
									</div>
								)}

								{/* Action Buttons */}
								<div className="flex gap-4 pt-4">
									<button
										type="submit"
										disabled={loading || !form.description}
										className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
									>
										{loading ? (
											<span className="flex items-center justify-center gap-2">
												<svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
													<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
													<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
												</svg>
												Submitting...
											</span>
										) : (
											'Submit Case & Get AI Triage'
										)}
									</button>
									<button
										type="button"
										onClick={() => router.push('/patient/cases')}
										className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
									>
										Cancel
									</button>
								</div>
							</form>
						</div>
					</div>

					{/* Info Sidebar */}
					<div className="lg:col-span-1 space-y-6">
						{/* AI Features */}
						<div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border-2 border-white">
							<h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
								<span className="text-2xl">🤖</span>
								AI-Powered Triage
							</h3>
							<div className="space-y-3">
								{[
									{ icon: '⚡', text: 'Instant AI analysis' },
									{ icon: '🎯', text: 'Priority assessment' },
									{ icon: '👨‍⚕️', text: 'Smart worker matching' },
									{ icon: '🌍', text: 'Multi-language support' },
								].map((feature, idx) => (
									<div key={idx} className="flex items-center gap-3 text-gray-700">
										<span className="text-xl">{feature.icon}</span>
										<span className="text-sm font-medium">{feature.text}</span>
									</div>
								))}
							</div>
						</div>

						{/* Tips */}
						<div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl shadow-xl p-6 border-2 border-amber-200">
							<h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
								<span className="text-xl">💡</span>
								Tips for Better Results
							</h3>
							<ul className="space-y-2 text-sm text-gray-700">
								<li className="flex gap-2">
									<span className="text-amber-600">•</span>
									<span>Be specific about symptom onset</span>
								</li>
								<li className="flex gap-2">
									<span className="text-amber-600">•</span>
									<span>Mention severity and duration</span>
								</li>
								<li className="flex gap-2">
									<span className="text-amber-600">•</span>
									<span>Include relevant medical history</span>
								</li>
								<li className="flex gap-2">
									<span className="text-amber-600">•</span>
									<span>List any current medications</span>
								</li>
							</ul>
						</div>

						{/* Urgency Levels */}
						<div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border-2 border-white">
							<h3 className="text-lg font-bold text-gray-900 mb-3">Urgency Levels</h3>
							<div className="space-y-2 text-xs">
								<div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
									<div className="w-3 h-3 bg-red-500 rounded-full"></div>
									<span className="font-semibold">Urgent</span> - Immediate attention
								</div>
								<div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
									<div className="w-3 h-3 bg-orange-500 rounded-full"></div>
									<span className="font-semibold">High</span> - Within 24 hours
								</div>
								<div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
									<div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
									<span className="font-semibold">Moderate</span> - Within 48 hours
								</div>
								<div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
									<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
									<span className="font-semibold">Low</span> - Routine care
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
