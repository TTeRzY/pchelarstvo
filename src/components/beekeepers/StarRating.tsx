type StarRatingProps = {
  rating: number; // 0-5
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
};

export default function StarRating({ 
  rating, 
  reviewCount = 0, 
  size = 'md',
  showCount = true 
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  const countSizeClasses = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div className="flex items-center gap-1">
      <div className={`flex items-center ${sizeClasses[size]}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star}
            className={star <= Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}
          >
            {star <= Math.floor(rating) ? '⭐' : '☆'}
          </span>
        ))}
      </div>
      {showCount && reviewCount > 0 && (
        <span className={`text-gray-500 ${countSizeClasses[size]}`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}

