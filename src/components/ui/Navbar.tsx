import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface NavbarProps {
  role: 'patient' | 'worker' | 'doctor' | 'admin';
  links: { href: string; label: string }[];
}

export default function Navbar({ role, links }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              VerboCare
            </Link>
            <div className="ml-10 flex space-x-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full capitalize">
              {role}
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-urgent-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
