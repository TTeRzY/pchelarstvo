export type ForecastLevel = "нисък" | "умерен" | "висок";

export type ForecastEntry = {
  region: string;
  temperatureC: number;
  wind: string;
  humidity: number;
  nectarLevel: ForecastLevel;
  nextRain: string;
  notes?: string;
};

export const demoForecast: ForecastEntry = {
  region: "Цяла България",
  temperatureC: 22,
  wind: "лек южен вятър",
  humidity: 65,
  nectarLevel: "умерен",
  nextRain: "след 2 дни (местни превалявания)",
  notes: "Очаквай по-висок нектарен поток след следващите валежи.",
};
