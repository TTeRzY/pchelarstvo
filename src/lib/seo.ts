import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pchelarstvo.bg";
const SITE_NAME = "Pchelarstvo.bg";
const DEFAULT_DESCRIPTION_BG = "Българският портал за пчеларство. Намерете пчелари, разгледайте пчелна борса, карта на пчелините, новини и ресурси за пчелари.";
const DEFAULT_DESCRIPTION_EN = "Bulgarian beekeeping portal. Find beekeepers, browse honey marketplace, apiary map, news and resources for beekeepers.";

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: "website" | "article";
  locale?: "bg" | "en";
  noindex?: boolean;
  canonical?: string;
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = "/og-image.png",
    type = "website",
    locale = "bg",
    noindex = false,
    canonical,
  } = config;

  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const metaDescription = description || (locale === "bg" ? DEFAULT_DESCRIPTION_BG : DEFAULT_DESCRIPTION_EN);
  const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`;
  const canonicalUrl = canonical || SITE_URL;

  const defaultKeywords = [
    "пчеларство",
    "пчелари",
    "мед",
    "пчелини",
    "пчелна борса",
    "beekeeping",
    "beekeepers",
    "honey",
    "apiaries",
    "honey marketplace",
  ];

  const allKeywords = [...defaultKeywords, ...keywords].join(", ");

  return {
    title: fullTitle,
    description: metaDescription,
    keywords: allKeywords,
    authors: [{ name: "Pchelarstvo.bg" }],
    creator: "Pchelarstvo.bg",
    publisher: "Pchelarstvo.bg",
    robots: noindex ? "noindex, nofollow" : "index, follow",
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "bg-BG": `${SITE_URL}`,
        "en-GB": `${SITE_URL}/en`,
      },
    },
    openGraph: {
      type,
      locale: locale === "bg" ? "bg_BG" : "en_GB",
      url: canonicalUrl,
      siteName: SITE_NAME,
      title: fullTitle,
      description: metaDescription,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: metaDescription,
      images: [imageUrl],
      creator: "@pchelarstvo",
    },
    metadataBase: new URL(SITE_URL),
  };
}

/**
 * Generate structured data (JSON-LD) for Organization
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: DEFAULT_DESCRIPTION_BG,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+359-879-122727",
      contactType: "customer service",
      email: "info@pchelarstvo.bg",
      availableLanguage: ["Bulgarian", "English"],
    },
    sameAs: [
      // Add social media links when available
    ],
  };
}

/**
 * Generate structured data (JSON-LD) for Website
 */
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION_BG,
    inLanguage: ["bg-BG", "en-GB"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/marketplace?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate structured data (JSON-LD) for BreadcrumbList
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

