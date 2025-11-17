import type { ResourceCategory } from '@/data/beekeeping-resources';

export type LocalizedText = {
  bg: string;
  en: string;
};

export type ConfigResource = {
  title: LocalizedText;
  description: LocalizedText;
  url: string;
  type: LocalizedText;
  icon: string;
  free: boolean;
  language: 'bg' | 'en';
  verified: boolean;
};

export type ConfigCategory = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  resources: ConfigResource[];
};

export type ResourceConfig = {
  enabled: boolean;
  categories: ConfigCategory[];
};

export type ResourcesConfig = {
  practices: ResourceConfig;
  health: ResourceConfig;
  honey: ResourceConfig;
  library: ResourceConfig;
};

// Fetch resources from JSON config
export async function fetchResourcesConfig(): Promise<ResourcesConfig> {
  const response = await fetch('/config/resources.json', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to load resources config');
  }
  return response.json();
}

// Convert config to ResourceCategory format for existing components
export function convertConfigToResources(
  config: ConfigCategory[],
  locale: 'bg' | 'en'
): ResourceCategory[] {
  return config.map((cat) => ({
    id: cat.id,
    title: cat.title[locale],
    description: cat.description[locale],
    resources: cat.resources.map((res) => ({
      title: res.title[locale],
      description: res.description[locale],
      url: res.url,
      type: res.type[locale],
      icon: res.icon,
      free: res.free,
      language: res.language,
      verified: res.verified,
    })),
  }));
}

