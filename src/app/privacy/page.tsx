'use client';

import { useTranslations } from 'next-intl';
import PageShell from '@/components/layout/PageShell';

export default function PrivacyPolicyPage() {
  const t = useTranslations('privacy');

  return (
    <PageShell>
      <article className="bg-white rounded-2xl shadow-sm p-8 md:p-12 max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-gray-600">
            {t('lastUpdated')}: {new Date().toLocaleDateString('bg-BG', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </header>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('section1.title')}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">{t('section1.content')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('section2.title')}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">{t('section2.content')}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>{t('section2.item1')}</li>
              <li>{t('section2.item2')}</li>
              <li>{t('section2.item3')}</li>
              <li>{t('section2.item4')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('section3.title')}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">{t('section3.content')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('section4.title')}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">{t('section4.content')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('section5.title')}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">{t('section5.content')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('section6.title')}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">{t('section6.content')}</p>
            <p className="text-gray-700 leading-relaxed">
              <strong>{t('contactEmail')}:</strong>{' '}
              <a href="mailto:info@pchelarstvo.bg" className="text-amber-600 hover:underline">
                info@pchelarstvo.bg
              </a>
            </p>
          </section>
        </div>
      </article>
    </PageShell>
  );
}

