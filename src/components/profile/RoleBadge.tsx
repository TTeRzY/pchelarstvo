import type { UserRole } from '@/types/user';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

const ROLE_CONFIG = {
  user: {
    label: 'Потребител',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: '👤',
    description: 'Основен достъп'
  },
  moderator: {
    label: 'Модератор',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: '🛡️',
    description: 'Може да модерира съдържание'
  },
  admin: {
    label: 'Администратор',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: '⚙️',
    description: 'Пълен достъп до системата'
  },
  super_admin: {
    label: 'Супер Администратор',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: '👑',
    description: 'Неограничен достъп'
  }
} as const;

export default function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${config.color} ${className}`}>
      <span className="text-base">{config.icon}</span>
      <div className="flex flex-col">
        <span className="text-xs font-semibold leading-none">{config.label}</span>
        <span className="text-[10px] opacity-75 leading-none mt-0.5">{config.description}</span>
      </div>
    </div>
  );
}

// Export role config for use elsewhere
export { ROLE_CONFIG };

