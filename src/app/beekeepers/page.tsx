"use client";

import { useState, useEffect, useMemo } from 'react';
import PageShell from '@/components/layout/PageShell';
import BeekeeperCard from '@/components/beekeepers/BeekeeperCard';
import BeekeeperProfileModal from '@/components/beekeepers/BeekeeperProfileModal';
import BeekeeperFilters from '@/components/beekeepers/BeekeeperFilters';
import ContactModal from '@/components/beekeepers/ContactModal';
import { fetchBeekeepers } from '@/lib/beekeeperClient';
import { useAuth } from '@/context/AuthProvider';
import { useModal } from '@/components/modal/ModalProvider';
import type { BeekeeperProfile } from '@/types/beekeeper';
import type { TrustLevel } from '@/types/user';

export default function BeekeepersPage() {
  const { user } = useAuth();
  const { open: openAuthModal } = useModal();
  // Data state
  const [beekeepers, setBeekeepers] = useState<BeekeeperProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Всички');
  const [selectedTrustLevels, setSelectedTrustLevels] = useState<TrustLevel[]>(['gold', 'silver', 'bronze']);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Modal state
  const [selectedBeekeeper, setSelectedBeekeeper] = useState<BeekeeperProfile | null>(null);
  const [contactBeekeeper, setContactBeekeeper] = useState<BeekeeperProfile | null>(null);

  // Fetch beekeepers from API
  useEffect(() => {
    let cancelled = false;
    
    setLoading(true);
    setError(null);

    fetchBeekeepers({
      search: searchQuery || undefined,
      region: selectedRegion !== 'Всички' ? selectedRegion : undefined,
      verified: verifiedOnly || undefined,
      sortBy: sortBy,
    })
      .then((response) => {
        if (!cancelled) {
          setBeekeepers(response.items || []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to fetch beekeepers:', err);
          setError('Неуспешно зареждане на пчелари');
          setBeekeepers([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [searchQuery, selectedRegion, verifiedOnly, sortBy]);

  // Client-side trust level filtering (API handles rest)
  const filteredBeekeepers = useMemo(() => {
    let result = [...beekeepers];

    // Filter by selected trust levels (client-side)
    result = result.filter(bk => selectedTrustLevels.includes(bk.trustLevel));

    return result;
  }, [beekeepers, selectedTrustLevels]);

  const handleTrustLevelToggle = (level: TrustLevel) => {
    setSelectedTrustLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const verifiedCount = beekeepers.filter(bk => bk.verifiedAt !== null).length;
  const totalHives = beekeepers.reduce((sum, bk) => sum + bk.totalHives, 0);

  const handleContactClick = (beekeeper?: BeekeeperProfile) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    
    // Show contact modal with the beekeeper's info
    const beekeeperToContact = beekeeper || selectedBeekeeper;
    if (beekeeperToContact) {
      setContactBeekeeper(beekeeperToContact);
    }
  };

  return (
    <>
      <PageShell>
        <div className="grid grid-cols-12 gap-8">
          {/* Filters Sidebar (Desktop) */}
          <aside className="hidden lg:block col-span-3 space-y-6">
            <div className="sticky top-6">
              <BeekeeperFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedRegion={selectedRegion}
                onRegionChange={setSelectedRegion}
                selectedTrustLevels={selectedTrustLevels}
                onTrustLevelToggle={handleTrustLevelToggle}
                verifiedOnly={verifiedOnly}
                onVerifiedOnlyChange={setVerifiedOnly}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="col-span-12 lg:col-span-9">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">🐝</span>
                <h1 className="text-3xl font-bold text-gray-900">
                  Намери пчелар
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Свържете се с опитни пчелари във вашия регион
              </p>
            </div>

            {/* Mobile Filter Button */}
            <button 
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden mb-6 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <span>🔍</span>
              <span>Филтри и търсене</span>
            </button>

            {/* Stats Bar */}
            {!loading && !error && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-wrap items-center gap-4 text-sm">
                <span className="text-gray-900 font-medium">
                  Показани: <span className="text-amber-600">{filteredBeekeepers.length}</span> от {beekeepers.length}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  Верифицирани: <span className="text-blue-600">{verifiedCount}</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  Общо кошери: <span className="text-amber-600">{totalHives}</span>
                </span>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full max-w-7xl">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="h-16 md:h-28 bg-gray-200 animate-pulse" />
                      <div className="pt-10 md:pt-14 pb-3 md:pb-4 px-3 md:px-4 space-y-2 md:space-y-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2 mx-auto" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3 mx-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Грешка при зареждане
                </h3>
                <p className="text-gray-600 mb-4">
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 px-6 py-3 font-semibold transition-colors"
                >
                  Опитай отново
                </button>
              </div>
            )}

            {/* Beekeeper Grid */}
            {!loading && !error && filteredBeekeepers.length > 0 ? (
              <div className="flex justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full max-w-7xl mx-auto">
                  {filteredBeekeepers.map(beekeeper => (
                    <BeekeeperCard 
                      key={beekeeper.id}
                      beekeeper={beekeeper}
                      onViewProfile={() => setSelectedBeekeeper(beekeeper)}
                      onContact={() => handleContactClick(beekeeper)}
                      isGuest={!user}
                    />
                  ))}
                </div>
              </div>
            ) : !loading && !error ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Няма намерени пчелари
                </h3>
                <p className="text-gray-600">
                  Опитайте да промените филтрите или критериите за търсене
                </p>
              </div>
            ) : null}
          </main>
        </div>
      </PageShell>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Филтри</h3>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <BeekeeperFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
              selectedTrustLevels={selectedTrustLevels}
              onTrustLevelToggle={handleTrustLevelToggle}
              verifiedOnly={verifiedOnly}
              onVerifiedOnlyChange={setVerifiedOnly}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
            <button
              onClick={() => setShowMobileFilters(false)}
              className="mt-6 w-full rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-3 font-semibold transition-colors"
            >
              Приложи филтрите
            </button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {selectedBeekeeper && (
        <BeekeeperProfileModal
          beekeeper={selectedBeekeeper}
          onClose={() => setSelectedBeekeeper(null)}
          onContact={handleContactClick}
          isGuest={!user}
        />
      )}

      {/* Contact Modal */}
      {contactBeekeeper && (
        <ContactModal
          beekeeper={{
            name: contactBeekeeper.name,
            phone: contactBeekeeper.phone,
            email: contactBeekeeper.email,
          }}
          onClose={() => setContactBeekeeper(null)}
        />
      )}
    </>
  );
}

