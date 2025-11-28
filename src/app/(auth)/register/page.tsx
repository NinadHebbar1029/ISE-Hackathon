'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import type { UserRole } from '@shared/types';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { register } = useAuth();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({ name, email, password, role });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { 
      value: 'patient', 
      label: 'Patient',
      description: 'Get personalized care',
      icon: '👤',
      gradient: 'from-blue-500 via-cyan-500 to-blue-600',
      hoverGradient: 'from-blue-400 via-cyan-400 to-blue-500'
    },
    { 
      value: 'worker', 
      label: 'Health Worker',
      description: 'Triage & support',
      icon: '🩺',
      gradient: 'from-green-500 via-emerald-500 to-green-600',
      hoverGradient: 'from-green-400 via-emerald-400 to-green-500'
    },
    { 
      value: 'doctor', 
      label: 'Doctor',
      description: 'Diagnose & treat',
      icon: '⚕️',
      gradient: 'from-purple-500 via-pink-500 to-purple-600',
      hoverGradient: 'from-purple-400 via-pink-400 to-purple-500'
    },
    { 
      value: 'admin', 
      label: 'Administrator',
      description: 'Manage platform',
      icon: '⚙️',
      gradient: 'from-orange-500 via-red-500 to-orange-600',
      hoverGradient: 'from-orange-400 via-red-400 to-orange-500'
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(99, 102, 241, 0.4) 0%, transparent 50%)`,
            transition: 'background 0.3s ease',
          }}
        />
        
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-4000"></div>
        
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />

        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
          
          <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="grid md:grid-cols-5 gap-0">
              {/* Left Sidebar */}
              <div 
                className="md:col-span-2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 md:p-10 text-white relative overflow-hidden"
                style={{
                  transform: `translateY(${mousePosition.y * 0.03}px)`,
                  transition: 'transform 0.3s ease-out',
                }}
              >
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8 group cursor-pointer">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <span className="text-2xl font-bold">VerboCare</span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                    Join the Future of Healthcare
                  </h2>
                  <p className="text-indigo-100 mb-8 text-lg">
                    Experience AI-powered triage and instant medical support at your fingertips.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    {[
                      { icon: '✨', text: 'Instant AI health assessment' },
                      { icon: '👨‍⚕️', text: 'Connect with certified professionals' },
                      { icon: '🔐', text: 'Bank-grade security & privacy' },
                      { icon: '🌐', text: 'Available in 50+ languages' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 group cursor-pointer"
                        style={{
                          transform: `translateX(${mousePosition.x * 0.01}px)`,
                          transition: 'transform 0.3s ease-out',
                        }}
                      >
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300">
                          <span className="text-lg">{item.icon}</span>
                        </div>
                        <span className="text-sm group-hover:translate-x-1 transition-transform duration-300">{item.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-white/20">
                    <p className="text-sm text-indigo-100">
                      Already have an account?{' '}
                      <Link href="/login" className="font-semibold text-white hover:underline transition-all duration-300 hover:text-indigo-100">
                        Sign in here →
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Form */}
              <div 
                className="md:col-span-3 p-8 md:p-10"
                style={{
                  transform: `translateY(${mousePosition.y * -0.02}px)`,
                  transition: 'transform 0.3s ease-out',
                }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                  <p className="text-gray-300">Get started with VerboCare today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-300 mb-2 group-hover:text-white transition-colors">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity"></div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="John Doe"
                        className="relative w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/15 hover:border-white/30"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-gray-300 mb-2 group-hover:text-white transition-colors">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity"></div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="john.doe@example.com"
                        className="relative w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/15 hover:border-white/30"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-gray-300 mb-2 group-hover:text-white transition-colors">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity"></div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="Minimum 6 characters"
                        className="relative w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/15 hover:border-white/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">
                      Select Your Role
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {roles.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setRole(option.value as UserRole)}
                          className={`group relative p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                            role === option.value
                              ? 'border-transparent scale-105'
                              : 'border-white/20 hover:border-white/40 hover:scale-105'
                          }`}
                        >
                          {role === option.value ? (
                            <>
                              <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient}`}></div>
                              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </>
                          ) : (
                            <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-all duration-300"></div>
                          )}
                          
                          <div className="relative flex flex-col items-center text-center gap-2">
                            <div className="text-3xl group-hover:scale-125 transition-transform duration-300">
                              {option.icon}
                            </div>
                            <div>
                              <div className={`font-semibold text-sm ${role === option.value ? 'text-white' : 'text-gray-200 group-hover:text-white'} transition-colors`}>
                                {option.label}
                              </div>
                              <div className={`text-xs mt-1 ${role === option.value ? 'text-white/90' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                                {option.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="relative overflow-hidden bg-red-500/20 border border-red-500/50 backdrop-blur-sm text-red-200 px-4 py-3 rounded-xl animate-shake">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0 animate-shimmer"></div>
                      <div className="relative flex items-center gap-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">{error}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </span>
                  </button>

                  <p className="text-xs text-center text-gray-400 mt-4">
                    By creating an account, you agree to our{' '}
                    <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">Privacy Policy</a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
