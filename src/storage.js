/** @typedef {import('./types.js').Settings} Settings */

export const DEFAULT_SETTINGS = {
  name: "",
  setupComplete: false,
  showWeather: true,
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
};

const KEY = "newTabSettings";

/**
 * @returns {Promise<Settings>}
 */
export async function loadSettings() {
  const result = await chrome.storage.local.get(KEY);
  return { ...DEFAULT_SETTINGS, ...(result[KEY] || {}) };
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
