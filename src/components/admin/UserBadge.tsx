import { useTranslations } from 'next-intl';
import type { UserRole } from '@/types/user';

type UserBadgeProps = {
  role: UserRole;
};

export function UserBadge({ role }: UserBadgeProps) {
  const t = useTranslations('admin.roles');
  const getRoleColor = () => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'moderator':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'user':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'super_admin':
        return '👑';
      case 'admin':
        return '🛡️';
      case 'moderator':
        return '🔧';
      case 'user':
      default:
        return '👤';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor()}`}>
      <span>{getRoleIcon()}</span>
      <span>{t(role)}</span>
    </span>
  );
}

