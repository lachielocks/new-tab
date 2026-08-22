/** @typedef {import('./types.js').Settings} Settings */

export const DEFAULT_SETTINGS = {
  name: "",
  setupComplete: false,
  showClock: true,
  showGreeting: true,
  showSearch: true,
  showSearchHint: true,
  showQuickLinks: true,
  showWeather: true,
  showPhotoCredit: true,
  showSettingsButton: true,
  showBackground: true,
  use24h: false,
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
  newPhotoOnOpen: true,
  quickLinks: /** @type {{title: string, url: string}[]} */ ([]),
};

const KEY = "newTabSettings";

/**
 * @param {Record<string, unknown>} stored
 */
function migrateStored(stored) {
  if (stored.showQuickLinks === undefined && stored.quickLinksEnabled !== undefined) {
    stored.showQuickLinks = stored.quickLinksEnabled;
  }
  return stored;
}

/**
 * @returns {Promise<Settings>}
 */
export async function loadSettings() {
  const result = await chrome.storage.local.get(KEY);
  const stored = migrateStored(result[KEY] || {});
  return { ...DEFAULT_SETTINGS, ...stored };
}

/**
 * @param {Partial<Settings>} patch
 * @returns {Promise<Settings>}
 */
export async function saveSettings(patch) {
  const current = await loadSettings();
  const next = { ...current, ...patch };
  await chrome.storage.local.set({ [KEY]: next });
  return next;
}
