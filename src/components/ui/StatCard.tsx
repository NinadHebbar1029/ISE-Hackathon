import { ReactNode } from 'react';

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  accent?: 'primary' | 'success' | 'warning' | 'urgent' | 'gray' | 'teal';
  className?: string;
};

const accentMap: Record<NonNullable<StatCardProps['accent']>, string> = {
  primary: 'from-primary-50 to-white text-primary-900 border-primary-100',
  success: 'from-success-50 to-white text-success-900 border-success-100',
  warning: 'from-warning-50 to-white text-warning-900 border-warning-100',
  urgent: 'from-urgent-50 to-white text-urgent-900 border-urgent-100',
  gray: 'from-gray-50 to-white text-gray-900 border-gray-100',
  teal: 'from-teal-50 to-white text-teal-900 border-teal-100',
};

export default function StatCard({ title, value, subtitle, icon, accent = 'gray', className = '' }: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-b ${accentMap[accent]} shadow-sm ${className}`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
          {icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/70 shadow-inner">
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
