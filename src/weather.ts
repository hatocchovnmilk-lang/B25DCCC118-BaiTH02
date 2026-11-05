import { City, Unit, WeatherData } from "./types";

export async function fetchWeather(city: City, signal: AbortSignal): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    timezone: "Asia/Ho_Chi_Minh",
    forecast_days: "7",
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal });
  if (!res.ok) throw new Error(`Máy chủ trả về lỗi ${res.status}`);
  return (await res.json()) as WeatherData;
}

/** Mã thời tiết WMO -> biểu tượng + mô tả */
export function describeCode(code: number): { icon: string; label: string } {
  if (code === 0) return { icon: "☀️", label: "Trời quang" };
  if (code === 1) return { icon: "🌤️", label: "Ít mây" };
  if (code === 2) return { icon: "⛅", label: "Mây rải rác" };
  if (code === 3) return { icon: "☁️", label: "Nhiều mây" };
  if (code === 45 || code === 48) return { icon: "🌫️", label: "Sương mù" };
  if (code >= 51 && code <= 57) return { icon: "🌦️", label: "Mưa phùn" };
  if (code >= 61 && code <= 67) return { icon: "🌧️", label: "Mưa" };
  if (code >= 71 && code <= 77) return { icon: "❄️", label: "Tuyết" };
  if (code >= 80 && code <= 82) return { icon: "🌦️", label: "Mưa rào" };
  if (code === 85 || code === 86) return { icon: "🌨️", label: "Mưa tuyết" };
  if (code >= 95) return { icon: "⛈️", label: "Dông" };
  return { icon: "❔", label: "Không xác định" };
}

/** Chỉ đổi cách hiển thị, không gọi lại API */
export function formatTemp(celsius: number, unit: Unit): string {
  const v = unit === "C" ? celsius : (celsius * 9) / 5 + 32;
  return `${Math.round(v)}°${unit}`;
}

export function formatDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

export function formatUpdated(iso: string): string {
  // iso dạng "2026-11-05T14:00"
  const [date, time] = iso.split("T");
  const [y, m, d] = date.split("-");
  return `${time} ngày ${d}/${m}/${y}`;
}
