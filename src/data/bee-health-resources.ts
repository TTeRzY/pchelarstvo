import type { ResourceCategory } from './beekeeping-resources';

// Здраве на пчелните семейства - Bee Health Resources
export const BEE_HEALTH_RESOURCES: ResourceCategory[] = [
  {
    id: 'diseases',
    title: 'Болести и паразити',
    description: 'Разпознаване, превенция и лечение на основните заболявания',
    resources: [
      {
        title: 'БАБХ - Болести по пчелите',
        description: 'Официална информация за наблюдавани болести, епизоотична обстановка и мерки за контрол от БАБХ.',
        url: 'https://bfsa.egov.bg/wps/portal/bfsa-web/activities/animal.health.and.welfare/animal-health/current.information.on.animal.diseases/bee.diseases',
        type: 'Институция',
        icon: '🏛️',
        free: true,
        language: 'bg',
        verified: true,
      },
      {
        title: 'БАБХ Главна страница',
        description: 'Главен портал на Българската агенция по безопасност на храните - актуална информация и ресурси.',
        url: 'https://bfsa.egov.bg',
        type: 'Портал',
        icon: '🏛️',
        free: true,
        language: 'bg',
        verified: true,
      },
      {
        title: 'Практическо пчеларство - Здраве',
        description: 'Информация за болести, профилактика и лечение на пчелни семейства.',
        url: 'https://beeshopbg.com/category/knigi/',
        type: 'Магазин',
        icon: '📚',
        free: false,
        language: 'bg',
        verified: true,
      },
    ],
  },
  {
    id: 'organizations',
    title: 'Организации и институции',
    description: 'Професионални сдружения и официални институции',
    resources: [
      {
        title: 'БПРА - Развъдна асоциация',
        description: 'Българска Пчеларска Развъдна Асоциация. Професионални практики, майкопроизводство и нови технологии.',
        url: 'https://bpra.bg',
        type: 'Асоциация',
        icon: '🏛️',
        free: true,
        language: 'bg',
        verified: true,
      },
      {
        title: 'Конфедерация на българските пчелари',
        description: 'Организира защита на интереси, участва в Националната програма и разработва стандарти.',
        url: 'https://cbb.bg',
        type: 'Конфедерация',
        icon: '🤝',
        free: true,
        language: 'bg',
        verified: true,
      },
      {
        title: 'Министерство на земеделието',
        description: 'Официална информация за пчеларството, програми и политики от МЗХ.',
        url: 'https://www.mzh.government.bg/bg/politiki-i-programi/zhivotnovadstvo/pchelarstvo/',
        type: 'Институция',
        icon: '🏛️',
        free: true,
        language: 'bg',
        verified: true,
      },
    ],
  },
];

// Export flattened list
export const ALL_BEE_HEALTH_RESOURCES = BEE_HEALTH_RESOURCES.flatMap(
  (category) => category.resources
);

