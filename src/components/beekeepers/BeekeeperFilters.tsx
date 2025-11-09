"use client";

import type { TrustLevel } from '@/types/user';

type BeekeeperFiltersProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  selectedTrustLevels: TrustLevel[];
  onTrustLevelToggle: (level: TrustLevel) => void;
  verifiedOnly: boolean;
  onVerifiedOnlyChange: (checked: boolean) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
};

const BULGARIAN_REGIONS = [
  'Всички',
  'Благоевград',
  'Бургас',
  'Варна',
  'Велико Търново',
  'Видин',
  'Враца',
  'Габрово',
  'Добрич',
  'Кърджали',
  'Кюстендил',
  'Ловеч',
  'Монтана',
  'Пазарджик',
  'Перник',
  'Плевен',
  'Пловдив',
  'Разград',
  'Русе',
  'Силистра',
  'Сливен',
  'Смолян',
  'София',
  'Стара Загора',
  'Търговище',
  'Хасково',
  'Шумен',
  'Ямбол',
];

export default function BeekeeperFilters({
  searchQuery,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  selectedTrustLevels,
  onTrustLevelToggle,
  verifiedOnly,
  onVerifiedOnlyChange,
  sortBy,
  onSortChange,
}: BeekeeperFiltersProps) {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          🔍 Търсене
        </label>
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Име, град, специализация..."
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      {/* Region */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          📍 Регион
        </label>
        <select 
          value={selectedRegion}
          onChange={(e) => onRegionChange(e.target.value)}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {BULGARIAN_REGIONS.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      {/* Trust Level */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          ⭐ Ниво на доверие
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <input 
              type="checkbox"
              checked={selectedTrustLevels.includes('gold')}
              onChange={() => onTrustLevelToggle('gold')}
              className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-xl">🥇</span>
            <span className="text-sm text-gray-700">Златно</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <input 
              type="checkbox"
              checked={selectedTrustLevels.includes('silver')}
              onChange={() => onTrustLevelToggle('silver')}
              className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-xl">🥈</span>
            <span className="text-sm text-gray-700">Сребърно</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <input 
              type="checkbox"
              checked={selectedTrustLevels.includes('bronze')}
              onChange={() => onTrustLevelToggle('bronze')}
              className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-xl">🥉</span>
            <span className="text-sm text-gray-700">Бронзово</span>
          </label>
        </div>
      </div>

      {/* Verified Only */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
          <input 
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => onVerifiedOnlyChange(e.target.checked)}
            className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-blue-500">✓</span>
          <span className="text-sm text-gray-700">Само верифицирани</span>
        </label>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          🔄 Подреди по
        </label>
        <select 
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="rating">Най-високо оценени</option>
          <option value="experience">Най-опитни</option>
          <option value="newest">Най-нови</option>
          <option value="deals">Най-много сделки</option>
        </select>
      </div>

      {/* Reset Filters */}
      <button
        onClick={() => {
          onSearchChange('');
          onRegionChange('Всички');
          onTrustLevelToggle('gold');
          onTrustLevelToggle('silver');
          onTrustLevelToggle('bronze');
          onVerifiedOnlyChange(false);
          onSortChange('rating');
        }}
        className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Изчисти филтрите
      </button>
    </div>
  );
}

