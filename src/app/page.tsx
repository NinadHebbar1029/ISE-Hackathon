'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        const roleRoutes = {
          patient: '/patient/dashboard',
          worker: '/worker/dashboard',
          doctor: '/doctor/dashboard',
          admin: '/admin/dashboard',
        };
        router.push(roleRoutes[user.role]);
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-primary-700">Loading VerboCare...</p>
      </div>
    </div>
  );
}
