const WMO = {
  0: { label: "Clear", icon: "sun" },
  1: { label: "Mostly clear", icon: "sun" },
  2: { label: "Partly cloudy", icon: "cloud-sun" },
  3: { label: "Overcast", icon: "cloud" },
  45: { label: "Fog", icon: "cloud-fog" },
  48: { label: "Icy fog", icon: "cloud-fog" },
  51: { label: "Light drizzle", icon: "cloud-drizzle" },
  53: { label: "Drizzle", icon: "cloud-drizzle" },
  55: { label: "Heavy drizzle", icon: "cloud-drizzle" },
  61: { label: "Light rain", icon: "cloud-rain" },
  63: { label: "Rain", icon: "cloud-rain" },
  65: { label: "Heavy rain", icon: "cloud-rain" },
  71: { label: "Light snow", icon: "snowflake" },
  73: { label: "Snow", icon: "snowflake" },
  75: { label: "Heavy snow", icon: "snowflake" },
  77: { label: "Snow grains", icon: "snowflake" },
  80: { label: "Rain showers", icon: "cloud-rain" },
  81: { label: "Rain showers", icon: "cloud-rain" },
  82: { label: "Heavy showers", icon: "cloud-rain" },
  85: { label: "Snow showers", icon: "snowflake" },
  86: { label: "Snow showers", icon: "snowflake" },
  95: { label: "Thunderstorm", icon: "cloud-lightning" },
  96: { label: "Thunderstorm", icon: "cloud-lightning" },
  99: { label: "Thunderstorm", icon: "cloud-lightning" },
};

const ICONS = {
  sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
  "cloud-sun": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/></svg>`,
  cloud: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
  "cloud-fog": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 17H7"/><path d="M17 21H9"/></svg>`,
  "cloud-drizzle": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 19v1"/><path d="M8 14v1"/><path d="M16 19v1"/><path d="M16 14v1"/><path d="M12 21v1"/><path d="M12 16v1"/></svg>`,
  "cloud-rain": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`,
  snowflake: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m10 20-1.25-2.5L6 18"/><path d="M10 4 8.75 6.5 6 6"/><path d="m14 20 1.25-2.5L18 18"/><path d="m14 4 1.25 2.5L18 6"/><path d="m17 21-3-6h-4"/><path d="m17 3-3 6 1.5 3"/><path d="M2 12h6.5L10 9"/><path d="m20 10-1.5 2 1.5 2"/><path d="M22 12h-6.5L14 15"/><path d="m4 10 1.5 2L4 14"/><path d="m7 21 3-6-1.5-3"/><path d="m7 3 3 6h4"/></svg>`,
  "cloud-lightning": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/></svg>`,
  map: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`,
};

const COORDS_KEY = "weatherCoords";

/**
 * @typedef {{temp: number, label: string, iconHtml: string, feelsLike?: number, humidity?: number, wind?: number, needsLocation?: boolean}} WeatherResult
 * @typedef {{time: string, temp: number, label: string, iconHtml: string, precip?: number}} HourPoint
 * @typedef {{date: string, high: number, low: number, label: string, iconHtml: string, precip?: number}} DayPoint
 * @typedef {{current: WeatherResult, hourly: HourPoint[], daily: DayPoint[], place?: string}} ForecastBundle
 */

function metaFor(code) {
  return WMO[code] || { label: "Weather", icon: "cloud" };
}

function iconFor(code) {
  const meta = metaFor(code);
  return ICONS[meta.icon] || ICONS.cloud;
}

/**
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
async function getCoords() {
  const cached = await chrome.storage.local.get(COORDS_KEY);
  const previous = cached[COORDS_KEY];

  if (!navigator.geolocation) {
    if (previous) return previous;
    const err = new Error("Geolocation unavailable");
    err.code = 0;
    throw err;
  }

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 15 * 60 * 1000,
      });
    });
    const coords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    await chrome.storage.local.set({ [COORDS_KEY]: coords });
    return coords;
  } catch (error) {
    if (previous) return previous;
    throw error;
  }
}

/**
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<ForecastBundle>}
 */
