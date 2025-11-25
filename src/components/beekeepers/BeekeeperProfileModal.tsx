"use client";

import Link from "next/link";
import type { BeekeeperProfile } from '@/types/beekeeper';
// import StarRating from './StarRating';  // TODO: Enable in future version
import TrustBadge from './TrustBadge';

type BeekeeperProfileModalProps = {
  beekeeper: BeekeeperProfile;
  onClose: () => void;
  onContact: () => void;
  isGuest?: boolean;
};

export default function BeekeeperProfileModal({ 
  beekeeper, 
  onClose, 
  onContact,
  isGuest = false
}: BeekeeperProfileModalProps) {
  const isVerified = !!beekeeper.verifiedAt;

  // Truncate bio for guests
  const displayBio = isGuest && beekeeper.bio && beekeeper.bio.length > 150
    ? beekeeper.bio.slice(0, 150) + '...'
    : beekeeper.bio;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="relative h-40 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
          
          {/* Avatar */}
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-xl">
              {beekeeper.avatarUrl ? (
                <img 
                  src={beekeeper.avatarUrl} 
                  alt={beekeeper.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300 text-5xl">
                  👤
                </div>
              )}
            </div>
          </div>

          {/* Verified Badge (Large) */}
          {isVerified && (
            <div className="absolute top-4 left-4 bg-blue-500 text-white text-sm px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 shadow-lg">
              <span>✓</span>
              <span>Верифициран пчелар</span>
            </div>
          )}
        </div>

        <div className="pt-20 pb-8 px-8">
          {/* Name & Trust */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
              {beekeeper.name}
            </h2>
            <div className="flex items-center justify-center gap-3">
              <TrustBadge level={beekeeper.trustLevel} size="md" />
            </div>
          </div>
            
          {/* Rating - Hidden for now, enable in future version */}
          {/* <div className="text-center mb-6">
            <StarRating 
              rating={beekeeper.rating} 
              reviewCount={beekeeper.reviewCount}
              size="lg"
            />
            <div className="text-sm text-gray-500 mt-1">
              Обща оценка
            </div>
          </div> */}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
              <div className="text-2xl font-bold text-amber-600">{beekeeper.apiariesCount}</div>
              <div className="text-xs text-gray-600 mt-1">Пчелина</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
              <div className="text-2xl font-bold text-amber-600">{beekeeper.totalHives}</div>
              <div className="text-xs text-gray-600 mt-1">Кошера</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="text-2xl font-bold text-green-600">{beekeeper.completedDeals}</div>
              <div className="text-xs text-gray-600 mt-1">Сделки</div>
            </div>
            {/* TODO: Re-enable experience stats when data is available */}
          </div>

          {/* Location */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-xl">📍</span>
              <span>Локация</span>
            </h3>
            <div className="text-gray-700 text-lg">
              {beekeeper.region}{beekeeper.city ? `, ${beekeeper.city}` : ''}
            </div>
          </div>

          {/* Bio */}
          {beekeeper.bio && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">📝</span>
                <span>За мен</span>
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {displayBio}
              </p>
              {isGuest && beekeeper.bio.length > 150 && (
                <p className="text-sm text-amber-600 mt-2">
                  🔒 Влезте, за да видите пълното описание
                </p>
              )}
            </div>
          )}

          {/* Specializations */}
          {beekeeper.specializations && beekeeper.specializations.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">🐝</span>
                <span>Специализации</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {beekeeper.specializations.map((spec, idx) => (
                  <span 
                    key={idx}
                    className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {beekeeper.products && beekeeper.products.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">🍯</span>
                <span>Продукти</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {beekeeper.products.map((product, idx) => (
                  <span 
                    key={idx}
                    className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    {product}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Active Listings */}
          {beekeeper.activeListingsCount > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">📢</span>
                <span>Активни обяви</span>
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-gray-700">
                  {beekeeper.activeListingsCount} активни {beekeeper.activeListingsCount === 1 ? 'обява' : 'обяви'} в пчелната борса
                </p>
              </div>
            </div>
          )}

          {/* Contact Information Section */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-xl">📞</span>
              <span>Контакти</span>
            </h3>
            
            {isGuest ? (
              /* Guest view - login prompt */
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">🔒</div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Влезте, за да видите контактите
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Регистрирайте се безплатно, за да се свържете с пчелари
                </p>
                <button 
                  onClick={onContact}
                  className="px-6 py-2.5 bg-amber-500 text-gray-900 rounded-xl hover:bg-amber-400 font-medium transition-colors"
                >
                  Вход / Регистрация
                </button>
              </div>
            ) : (
              /* Logged-in view - show contacts */
              <div className="space-y-3">
                {beekeeper.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl">📞</span>
                    <div>
                      <div className="text-xs text-gray-500">Телефон</div>
                      <a 
                        href={`tel:${beekeeper.phone}`}
                        className="text-gray-900 font-medium hover:text-amber-600 transition-colors"
                      >
                        {beekeeper.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {beekeeper.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl">✉️</span>
                    <div>
                      <div className="text-xs text-gray-500">Имейл</div>
                      <a 
                        href={`mailto:${beekeeper.email}`}
                        className="text-gray-900 font-medium hover:text-amber-600 transition-colors"
                      >
                        {beekeeper.email}
                      </a>
                    </div>
                  </div>
                )}
                
                {!beekeeper.phone && !beekeeper.email && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Пчеларът не е споделил контактна информация
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {!isGuest && (
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button 
                onClick={onContact}
                className="flex-1 rounded-xl bg-yellow-400 hover:bg-yellow-500 px-6 py-3 font-semibold transition-all hover:shadow-lg"
              >
                💬 Свържи се
              </button>
              <Link
                href="/marketplace"
                className="flex-1 rounded-xl border border-gray-300 px-6 py-3 font-semibold hover:bg-gray-50 transition-colors text-center block"
              >
                📢 Виж обявите
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

