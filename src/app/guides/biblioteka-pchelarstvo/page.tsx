"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { fetchResourcesConfig, convertConfigToResources } from "@/lib/resourcesConfig";
import type { ResourceCategory } from "@/data/beekeeping-resources";
import ResourceList from "@/components/resources/ResourceList";

export default function BeekeepingLibraryPage() {
  const t = useTranslations('guides.library');
  const tc = useTranslations('guides.common');
  const locale = useLocale() as 'bg' | 'en';
  
  const [resources, setResources] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResourcesConfig()
      .then((config) => {
        if (config.library?.enabled) {
          const converted = convertConfigToResources(config.library.categories, locale);
          setResources(converted);
        }
      })
      .catch((error) => {
        console.error('Failed to load resources:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [locale]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Зареждане...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-amber-600 transition-colors">
            {tc('home')}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{t('title')}</span>
        </nav>

        {/* Hero Banner with Image */}
        <div className="mb-12 rounded-2xl overflow-hidden shadow-xl">
          <div className="relative h-64 md:h-80 bg-gradient-to-br from-blue-400 via-indigo-300 to-purple-500">
            {/* Background Pattern/Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2000&auto=format&fit=crop')",
              }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/80 via-indigo-400/60 to-purple-500/80" />
            
            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
              <div className="mb-4">
                <span className="text-7xl md:text-8xl drop-shadow-lg">📚</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 drop-shadow-md">
                {t('title')}
              </h1>
              <p className="text-lg md:text-xl text-gray-800 max-w-2xl leading-relaxed drop-shadow">
                {t('subtitle')}
              </p>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-4 left-4 w-16 h-16 border-4 border-white/30 rotate-45 opacity-50" />
            <div className="absolute bottom-8 right-8 w-20 h-20 border-4 border-white/30 rotate-12 opacity-40" />
            <div className="absolute top-1/2 left-1/4 w-12 h-12 border-4 border-white/20 -rotate-12 opacity-30" />
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-8 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-3xl">ℹ️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                {t('infoBannerTitle')}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                {t('infoBannerText')}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                  <span>✓</span>
                  <span>{resources.reduce((sum, cat) => sum + cat.resources.length, 0)} {tc('verifiedResources')}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                  <span>📚</span>
                  <span>{t('booksAndResources')}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                  <span>🌍</span>
                  <span>{t('multilingual')}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Resources */}
        <ResourceList categories={resources} />

        {/* Call to Action */}
        <div className="mt-12 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100 p-8 text-center shadow-lg relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/30 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-200/30 rounded-full -ml-12 -mb-12" />
          
          <div className="relative">
            <div className="text-5xl mb-4">🤝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {tc('suggestResource')}
            </h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              {t('suggestResourceDesc')}
            </p>
            <Link
              href="/contacts"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:scale-105"
            >
              <span>{tc('contactUs')}</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <span>←</span>
            <span>{tc('backToHome')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

