import type { CaseStatus } from '@shared/types';

interface StatusBadgeProps {
  status: CaseStatus;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const colors: Record<CaseStatus, string> = {
    new: 'bg-blue-100 text-blue-700 border-blue-300',
    assigned: 'bg-purple-100 text-purple-700 border-purple-300',
    in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    awaiting_doctor: 'bg-orange-100 text-orange-700 border-orange-300',
    completed: 'bg-green-100 text-green-700 border-green-300',
    closed: 'bg-gray-100 text-gray-700 border-gray-300',
    resolved: 'bg-teal-100 text-teal-700 border-teal-300',
  };

  const labels: Record<CaseStatus, string> = {
    new: 'New',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    awaiting_doctor: 'Awaiting Doctor',
    completed: 'Completed',
    closed: 'Closed',
    resolved: 'Resolved',
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${colors[status]} ${className}`}
    >
      {labels[status]}
    </span>
  );
}
