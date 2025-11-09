import type { TrustLevel } from '@/types/user';

type TrustBadgeProps = {
  level: TrustLevel;
  size?: 'sm' | 'md' | 'lg';
};

const TRUST_CONFIG = {
  gold: {
    icon: '🥇',
    labelBg: 'Златно',
    labelEn: 'Gold',
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-800',
    borderClass: 'border-yellow-400',
  },
  silver: {
    icon: '🥈',
    labelBg: 'Сребърно',
    labelEn: 'Silver',
    bgClass: 'bg-gray-200',
    textClass: 'text-gray-700',
    borderClass: 'border-gray-400',
  },
  bronze: {
    icon: '🥉',
    labelBg: 'Бронзово',
    labelEn: 'Bronze',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-700',
    borderClass: 'border-orange-400',
  },
};

export default function TrustBadge({ level, size = 'md' }: TrustBadgeProps) {
  const config = TRUST_CONFIG[level];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${config.bgClass} ${config.textClass} ${sizeClasses[size]} rounded-full font-medium`}>
      <span className={iconSizes[size]}>{config.icon}</span>
      <span>{config.labelBg}</span>
    </div>
  );
}

export { TRUST_CONFIG };

