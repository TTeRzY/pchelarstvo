import { NextRequest, NextResponse } from "next/server";
import { demoForecast } from "@/data/forecast";

const DEFAULT_LAT = Number(process.env.NEXT_PUBLIC_DEFAULT_LAT ?? "42.6977");
const DEFAULT_LNG = Number(process.env.NEXT_PUBLIC_DEFAULT_LNG ?? "23.3219");
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION ?? "София и околностите";

function windDescription(speed?: number, direction?: number) {
  if (typeof speed !== "number") return "няма информация";
  const dir = typeof direction === "number" ? direction : null;
  const sectors = [
    "северен",
    "североизточен",
    "източен",
    "югоизточен",
    "южен",
    "югозападен",
    "западен",
    "северозападен",
  ];
  let dirLabel = "";
  if (dir != null) {
    const index = Math.round((dir % 360) / 45) % sectors.length;
    dirLabel = sectors[index];
  }
  const speedLabel = speed < 2 ? "тих" : speed < 6 ? "лек" : speed < 10 ? "умерен" : "силен";
  return dirLabel ? `${speedLabel} ${dirLabel} вятър (${speed.toFixed(1)} м/с)` : `${speedLabel} вятър (${speed.toFixed(1)} м/с)`;
}

function nectarLevelFromConditions(temp?: number, humidity?: number, precipitation?: number) {
  if (typeof temp !== "number") return demoForecast.nectarLevel;
  if (precipitation != null && precipitation > 8) return "висок";
  if (temp >= 20 && temp <= 30 && (humidity == null || (humidity >= 40 && humidity <= 80))) return "висок";
  if (temp >= 15 && temp <= 34) return "умерен";
  return "нисък";
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = Number(searchParams.get("lat") ?? DEFAULT_LAT);
  const lng = Number(searchParams.get("lng") ?? DEFAULT_LNG);
  const region = searchParams.get("region") ?? DEFAULT_REGION;

  const openMeteoUrl = new URL("https://api.open-meteo.com/v1/forecast");
  openMeteoUrl.searchParams.set("latitude", lat.toString());
  openMeteoUrl.searchParams.set("longitude", lng.toString());
  openMeteoUrl.searchParams.set("current", "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m");
  openMeteoUrl.searchParams.set("daily", "precipitation_sum");
  openMeteoUrl.searchParams.set("timezone", "auto");

  try {
    const response = await fetch(openMeteoUrl.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 * 30 },
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo returned ${response.status}`);
    }

    const data = await response.json();
    const current = data.current ?? {};
    const daily = data.daily ?? {};

    const forecast = {
      region,
      temperatureC: typeof current.temperature_2m === "number" ? Math.round(current.temperature_2m) : demoForecast.temperatureC,
      wind: windDescription(current.wind_speed_10m, current.wind_direction_10m),
      humidity: typeof current.relative_humidity_2m === "number" ? Math.round(current.relative_humidity_2m) : demoForecast.humidity,
      nectarLevel: nectarLevelFromConditions(current.temperature_2m, current.relative_humidity_2m, daily.precipitation_sum?.[0]),
      nextRain:
        Array.isArray(daily.precipitation_sum) && daily.precipitation_sum.length > 0
          ? `${daily.precipitation_sum[0]} мм през следващите 24 часа`
          : demoForecast.nextRain,
      notes:
        current.temperature_2m != null
          ? current.temperature_2m >= 18 && current.temperature_2m <= 30
            ? "Температурите са подходящи за активна работа на пчелите."
            : current.temperature_2m < 10
            ? "Студено време – ограничете отварянето на кошерите."
            : "Следете влагата и осигурете проветрение на кошерите."
          : demoForecast.notes,
    } as const;

    return NextResponse.json({ forecast, source: "open-meteo" });
  } catch (error) {
    console.error("Forecast fetch failed", error);
    return NextResponse.json({ forecast: { ...demoForecast, region }, source: "fallback", error: String(error) });
  }
}

