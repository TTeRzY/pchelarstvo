"use client";

import type { BeekeeperProfile } from '@/types/beekeeper';
// import StarRating from './StarRating';  // TODO: Enable in future version
import TrustBadge from './TrustBadge';

type BeekeeperCardProps = {
  beekeeper: BeekeeperProfile;
  onViewProfile: () => void;
  onContact: () => void;
  isGuest?: boolean;
};

export default function BeekeeperCard({ 
  beekeeper, 
  onViewProfile, 
  onContact,
  isGuest = false
}: BeekeeperCardProps) {
  const isVerified = !!beekeeper.verifiedAt;

  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-200 group">
      {/* Header with gradient */}
      <div className="relative h-28 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500">
        {/* Verified Badge */}
        {isVerified && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
            <span>✓</span>
            <span>Верифициран</span>
          </div>
        )}
        
        {/* Avatar */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
            {beekeeper.avatarUrl ? (
              <img 
                src={beekeeper.avatarUrl} 
                alt={beekeeper.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300 text-4xl">
                👤
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-14 pb-4 px-4">
        {/* Name */}
        <h3 className="text-center font-bold text-lg text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
          {beekeeper.name}
        </h3>

        {/* Trust Level */}
        <div className="flex justify-center mb-3">
          <TrustBadge level={beekeeper.trustLevel} size="sm" />
        </div>

        {/* Info */}
        <div className="space-y-1.5 text-sm text-gray-600 mb-4">
          <div className="flex items-center justify-center gap-1">
            <span>📍</span>
            <span>{beekeeper.region}{beekeeper.city ? `, ${beekeeper.city}` : ''}</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <span>🏺</span>
            <span>{beekeeper.totalHives} кошера</span>
          </div>
          {/* TODO: Re-enable experience details when data is available */}
          {beekeeper.completedDeals > 0 && (
            <div className="flex items-center justify-center gap-1">
              <span>✓</span>
              <span>{beekeeper.completedDeals} сделки</span>
            </div>
          )}
        </div>

        {/* Specializations (Tags) */}
        {beekeeper.specializations && beekeeper.specializations.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1 justify-center">
            {beekeeper.specializations.slice(0, 2).map((spec, idx) => (
              <span 
                key={idx}
                className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full"
              >
                {spec}
              </span>
            ))}
            {beekeeper.specializations.length > 2 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                +{beekeeper.specializations.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button 
            onClick={onViewProfile}
            className="flex-1 text-center rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Виж профил
          </button>
          <button 
            onClick={onContact}
            className="flex-1 rounded-xl bg-yellow-400 hover:bg-yellow-500 px-3 py-2 text-sm font-medium transition-colors"
          >
            {isGuest ? '🔒 Вход за контакт' : 'Свържи се'}
          </button>
        </div>
      </div>
    </article>
  );
}

