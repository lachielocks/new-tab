const ICON_BASE = "../icons/weather";

const MAP_PIN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`;

/**
 * WMO weather codes → label + day/night icon filenames (without .svg).
 * @type {Record<number, {label: string, day: string, night?: string}>}
 */
const WMO = {
  0: { label: "Clear", day: "sunny", night: "clear-night" },
  1: { label: "Mostly clear", day: "cloudy-clear-at-times", night: "cloudy-clear-at-times-night" },
  2: { label: "Partly cloudy", day: "partly-cloudy", night: "partly-cloudy-night" },
  3: { label: "Overcast", day: "cloudy" },
  45: { label: "Fog", day: "fog" },
  48: { label: "Icy fog", day: "fog" },
  51: { label: "Light drizzle", day: "drizzle-and-sun", night: "drizzle-and-moon" },
  53: { label: "Drizzle", day: "drizzle" },
  55: { label: "Heavy drizzle", day: "drizzle" },
  56: { label: "Freezing drizzle", day: "sleet" },
  57: { label: "Freezing drizzle", day: "sleet" },
  61: { label: "Light rain", day: "rain-and-sun", night: "rain-and-moon" },
  63: { label: "Rain", day: "rain" },
  65: { label: "Heavy rain", day: "heavy-rain" },
  66: { label: "Freezing rain", day: "sleet" },
  67: { label: "Freezing rain", day: "sleet" },
  71: { label: "Light snow", day: "snow" },
  73: { label: "Snow", day: "snow" },
  75: { label: "Heavy snow", day: "blizzard" },
  77: { label: "Snow grains", day: "snow" },
  80: { label: "Rain showers", day: "scattered-showers", night: "scattered-showers-night" },
  81: { label: "Rain showers", day: "scattered-showers", night: "scattered-showers-night" },
  82: { label: "Heavy showers", day: "heavy-rain" },
  85: { label: "Snow showers", day: "snow" },
  86: { label: "Snow showers", day: "blizzard" },
  95: { label: "Thunderstorm", day: "thunderstorm" },
  96: { label: "Thunderstorm", day: "rain-and-thunderstorm" },
  99: { label: "Thunderstorm", day: "hail" },
};

const COORDS_KEY = "weatherCoords";

/**
 * @typedef {{temp: number, label: string, iconHtml: string, feelsLike?: number, humidity?: number, wind?: number, needsLocation?: boolean}} WeatherResult
 * @typedef {{time: string, temp: number, label: string, iconHtml: string, precip?: number}} HourPoint
 * @typedef {{date: string, high: number, low: number, label: string, iconHtml: string, precip?: number}} DayPoint
 * @typedef {{current: WeatherResult, hourly: HourPoint[], daily: DayPoint[], place?: string}} ForecastBundle
 */

function metaFor(code) {
  return WMO[code] || { label: "Weather", day: "cloudy" };
}

/**
 * @param {number} code
 * @param {boolean} [isDay=true]
 */
function iconNameFor(code, isDay = true) {
  const meta = metaFor(code);
  if (!isDay && meta.night) return meta.night;
  return meta.day || "cloudy";
}

/**
 * @param {string} name
 */
function iconImg(name) {
  return `<img class="weather-glyph" src="${ICON_BASE}/${name}.svg" alt="" draggable="false" />`;
}

/**
 * @param {number} code
 * @param {boolean} [isDay=true]
 */
function iconFor(code, isDay = true) {
  return iconImg(iconNameFor(code, isDay));
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function asDay(value) {
  return value !== 0 && value !== false;
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
    "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day"
  );
  url.searchParams.set(
    "hourly",
    "temperature_2m,weather_code,precipitation_probability,is_day"
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
  const isDay = asDay(data.current?.is_day);
  const meta = metaFor(code);
  const current = {
    temp: Math.round(data.current.temperature_2m),
    label: meta.label,
    iconHtml: iconFor(code, isDay),
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
    const hDay = asDay(data.hourly.is_day?.[i] ?? true);
    hourly.push({
      time: times[i],
      temp: Math.round(data.hourly.temperature_2m[i]),
      label: metaFor(hCode).label,
      iconHtml: iconFor(hCode, hDay),
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
      iconHtml: iconFor(dCode, true),
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
    iconHtml: MAP_PIN,
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
  if (!navigator.geolocation) return false;
  try {
    if (navigator.permissions?.query) {
      const status = await navigator.permissions.query({ name: "geolocation" });
      return status.state === "granted";
    }
  } catch {
    // permissions.query may reject for geolocation in some contexts
  }
  const cached = await chrome.storage.local.get(COORDS_KEY);
  return Boolean(cached[COORDS_KEY]);
}

/**
 * Ask the browser for location access via a user gesture.
 * @returns {Promise<boolean>}
 */
export async function requestLocationAccess() {
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
