export type ForecastLevel = "нисък" | "умерен" | "висок";

export type ForecastEntry = {
  region: string;
  temperatureC: number | null;
  wind: string;
  humidity: number | null;
  nectarLevel: ForecastLevel;
  nextRain: string | null;
  notes?: string | null;
};
