/**
 * Shared honey products list - source of truth for all pages
 * This ensures consistency across homepage, marketplace, and listing forms
 */

export type ProductOption = {
  value: string;
  labelKey:
    | "products.acacia"
    | "products.linden"
    | "products.honeydew"
    | "products.bouquet"
    | "products.sunflower"
    | "products.herbs"
    | "products.lavender";
};

export const HONEY_PRODUCTS: ProductOption[] = [
  { value: "Акациев мед", labelKey: "products.acacia" },
  { value: "Липов мед", labelKey: "products.linden" },
  { value: "Манов мед", labelKey: "products.honeydew" },
  { value: "Букет", labelKey: "products.bouquet" },
  { value: "Слънчогледов мед", labelKey: "products.sunflower" },
  { value: "Билков мед", labelKey: "products.herbs" },
  { value: "Лавандула", labelKey: "products.lavender" },
];

