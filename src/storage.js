/** @typedef {import('./types.js').Settings} Settings */
import { DEFAULT_LAYOUT, normalizeLayout, placedWidgets } from "./layout.js";

export const DEFAULT_SETTINGS = {
  name: "",
  setupComplete: false,
  showClock: true,
  showGreeting: true,
  showSearch: true,
  showSearchHint: true,
  searchHintOpens: 0,
  showQuickLinks: true,
  alwaysShowQuickLinks: false,
  showWeather: true,
  showPhotoCredit: true,
  showReroll: true,
  showSettingsButton: true,
  showBackground: true,
  use24h: false,
  showSeconds: false,
  clockStyle: /** @type {'digital'|'analog'} */ ("digital"),
  bgSource: "unsplash",
  bgCategory: "nature",
  customImages: /** @type {string[]} */ ([]),
  searchEngine: "google",
  aiProvider: "acosta",
  fontPreset: "Bricolage Grotesque",
  googleFontName: "",
  customFontDataUrl: "",
  customFontFormat: "",
  searchMode: "web",
  lastUnsplash: null,
  lastCustom: null,
  recentUnsplashUrls: /** @type {string[]} */ ([]),
  wallpaperHistory: /** @type {import('./types.js').WallpaperPhoto[]} */ ([]),
  newPhotoOnOpen: true,
  quickLinks: /** @type {{title: string, url: string, icon?: string, display?: 'name'|'icon'|'both'}[]} */ ([]),
  layout: DEFAULT_LAYOUT.map((cell) => [...cell]),
};

const KEY = "newTabSettings";

/**
 * @param {import('./types.js').WidgetId[][]} layout
 */
function showFlagsFromLayout(layout) {
  const placed = placedWidgets(normalizeLayout(layout));
  return {
    showClock: placed.has("clock"),
    showGreeting: placed.has("greeting"),
    showSearch: placed.has("search"),
    showQuickLinks: placed.has("quicklinks"),
    showWeather: placed.has("weather"),
    showPhotoCredit: placed.has("credit"),
    showReroll: placed.has("reroll"),
    showSettingsButton: placed.has("settings"),
  };
}

/**
 * @param {Record<string, unknown>} stored
 */
function migrateStored(stored) {
  if (stored.showQuickLinks === undefined && stored.quickLinksEnabled !== undefined) {
    stored.showQuickLinks = stored.quickLinksEnabled;
  }
  if (stored.layout !== undefined) {
    stored.layout = normalizeLayout(stored.layout);
    Object.assign(stored, showFlagsFromLayout(/** @type {import('./types.js').WidgetId[][]} */ (stored.layout)));
  }
  if (!Array.isArray(stored.wallpaperHistory)) {
    stored.wallpaperHistory = [];
  }
  // Drop legacy weather part customization keys
  delete stored.weatherChip;
  delete stored.weatherExpand;
  if (typeof stored.searchHintOpens !== "number" || stored.searchHintOpens < 0) {
    stored.searchHintOpens = 0;
  }
  return stored;
}

/**
 * @returns {Promise<Settings>}
 */
export async function loadSettings() {
  const result = await chrome.storage.local.get(KEY);
  const stored = migrateStored(result[KEY] || {});
  const layout = normalizeLayout(stored.layout ?? DEFAULT_SETTINGS.layout);
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    layout,
    ...showFlagsFromLayout(layout),
    searchHintOpens:
      typeof stored.searchHintOpens === "number" && stored.searchHintOpens >= 0
        ? Math.floor(stored.searchHintOpens)
        : 0,
    wallpaperHistory: Array.isArray(stored.wallpaperHistory)
      ? stored.wallpaperHistory
      : [],
  };
}

/**
 * @param {Partial<Settings>} patch
 * @returns {Promise<Settings>}
 */
export async function saveSettings(patch) {
  const current = await loadSettings();
  const next = { ...current, ...patch };
  if (patch.layout) {
    next.layout = normalizeLayout(patch.layout);
    Object.assign(next, showFlagsFromLayout(next.layout));
  }
  await chrome.storage.local.set({ [KEY]: next });
  return next;
}
