import { useTranslations } from 'next-intl';

type StatusBadgeProps = {
  status: string;
  type?: 'user' | 'listing';
};

export function StatusBadge({ status, type = 'listing' }: StatusBadgeProps) {
  const t = useTranslations('admin.status');
  const getStatusColor = () => {
    if (type === 'user') {
      switch (status) {
        case 'active':
          return 'bg-green-100 text-green-800 border-green-300';
        case 'suspended':
          return 'bg-amber-100 text-amber-800 border-amber-300';
        case 'banned':
          return 'bg-red-100 text-red-800 border-red-300';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    }

    // Listing status
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'approved':
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'flagged':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
      {t(status)}
    </span>
  );
}

