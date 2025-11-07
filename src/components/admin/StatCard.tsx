type StatCardProps = {
  title: string;
  value: string | number;
  icon?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
};

export function StatCard({ title, value, icon, trend, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 shadow-blue-100',
    green: 'bg-green-50 border-green-200 shadow-green-100',
    yellow: 'bg-amber-50 border-amber-200 shadow-amber-100',
    red: 'bg-red-50 border-red-200 shadow-red-100',
    purple: 'bg-purple-50 border-purple-200 shadow-purple-100',
  };

  const textColorClasses = {
    blue: 'text-blue-900',
    green: 'text-green-900',
    yellow: 'text-amber-900',
    red: 'text-red-900',
    purple: 'text-purple-900',
  };

  return (
    <div className={`rounded-2xl border p-6 shadow-sm ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${textColorClasses[color]}`}>{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend.isPositive ? 'text-green-700' : 'text-red-700'}`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-4xl opacity-70">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

