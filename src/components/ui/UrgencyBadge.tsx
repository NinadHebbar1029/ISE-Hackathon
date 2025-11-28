import type { UrgencyLevel } from '@shared/types';

interface BadgeProps {
  urgency: UrgencyLevel;
  className?: string;
}

export default function UrgencyBadge({ urgency, className = '' }: BadgeProps) {
  const colors = {
    critical: 'bg-urgent-100 text-urgent-700 border-urgent-300',
    urgent: 'bg-warning-100 text-warning-700 border-warning-300',
    moderate: 'bg-primary-100 text-primary-700 border-primary-300',
    routine: 'bg-success-100 text-success-700 border-success-300',
  };

  const labels = {
    critical: 'Critical',
    urgent: 'Urgent',
    moderate: 'Moderate',
    routine: 'Routine',
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${colors[urgency]} ${className}`}
    >
      {labels[urgency]}
    </span>
  );
}
