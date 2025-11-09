export type Resource = {
  title: string;
  description: string;
  url: string;
  type: string;
  icon: string;
  free?: boolean;
  language?: 'bg' | 'en';
  verified?: boolean;
};

export type ResourceCategory = {
  id: string;
  title: string;
  description: string;
  resources: Resource[];
};

// Практики в пчеларството - Bulgarian Beekeeping Practices Resources
export const PRACTICES_RESOURCES: ResourceCategory[] = [
  {
    id: 'basics',
    title: 'Основи и ръководства',
    description: 'Базови материали и пълни ръководства',
    resources: [
      {
        title: 'БАБХ - Болести на пчелите',
        description: 'Официална информация за болести, надзор и контрол от Българската агенция по безопасност на храните.',
        url: 'https://bfsa.egov.bg/wps/portal/bfsa-web/activities/animal.health.and.welfare/animal-health/current.information.on.animal.diseases/bee.diseases',
        type: 'Институция',
        icon: '🐝',
        free: true,
        language: 'bg',
        verified: true,
      },
      {
        title: 'Регистрация на пчелин',
        description: 'Изисквания и процедури за регистрация на пчелини и кандидатстване за субсидии.',
        url: 'https://www.naas.government.bg/vprosi-i-otgovori/publikuvani-otgovori/kakvi-sa-iziskvaniyata-za-registraciyata-na-pchelin-i-kandidatstvane-za-subsidii',
        type: 'Статия',
        icon: '📋',
        free: true,
        language: 'bg',
        verified: true,
      },
      {
        title: 'Биологично пчеларство',
        description: 'Информация за биологичното пчеларство, включително изисквания и насоки за сертифициране.',
        url: 'https://sp2023.bg/index.php/bg/intervencii/ii-a-9-biologicno-pcelarstvo',
        type: 'Ръководство',
        icon: '🌱',
        free: true,
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
        title: 'Програми и субсидии',
        description: 'Финансова подкрепа и програми за развитие на пчеларството от ДФЗ.',
        url: 'https://www.dfz.bg/beekeeping/',
        type: 'Институция',
        icon: '💰',
        free: true,
        language: 'bg',
        verified: true,
      },
    ],
  },
  {
    id: 'publications',
    title: 'Актуални публикации',
    description: 'Статии, новини и практически съвети',
    resources: [
      {
        title: 'Български Фермер - Пчеларство',
        description: 'Актуални статии, практически съвети и новини от пчеларския сектор.',
        url: 'https://www.bgfermer.bg',
        type: 'Издание',
        icon: '📰',
        free: true,
        language: 'bg',
        verified: true,
      },
      {
        title: 'Закон за пчеларството',
        description: 'Официален законодателен документ регулиращ пчеларската дейност в България.',
        url: 'https://www.mzh.government.bg/odz-razgrad/Libraries/%D0%97%D0%B0%D0%BA%D0%BE%D0%BD%D0%B8/ZPch.sflb.ashx',
        type: 'Документ',
        icon: '📖',
        free: true,
        language: 'bg',
        verified: true,
      },
    ],
  },
];

// Export flattened list for easy access
export const ALL_PRACTICES_RESOURCES = PRACTICES_RESOURCES.flatMap(
  (category) => category.resources
);

