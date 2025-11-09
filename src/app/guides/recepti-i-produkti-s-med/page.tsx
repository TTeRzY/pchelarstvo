"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { HONEY_PRODUCTS_RESOURCES } from "@/data/honey-products-resources";
import ResourceList from "@/components/resources/ResourceList";

export default function HoneyProductsGuidePage() {
  const t = useTranslations('guides.honey');
  const tc = useTranslations('guides.common');

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
          <div className="relative h-64 md:h-80 bg-gradient-to-br from-amber-400 via-orange-300 to-yellow-500">
            {/* Background Pattern/Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1587049352847-19543f5e34c3?q=80&w=2000&auto=format&fit=crop')",
              }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/70 via-orange-400/50 to-yellow-500/70" />
            
            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
              <div className="mb-4">
                <span className="text-7xl md:text-8xl drop-shadow-lg">🍯</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 drop-shadow-md">
                {t('title')}
              </h1>
              <p className="text-lg md:text-xl text-gray-800 max-w-2xl leading-relaxed drop-shadow">
                {t('subtitle')}
              </p>
            </div>

            {/* Decorative Honey Drops */}
            <div className="absolute top-4 left-4 w-16 h-16 bg-amber-300/40 rounded-full opacity-60 blur-sm" />
            <div className="absolute bottom-8 right-8 w-20 h-20 bg-yellow-300/40 rounded-full opacity-60 blur-sm" />
            <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-orange-300/40 rounded-full opacity-50 blur-sm" />
            <div className="absolute top-1/3 right-1/4 w-14 h-14 bg-amber-400/40 rounded-full opacity-50 blur-sm" />
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-8 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🍯</span>
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
                  <span>10 {tc('verifiedResources')}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
                  <span>🍴</span>
                  <span>{t('culinaryIdeas')}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
                  <span>🇧🇬</span>
                  <span>{tc('bulgarian')}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fun Fact Banner */}
        <div className="mb-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {t('funFactTitle')}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {t('funFactText')}
              </p>
            </div>
          </div>
        </div>

        {/* Resources */}
        <ResourceList categories={HONEY_PRODUCTS_RESOURCES} />

        {/* Call to Action */}
        <div className="mt-12 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 p-8 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-200/30 rounded-full -ml-12 -mb-12" />
          
          <div className="relative">
            <div className="text-5xl mb-4">🤝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {tc('suggestResource')}
            </h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              {t('suggestHoneyResource')}
            </p>
            <Link
              href="/contacts"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-6 py-3 font-semibold text-gray-900 transition-all hover:shadow-lg hover:scale-105"
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
            className="inline-flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
          >
            <span>←</span>
            <span>{tc('backToHome')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

