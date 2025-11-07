'use client';

import { useTranslations } from 'next-intl';

type ActionButtonsProps = {
  onApprove?: () => void;
  onReject?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  loading?: boolean;
};

export function ActionButtons({ onApprove, onReject, onEdit, onDelete, loading }: ActionButtonsProps) {
  const t = useTranslations('admin.listings');
  
  return (
    <div className="flex items-center gap-2">
      {onApprove && (
        <button
          onClick={onApprove}
          disabled={loading}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          ✓ {t('approve')}
        </button>
      )}
      {onReject && (
        <button
          onClick={onReject}
          disabled={loading}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          ✗ {t('reject')}
        </button>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          ✎ {t('edit')}
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          disabled={loading}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          🗑 {t('delete')}
        </button>
      )}
    </div>
  );
}

