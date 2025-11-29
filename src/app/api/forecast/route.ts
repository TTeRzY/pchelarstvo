import { NextRequest, NextResponse } from "next/server";

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

function nectarLevelFromConditions(temp?: number, humidity?: number, precipitation?: number): "нисък" | "умерен" | "висок" {
  if (typeof temp !== "number") return "умерен";
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

    const temperatureC = typeof current.temperature_2m === "number" ? Math.round(current.temperature_2m) : null;
    const humidity = typeof current.relative_humidity_2m === "number" ? Math.round(current.relative_humidity_2m) : null;
    const precipitation = Array.isArray(daily.precipitation_sum) && daily.precipitation_sum.length > 0 ? daily.precipitation_sum[0] : null;

    const forecast = {
      region,
      temperatureC: temperatureC ?? null,
      wind: windDescription(current.wind_speed_10m, current.wind_direction_10m),
      humidity: humidity ?? null,
      nectarLevel: nectarLevelFromConditions(current.temperature_2m, current.relative_humidity_2m, precipitation),
      nextRain: precipitation != null ? `${precipitation} мм през следващите 24 часа` : null,
      notes:
        temperatureC != null
          ? temperatureC >= 18 && temperatureC <= 30
            ? "Температурите са подходящи за активна работа на пчелите."
            : temperatureC < 10
            ? "Студено време – ограничете отварянето на кошерите."
            : "Следете влагата и осигурете проветрение на кошерите."
          : null,
    } as const;

    return NextResponse.json({ forecast, source: "open-meteo" });
  } catch (error) {
    console.error("Forecast fetch failed", error);
    // Return error instead of fallback data
    return NextResponse.json(
      { 
        error: "Failed to fetch forecast data",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

