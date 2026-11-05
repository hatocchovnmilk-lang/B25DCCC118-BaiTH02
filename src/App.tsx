import { useEffect, useState } from "react";
import { CITIES } from "./cities";
import { City, Unit, WeatherData } from "./types";
import { describeCode, fetchWeather, formatDay, formatTemp, formatUpdated } from "./weather";

const STORAGE_KEY = "th02:selectedCity";

function loadInitialCity(): City {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return CITIES.find((c) => c.id === saved) ?? CITIES[0];
  } catch {
    return CITIES[0];
  }
}

type Status = "loading" | "error" | "success";

export default function App() {
  const [city, setCity] = useState<City>(loadInitialCity);
  const [unit, setUnit] = useState<Unit>("C");
  const [data, setData] = useState<WeatherData | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [attempt, setAttempt] = useState(0); // tăng để thử lại

  // Chỉ gọi API khi đổi thành phố hoặc bấm "Thử lại" (đổi °C/°F không gọi lại)
  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    fetchWeather(city, controller.signal)
      .then((d) => {
        setData(d);
        setStatus("success");
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setErrorMsg(e instanceof Error ? e.message : "Không rõ nguyên nhân");
        setStatus("error");
      });
    return () => controller.abort();
  }, [city, attempt]);

  function selectCity(c: City) {
    setCity(c);
    try {
      localStorage.setItem(STORAGE_KEY, c.id);
    } catch {
      /* bỏ qua nếu trình duyệt chặn localStorage */
    }
  }

  const now = data ? describeCode(data.current.weather_code) : null;

  return (
    <div className="app">
      <header className="topbar">
        <h1>Thời tiết Việt Nam</h1>
        <div className="unit-toggle" role="group" aria-label="Đơn vị nhiệt độ">
          {(["C", "F"] as Unit[]).map((u) => (
            <button
              key={u}
              className={unit === u ? "active" : ""}
              aria-pressed={unit === u}
              onClick={() => setUnit(u)}
            >
              °{u}
            </button>
          ))}
        </div>
      </header>

      <div className="layout">
        <nav className="city-list" aria-label="Danh sách thành phố">
          {CITIES.map((c) => (
            <button
              key={c.id}
              className={`city ${c.id === city.id ? "selected" : ""}`}
              aria-current={c.id === city.id}
              onClick={() => selectCity(c)}
            >
              {c.name}
            </button>
          ))}
        </nav>

        <main className="detail" aria-live="polite">
          {status === "loading" && <p className="state">Đang tải dữ liệu thời tiết…</p>}

          {status === "error" && (
            <div className="state error">
              <p>Không tải được dữ liệu cho {city.name}.</p>
              <p className="muted">{errorMsg}</p>
              <button className="retry" onClick={() => setAttempt((n) => n + 1)}>
                Thử lại
              </button>
            </div>
          )}

          {status === "success" && data && now && (
            <>
              <section className="current">
                <h2>{city.name}</h2>
                <div className="now">
                  <span className="big-icon" aria-hidden="true">{now.icon}</span>
                  <span className="temp">{formatTemp(data.current.temperature_2m, unit)}</span>
                </div>
                <p className="label">{now.label}</p>
                <dl className="stats">
                  <div>
                    <dt>Độ ẩm</dt>
                    <dd>{data.current.relative_humidity_2m}%</dd>
                  </div>
                  <div>
                    <dt>Tốc độ gió</dt>
                    <dd>{data.current.wind_speed_10m} km/h</dd>
                  </div>
                  <div>
                    <dt>Mã thời tiết</dt>
                    <dd>{data.current.weather_code}</dd>
                  </div>
                </dl>
                <p className="muted">Cập nhật lúc {formatUpdated(data.current.time)}</p>
              </section>

              <section className="forecast">
                <h3>Dự báo 7 ngày</h3>
                <ul>
                  {data.daily.time.map((day, i) => {
                    const d = describeCode(data.daily.weather_code[i]);
                    return (
                      <li key={day}>
                        <span className="day">{formatDay(day)}</span>
                        <span className="icon" title={d.label} aria-label={d.label}>{d.icon}</span>
                        <span className="hi">{formatTemp(data.daily.temperature_2m_max[i], unit)}</span>
                        <span className="lo">{formatTemp(data.daily.temperature_2m_min[i], unit)}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
