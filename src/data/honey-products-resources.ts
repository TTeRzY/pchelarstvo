import type { ResourceCategory } from './beekeeping-resources';

// Рецепти и продукти с мед - Honey Recipes & Bee Products Resources
export const HONEY_PRODUCTS_RESOURCES: ResourceCategory[] = [
  {
    id: 'recipes',
    title: 'Рецепти с мед',
    description: 'Кулинарни идеи и традиционни рецепти',
    resources: [
      {
        title: 'Български рецепти с мед',
        description: 'Традиционни български сладкиши, напитки и ястия с мед - баклава, курабии, медовина.',
        url: 'https://www.gotvach.bg/search?q=%D0%BC%D0%B5%D0%B4',
        type: 'Рецепти',
        icon: '🍰',
        free: true,
        language: 'bg',
        verified: true,
      },
      {
        title: 'Здравословна кухня с мед',
        description: 'Рецепти за здравословно хранене, смутита, десерти и закуски с натурален мед.',
        url: 'https://www.zdraveikrasota.bg/search?q=%D1%80%D0%B5%D1%86%D0%B5%D0%BF%D1%82%D0%B8+%D1%81+%D0%BC%D0%B5%D0%B4',
        type: 'Рецепти',
        icon: '🥗',
        free: true,
        language: 'bg',
        verified: true,
      },
      {
        title: 'Медни сладки - 50 рецепти',
        description: 'Колекция от традиционни и съвременни рецепти за сладкиши и десерти с мед.',
        url: 'https://recepti.gotvach.bg/r-category/1027-%D1%80%D0%B5%D1%86%D0%B5%D0%BF%D1%82%D0%B8-%D1%81-%D0%BC%D0%B5%D0%B4',
        type: 'Колекция',
        icon: '🍪',
        free: true,
        language: 'bg',
        verified: true,
      },
    ],
  },
  {
    id: 'products',
    title: 'Пчелни продукти',
    description: 'Прополис, прашец, восък и други продукти',
    resources: [
      {
        title: 'Прополис - Свойства и приложение',
        description: 'Какво е прополис, как се събира, лечебни свойства и начини на употреба.',
        url: 'https://istinskimed.bg/propolis/',
        type: 'Ръководство',
        icon: '💊',
        free: true,
        language: 'bg',
        verified: true,
      },
      {
        title: 'Пчелен прашец - Добив и съхранение',
        description: 'Технология за събиране на пчелен прашец, изсушаване, пакетиране и съхранение.',
        url: 'https://istinskimed.bg/bee-pollen/',
        type: 'Статия',
        icon: '🌼',
        free: true,
        language: 'bg',
        verified: true,
      },
      {
        title: 'Пчелен восък - Обработка и употреба',
        description: 'Как да извлечете, пречистите и използвате пчелен восък за свещи, козметика и други продукти.',
        url: 'https://beeshopbg.com/category/pcelen-vosak/',
        type: 'Ръководство',
        icon: '🕯️',
        free: true,
        language: 'bg',
        verified: true,
      },
    ],
  },
  {
    id: 'health-cosmetics',
    title: 'Здраве и козметика',
    description: 'Лечебни свойства и козметична употреба',
    resources: [
      {
        title: 'Мед в народната медицина',
        description: 'Традиционни български рецепти за лечение с мед - кашлица, грип, рани, стомашни проблеми.',
        url: 'https://zdraveikrasota.bg/med/',
        type: 'Статия',
        icon: '🏥',
        free: true,
        language: 'bg',
        verified: true,
      },
      {
        title: 'Домашна козметика с мед',
        description: 'Рецепти за маски за лице, скрабове за тяло и продукти за коса с мед и пчелни продукти.',
        url: 'https://www.beauty.bg/search?q=%D0%BC%D0%B5%D0%B4',
        type: 'Рецепти',
        icon: '🧴',
        free: true,
        language: 'bg',
        verified: true,
      },
      {
        title: 'Апитерапия - Лечение с пчелни продукти',
        description: 'Научни изследвания и практики за лечение с мед, прополис, пчелна отрова и маточно мляко.',
        url: 'https://istinskimed.bg/apitherapy/',
        type: 'Ръководство',
        icon: '⚕️',
        free: true,
        language: 'bg',
        verified: true,
      },
    ],
  },
];

// Export flattened list
export const ALL_HONEY_PRODUCTS_RESOURCES = HONEY_PRODUCTS_RESOURCES.flatMap(
  (category) => category.resources
);