async function forecastBundle(latitude, longitude) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m"
  );
  url.searchParams.set(
    "hourly",
    "temperature_2m,weather_code,precipitation_probability"
  );
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max"
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "7");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Weather request failed");
  const data = await res.json();

  const code = data.current?.weather_code ?? 0;
  const meta = metaFor(code);
  const current = {
    temp: Math.round(data.current.temperature_2m),
    label: meta.label,
    iconHtml: iconFor(code),
    feelsLike: Math.round(data.current.apparent_temperature),
    humidity: Math.round(data.current.relative_humidity_2m),
    wind: Math.round(data.current.wind_speed_10m),
  };

  const now = Date.now();
  const hourly = [];
  const times = data.hourly?.time || [];
  for (let i = 0; i < times.length && hourly.length < 24; i++) {
    const t = new Date(times[i]).getTime();
    if (t < now - 30 * 60 * 1000) continue;
    const hCode = data.hourly.weather_code[i];
    hourly.push({
      time: times[i],
      temp: Math.round(data.hourly.temperature_2m[i]),
      label: metaFor(hCode).label,
      iconHtml: iconFor(hCode),
      precip: data.hourly.precipitation_probability?.[i] ?? 0,
    });
  }

  const daily = (data.daily?.time || []).map((date, i) => {
    const dCode = data.daily.weather_code[i];
    return {
      date,
      high: Math.round(data.daily.temperature_2m_max[i]),
      low: Math.round(data.daily.temperature_2m_min[i]),
      label: metaFor(dCode).label,
      iconHtml: iconFor(dCode),
      precip: data.daily.precipitation_probability_max?.[i] ?? 0,
    };
  });

  const place = formatPlace(data.timezone);
  return { current, hourly, daily, place };
}

/** @param {string} [timezone] */
function formatPlace(timezone) {
  if (!timezone) return "Local weather";
  const city = timezone.split("/").pop()?.replace(/_/g, " ");
  return city || "Local weather";
}

function locationNeeded() {
  return {
    temp: 0,
    label: "Enable location",
    iconHtml: ICONS.map,
    needsLocation: true,
  };
}

/**
 * @returns {Promise<WeatherResult>}
 */
export async function fetchWeather() {
  const allowed = await hasGeolocationPermission();
  const cached = await chrome.storage.local.get(COORDS_KEY);
  if (!allowed && !cached[COORDS_KEY]) return locationNeeded();

  try {
    const { latitude, longitude } = await getCoords();
    const bundle = await forecastBundle(latitude, longitude);
    return bundle.current;
  } catch (error) {
    const denied =
      error?.code === 1 ||
      (typeof GeolocationPositionError !== "undefined" &&
        error?.code === GeolocationPositionError.PERMISSION_DENIED);
    if (denied || !allowed) return locationNeeded();
    throw error;
  }
}

/**
 * @returns {Promise<ForecastBundle>}
 */
export async function fetchForecast() {
  const { latitude, longitude } = await getCoords();
  return forecastBundle(latitude, longitude);
}

/**
 * @returns {Promise<boolean>}
 */
export async function hasGeolocationPermission() {
  try {
    return await chrome.permissions.contains({ permissions: ["geolocation"] });
  } catch {
    return false;
  }
}

/**
 * Ask Chrome for location access, then resolve coordinates.
 * Must be called from a user gesture so Chrome shows its permission prompt.
 * @returns {Promise<boolean>}
 */
export async function requestLocationAccess() {
  try {
    const already = await chrome.permissions.contains({ permissions: ["geolocation"] });
    if (!already) {
      const granted = await chrome.permissions.request({ permissions: ["geolocation"] });
      if (!granted) return false;
    }
  } catch {
    return false;
  }

  if (!navigator.geolocation) return false;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await chrome.storage.local.set({
          [COORDS_KEY]: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
        resolve(true);
      },
      () => resolve(false),
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}
