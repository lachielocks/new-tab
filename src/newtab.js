import { loadSettings, saveSettings } from "./storage.js";
import { fetchWeather, fetchForecast, requestLocationAccess } from "./weather.js";
import { pickUnsplash, pickCustom } from "./backgrounds.js";
import { buildDestination, leadingIconHtml, placeholderFor } from "./search.js";
import { applyFont, readFontFile } from "./fonts.js";
import { checkForUpdate } from "./updates.js";
import { enhanceSelects, syncSelectUi, closeAllMenus } from "./dropdown.js";

/** @type {import('./types.js').Settings} */
let settings;

const els = {
  clock: document.getElementById("clock"),
  greeting: document.getElementById("greeting"),
  weather: document.getElementById("weather"),
  weatherTemp: document.getElementById("weather-temp"),
  weatherCond: document.getElementById("weather-cond"),
  weatherIcon: document.getElementById("weather-icon"),
  forecast: document.getElementById("forecast"),
  forecastClose: document.getElementById("forecast-close"),
  forecastPlace: document.getElementById("forecast-place"),
  forecastNowIcon: document.getElementById("forecast-now-icon"),
  forecastNowTemp: document.getElementById("forecast-now-temp"),
  forecastNowLabel: document.getElementById("forecast-now-label"),
  forecastStats: document.getElementById("forecast-stats"),
  forecastHourly: document.getElementById("forecast-hourly"),
  forecastDaily: document.getElementById("forecast-daily"),
  bgImage: document.getElementById("bg-image"),
  photoCredit: document.getElementById("photo-credit"),
  photoCreditLink: document.getElementById("photo-credit-link"),
  searchForm: document.getElementById("search-form"),
  searchInput: document.getElementById("search-input"),
  searchLeading: document.getElementById("search-leading"),
  searchHint: document.getElementById("search-hint"),
  quickLinks: document.getElementById("quick-links"),
  quickLinksZone: document.getElementById("quick-links-zone"),
  onboarding: document.getElementById("onboarding"),
  setupForm: document.getElementById("setup-form"),
  setupName: document.getElementById("setup-name"),
  setupStepName: document.getElementById("setup-step-name"),
  setupStepLocation: document.getElementById("setup-step-location"),
  setupLocationAllow: document.getElementById("setup-location-allow"),
  setupLocationSkip: document.getElementById("setup-location-skip"),
  setupLocationStatus: document.getElementById("setup-location-status"),
  settings: document.getElementById("settings"),
  settingsOpen: document.getElementById("settings-open"),
  settingsClose: document.getElementById("settings-close"),
  settingsSave: document.getElementById("settings-save"),
  settingsFoot: document.getElementById("settings-foot"),
  aboutVersion: document.getElementById("about-version"),
  settingName: document.getElementById("setting-name"),
  settingWeather: document.getElementById("setting-weather"),
  setting24h: document.getElementById("setting-24h"),
  settingQuickLinks: document.getElementById("setting-quick-links"),
  quickLinksEditor: document.getElementById("quick-links-editor"),
  quickLinksList: document.getElementById("quick-links-list"),
  quickLinkAdd: document.getElementById("quick-link-add"),
  settingBgNewOnOpen: document.getElementById("setting-bg-new-on-open"),
  settingBgSource: document.getElementById("setting-bg-source"),
  settingBgCategory: document.getElementById("setting-bg-category"),
  settingBgUpload: document.getElementById("setting-bg-upload"),
  unsplashOptions: document.getElementById("unsplash-options"),
  customOptions: document.getElementById("custom-options"),
  customThumbs: document.getElementById("custom-thumbs"),
  refreshBg: document.getElementById("refresh-bg"),
  bgDropzone: document.getElementById("bg-dropzone"),
  settingSearchEngine: document.getElementById("setting-search-engine"),
  settingAiProvider: document.getElementById("setting-ai-provider"),
  settingFontPreset: document.getElementById("setting-font-preset"),
  settingFontGoogle: document.getElementById("setting-font-google"),
  settingFontFile: document.getElementById("setting-font-file"),
  googleFontField: document.getElementById("google-font-field"),
  fileFontField: document.getElementById("file-font-field"),
  updateBanner: document.getElementById("update-banner"),
  updateBannerCopy: document.getElementById("update-banner-copy"),
  updateDownload: document.getElementById("update-download"),
  updateDismiss: document.getElementById("update-dismiss"),
};

let searchMode = "web";
/** @type {string[]} */
let draftCustomImages = [];
/** @type {{title: string, url: string}[]} */
let draftQuickLinks = [];
let draftFontDataUrl = "";
let draftFontFormat = "";
let clockTimer = 0;

async function init() {
  settings = await loadSettings();
  searchMode = settings.searchMode || "web";
  els.aboutVersion.textContent = chrome.runtime.getManifest().version;
  applyFont(settings);
  renderClock();
  renderGreeting();
  renderSearchChrome();
  renderQuickLinks();
  await applyBackground(false);
  updateWeatherVisibility();
  if (settings.setupComplete && settings.showWeather) loadWeather();

  if (!settings.setupComplete) {
    els.onboarding.hidden = false;
    els.setupStepName.hidden = false;
    els.setupStepLocation.hidden = true;
    els.setupName.focus();
  } else {
    els.searchInput.focus();
  }

  clockTimer = window.setInterval(renderClock, 1000);
  bindEvents();
  enhanceSelects();
  maybeShowUpdate();
}

function bindEvents() {
  els.setupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = els.setupName.value.trim();
    if (!name) return;
    settings = await saveSettings({ name });
    renderGreeting();
    els.setupStepName.hidden = true;
    els.setupStepLocation.hidden = false;
    els.setupLocationAllow.focus();
  });

  els.setupLocationAllow.addEventListener("click", async () => {
    els.setupLocationAllow.disabled = true;
    els.setupLocationStatus.hidden = false;
    els.setupLocationStatus.textContent = "Waiting for Chrome…";
    const granted = await requestLocationAccess();
    els.setupLocationAllow.disabled = false;
    if (granted) {
      await finishSetup({ showWeather: true });
      loadWeather();
      return;
    }
    els.setupLocationStatus.textContent =
      "Location wasn’t allowed. You can enable it later from the weather chip.";
  });

  els.setupLocationSkip.addEventListener("click", async () => {
    await finishSetup({ showWeather: false });
  });

  async function finishSetup(patch = {}) {
    settings = await saveSettings({ setupComplete: true, ...patch });
    els.onboarding.hidden = true;
    renderGreeting();
    updateWeatherVisibility();
    els.searchInput.focus();
  }

  els.settingsOpen.addEventListener("click", openSettings);
  els.settingsClose.addEventListener("click", closeSettings);
  els.settings.addEventListener("click", (e) => {
    if (e.target === els.settings) closeSettings();
  });

  els.settingsSave.addEventListener("click", saveSettingsFromForm);

  document.getElementById("settings-tabs").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tab]");
    if (!btn) return;
    const tab = btn.dataset.tab;
    document.querySelectorAll(".tabs__btn").forEach((b) => b.classList.toggle("is-active", b === btn));
    document.querySelectorAll(".tab-panel").forEach((p) => {
      p.classList.toggle("is-active", p.dataset.panel === tab);
    });
    els.settingsFoot.hidden = tab === "about";
  });

  els.settingBgSource.addEventListener("change", syncBgSourceUi);
  els.settingFontPreset.addEventListener("change", syncFontFields);
  els.settingQuickLinks.addEventListener("change", syncQuickLinksEditor);

  els.settingBgUpload.addEventListener("change", async () => {
    await addImageFiles([...(els.settingBgUpload.files || [])]);
    els.settingBgUpload.value = "";
  });

  bindDropzone(els.bgDropzone, async (files) => {
    await addImageFiles(files);
  });

  els.refreshBg.addEventListener("click", async () => {
    const photo =
      settings.bgSource === "custom"
        ? pickCustom(settings.customImages, {
            forceNew: true,
            previousUrl: settings.lastCustom?.url,
          })
        : pickUnsplash(els.settingBgCategory.value, {
            forceNew: true,
            previousUrl: settings.lastUnsplash?.url,
          });
    if (!photo) return;
    const patch =
      settings.bgSource === "custom"
        ? { customImages: draftCustomImages, lastCustom: photo }
        : { bgCategory: els.settingBgCategory.value, lastUnsplash: photo };
    settings = await saveSettings(patch);
    paintBackground(photo);
  });

  els.quickLinkAdd.addEventListener("click", () => {
    if (draftQuickLinks.length >= 8) return;
    draftQuickLinks.push({ title: "", url: "" });
    renderQuickLinkRows();
  });

  els.quickLinksZone.addEventListener("mouseleave", () => {
    const active = document.activeElement;
    if (active && els.quickLinks.contains(active)) {
      /** @type {HTMLElement} */ (active).blur();
    }
  });

  els.settingFontFile.addEventListener("change", async () => {
    const file = els.settingFontFile.files?.[0];
    if (!file) return;
    const { dataUrl, format } = await readFontFile(file);
    draftFontDataUrl = dataUrl;
    draftFontFormat = format;
    const zone = els.settingFontFile.closest(".dropzone");
    if (zone) {
      const title = zone.querySelector(".dropzone__title");
      if (title) title.textContent = file.name;
    }
  });

  bindDropzone(els.settingFontFile?.closest(".dropzone"), async (files) => {
    const file = files.find((f) => /\.(woff2?|ttf|otf)$/i.test(f.name) || f.type.includes("font"));
    if (!file) return;
    const { dataUrl, format } = await readFontFile(file);
    draftFontDataUrl = dataUrl;
    draftFontFormat = format;
    const zone = els.settingFontFile.closest(".dropzone");
    const title = zone?.querySelector(".dropzone__title");
    if (title) title.textContent = file.name;
  });

  els.searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Tab" && !e.shiftKey && !e.altKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      setSearchMode(searchMode === "web" ? "ai" : "web");
    }
  });

  els.searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const dest = buildDestination(
      searchMode,
      settings.searchEngine,
      settings.aiProvider,
      els.searchInput.value
    );
    if (!dest) return;
    window.location.href = dest;
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!els.forecast.hidden) closeForecast();
      else if (!els.settings.hidden) closeSettings();
    }
  });

  els.weather.addEventListener("click", async () => {
    if (els.weather.classList.contains("weather--needs-location")) {
      const granted = await requestLocationAccess();
      if (granted) loadWeather();
      return;
    }
    openForecast();
  });

  els.forecastClose.addEventListener("click", closeForecast);
  els.forecast.addEventListener("click", (e) => {
    if (e.target === els.forecast) closeForecast();
  });

  els.updateDismiss.addEventListener("click", async () => {
    const latest = els.updateBanner.dataset.latest || "";
    await chrome.storage.local.set({ dismissedUpdate: latest });
    els.updateBanner.hidden = true;
  });
}

function openSettings() {
  els.settingName.value = settings.name || "";
  els.settingWeather.checked = settings.showWeather;
  els.setting24h.checked = settings.use24h;
  els.settingQuickLinks.checked = settings.quickLinksEnabled;
  els.settingBgNewOnOpen.checked = settings.newPhotoOnOpen;
  els.settingBgSource.value = settings.bgSource;
  els.settingBgCategory.value = settings.bgCategory;
  els.settingSearchEngine.value = settings.searchEngine;
  els.settingAiProvider.value = settings.aiProvider;
  els.settingFontPreset.value = settings.fontPreset;
  els.settingFontGoogle.value = settings.googleFontName || "";
  draftCustomImages = [...(settings.customImages || [])];
  draftQuickLinks = (settings.quickLinks || []).map((link) => ({ ...link }));
  draftFontDataUrl = settings.customFontDataUrl || "";
  draftFontFormat = settings.customFontFormat || "";
  syncSelectUi(els.settingBgSource);
  syncSelectUi(els.settingBgCategory);
  syncSelectUi(els.settingSearchEngine);
  syncSelectUi(els.settingAiProvider);
  syncSelectUi(els.settingFontPreset);
  syncBgSourceUi();
  syncFontFields();
  syncQuickLinksEditor();
  renderThumbs();
  renderQuickLinkRows();
  const activeTab = document.querySelector(".tabs__btn.is-active")?.dataset.tab;
  els.settingsFoot.hidden = activeTab === "about";
  els.settings.hidden = false;
}

function closeSettings() {
  els.settings.hidden = true;
  closeAllMenus();
}

async function saveSettingsFromForm() {
  const patch = {
    name: els.settingName.value.trim() || settings.name,
    showWeather: els.settingWeather.checked,
    use24h: els.setting24h.checked,
    quickLinksEnabled: els.settingQuickLinks.checked,
    quickLinks: normalizeQuickLinks(draftQuickLinks),
    newPhotoOnOpen: els.settingBgNewOnOpen.checked,
    bgSource: els.settingBgSource.value,
    bgCategory: els.settingBgCategory.value,
    customImages: draftCustomImages,
    searchEngine: els.settingSearchEngine.value,
    aiProvider: els.settingAiProvider.value,
    fontPreset: els.settingFontPreset.value,
    googleFontName: els.settingFontGoogle.value.trim(),
    searchMode,
  };

  if (els.settingFontPreset.value === "custom-file" && draftFontDataUrl) {
    patch.customFontDataUrl = draftFontDataUrl;
    patch.customFontFormat = draftFontFormat;
  }

  settings = await saveSettings(patch);
  applyFont(settings);
  renderGreeting();
  renderClock();
  renderSearchChrome();
  renderQuickLinks();
  updateWeatherVisibility();
  if (settings.showWeather) {
    await requestLocationAccess();
    loadWeather();
  }
  await applyBackground(true);
  closeSettings();
}

function syncBgSourceUi() {
  const custom = els.settingBgSource.value === "custom";
  els.unsplashOptions.hidden = custom;
  els.customOptions.hidden = !custom;
}

function syncFontFields() {
  const value = els.settingFontPreset.value;
  els.googleFontField.hidden = value !== "custom-google";
  els.fileFontField.hidden = value !== "custom-file";
}

function syncQuickLinksEditor() {
  els.quickLinksEditor.hidden = !els.settingQuickLinks.checked;
}

function renderQuickLinkRows() {
  els.quickLinksList.innerHTML = "";
  draftQuickLinks.forEach((link, index) => {
    const row = document.createElement("div");
    row.className = "link-row";
    row.innerHTML = `
      <input class="field__input link-row__title" type="text" placeholder="Label" maxlength="32" value="${escapeAttr(link.title)}" />
      <input class="field__input link-row__url" type="url" placeholder="https://" inputmode="url" value="${escapeAttr(link.url)}" />
      <button type="button" class="link-row__remove" aria-label="Remove link">×</button>`;
    row.querySelector(".link-row__title").addEventListener("input", (e) => {
      draftQuickLinks[index].title = /** @type {HTMLInputElement} */ (e.target).value;
    });
    row.querySelector(".link-row__url").addEventListener("input", (e) => {
      draftQuickLinks[index].url = /** @type {HTMLInputElement} */ (e.target).value;
    });
    row.querySelector(".link-row__remove").addEventListener("click", () => {
      draftQuickLinks.splice(index, 1);
      renderQuickLinkRows();
    });
    els.quickLinksList.appendChild(row);
  });
  els.quickLinkAdd.disabled = draftQuickLinks.length >= 8;
}

function renderQuickLinks() {
  const links = settings.quickLinksEnabled ? settings.quickLinks || [] : [];
  if (!links.length) {
    els.quickLinksZone.hidden = true;
    els.quickLinks.innerHTML = "";
    return;
  }

  els.quickLinksZone.hidden = false;
  els.quickLinks.innerHTML = links
    .map((link) => {
      const url = normalizeUrl(link.url);
      if (!url) return "";
      const label = link.title?.trim() || linkDomain(url) || "Link";
      return `<a class="quick-links__item" href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
    })
    .join("");
}

/**
 * @param {{title: string, url: string}[]} links
 */
function normalizeQuickLinks(links) {
  return links
    .map((link) => ({
      title: link.title.trim(),
      url: normalizeUrl(link.url),
    }))
    .filter((link) => link.url)
    .slice(0, 8);
}

/**
 * @param {string} value
 */
function normalizeUrl(value) {
  const raw = value.trim();
  if (!raw) return "";
  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.href;
  } catch {
    return "";
  }
}

/**
 * @param {string} url
 */
function linkDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * @param {string} value
 */
function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * @param {string} value
 */
function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

function renderThumbs() {
  els.customThumbs.innerHTML = "";
  draftCustomImages.forEach((src, index) => {
    const item = document.createElement("div");
    item.className = "thumbs__item";
    item.innerHTML = `<img src="${src}" alt="" /><button type="button" class="thumbs__remove" aria-label="Remove image">×</button>`;
    item.querySelector("button").addEventListener("click", () => {
      draftCustomImages.splice(index, 1);
      renderThumbs();
    });
    els.customThumbs.appendChild(item);
  });
}

function setSearchMode(mode) {
  searchMode = mode;
  renderSearchChrome();
  saveSettings({ searchMode: mode }).then((s) => {
    settings = s;
  });
}

function renderSearchChrome() {
  els.searchLeading.innerHTML = leadingIconHtml(
    searchMode,
    settings.searchEngine,
    settings.aiProvider
  );
  els.searchInput.placeholder = placeholderFor(
    searchMode,
    settings.searchEngine,
    settings.aiProvider
  );
  const aiName =
    settings.aiProvider === "acosta"
      ? "Acosta"
      : settings.aiProvider.charAt(0).toUpperCase() + settings.aiProvider.slice(1);
  els.searchHint.textContent =
    searchMode === "ai"
      ? `Press Enter to ask ${aiName} · Tab for web search`
      : "Press Enter to search · Tab to ask AI";
}

function renderClock() {
  const now = new Date();
  const opts = {
    hour: "numeric",
    minute: "2-digit",
    hour12: !settings?.use24h,
  };
  const text = new Intl.DateTimeFormat(undefined, opts).format(now);
  els.clock.textContent = text.replace(/\s?(AM|PM)/i, (m) => m.toLowerCase());
  els.clock.dateTime = now.toISOString();
}

function renderGreeting() {
  const hour = new Date().getHours();
  let part = "evening";
  if (hour < 12) part = "morning";
  else if (hour < 18) part = "afternoon";
  const name = settings.name?.trim();
  els.greeting.textContent = name ? `Good ${part}, ${name}` : `Good ${part}`;
}

async function applyBackground(fromSettings) {
  const forceNew = settings.newPhotoOnOpen && !fromSettings;

  if (settings.bgSource === "custom") {
    const cached = settings.lastCustom;
    const keepCached = cached && !forceNew && !fromSettings;
    const photo = keepCached
      ? cached
      : pickCustom(settings.customImages, {
          forceNew: forceNew || fromSettings,
          previousUrl: cached?.url,
        });
    if (!photo) {
      showBackgroundFallback();
      return;
    }
    if (!keepCached || fromSettings) {
      settings = await saveSettings({ lastCustom: photo });
    }
    paintBackground(photo);
    return;
  }

  const cached = settings.lastUnsplash;
  const sameDay =
    cached &&
    cached.dayKey === dayKey() &&
    cached.category === settings.bgCategory &&
    !fromSettings &&
    !forceNew;

  const photo =
    sameDay && cached
      ? cached
      : pickUnsplash(settings.bgCategory, {
          forceNew: forceNew || fromSettings,
          previousUrl: cached?.url,
        });

  if (!sameDay || fromSettings || forceNew) {
    settings = await saveSettings({ lastUnsplash: photo });
  }
  paintBackground(photo);
}

function paintBackground(photo, { allowRetry = true } = {}) {
  if (!photo?.url) {
    showBackgroundFallback();
    return;
  }

  const img = new Image();
  img.onload = () => {
    els.bgImage.classList.remove("is-fallback");
    els.bgImage.style.backgroundImage = `url("${photo.url}")`;
    if (photo.credit) {
      els.photoCredit.hidden = false;
      els.photoCreditLink.textContent = photo.credit;
      els.photoCreditLink.href = photo.link || "#";
    } else {
      els.photoCredit.hidden = true;
    }
  };
  img.onerror = () => {
    if (allowRetry && settings.lastUnsplash?.url && settings.lastUnsplash.url !== photo.url) {
      paintBackground(settings.lastUnsplash, { allowRetry: false });
      return;
    }
    showBackgroundFallback();
  };
  img.src = photo.url;
}

function showBackgroundFallback() {
  els.bgImage.classList.add("is-fallback");
  els.bgImage.style.backgroundImage = "";
  els.photoCredit.hidden = true;
}

/**
 * @param {File[]} files
 */
async function addImageFiles(files) {
  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    if (file.size > 4.5 * 1024 * 1024) continue;
    const dataUrl = await readAsDataUrl(file);
    draftCustomImages.push(dataUrl);
  }
  renderThumbs();
}

/**
 * @param {HTMLElement | null} zone
 * @param {(files: File[]) => void | Promise<void>} onFiles
 */
function bindDropzone(zone, onFiles) {
  if (!zone) return;
  zone.addEventListener("dragenter", (e) => {
    e.preventDefault();
    zone.classList.add("is-dragover");
  });
  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.classList.add("is-dragover");
  });
  zone.addEventListener("dragleave", (e) => {
    if (!zone.contains(/** @type {Node} */ (e.relatedTarget))) {
      zone.classList.remove("is-dragover");
    }
  });
  zone.addEventListener("drop", async (e) => {
    e.preventDefault();
    zone.classList.remove("is-dragover");
    const files = [...(e.dataTransfer?.files || [])];
    if (files.length) await onFiles(files);
  });
}

function updateWeatherVisibility() {
  if (!settings.showWeather) {
    els.weather.hidden = true;
    els.weather.classList.remove("weather--needs-location");
  }
}

async function maybeShowUpdate() {
  try {
    const result = await checkForUpdate();
    if (!result.available || !result.downloadUrl) return;
    const stored = await chrome.storage.local.get("dismissedUpdate");
    if (stored.dismissedUpdate === result.latest) return;

    els.updateBanner.dataset.latest = result.latest || "";
    els.updateBannerCopy.textContent = `v${result.current} → v${result.latest}. Download, replace files, then reload on chrome://extensions.`;
    els.updateDownload.href = result.downloadUrl;
    els.updateBanner.hidden = false;
  } catch {
    // Feed may be unset for local unpacked installs.
  }
}

async function loadWeather() {
  try {
    const weather = await fetchWeather();
    if (!weather || !settings.showWeather) return;

    if (weather.needsLocation) {
      showWeatherChip(weather, { needsLocation: true });
      return;
    }

    await chrome.storage.local.set({ lastWeather: weather });
    showWeatherChip(weather);
  } catch {
    const cached = await chrome.storage.local.get("lastWeather");
    if (cached.lastWeather && settings.showWeather) {
      showWeatherChip(cached.lastWeather, { cached: true });
      return;
    }
    els.weather.hidden = true;
    els.weather.classList.remove("weather--needs-location");
  }
}

/**
 * @param {{temp: number, label: string, iconHtml: string}} weather
 * @param {{needsLocation?: boolean, cached?: boolean}} [opts]
 */
function showWeatherChip(weather, opts = {}) {
  if (opts.needsLocation) {
    els.weatherTemp.textContent = "";
    els.weatherCond.textContent = weather.label;
    els.weatherIcon.innerHTML = weather.iconHtml;
    els.weather.classList.add("weather--needs-location");
    els.weather.title = "Click to allow location access for weather";
    els.weather.hidden = false;
    return;
  }

  els.weatherTemp.textContent = `${weather.temp}°`;
  els.weatherCond.textContent = opts.cached ? `${weather.label} · offline` : weather.label;
  els.weatherIcon.innerHTML = weather.iconHtml;
  els.weather.classList.remove("weather--needs-location");
  els.weather.title = opts.cached ? "Showing last known weather (offline)" : "Open forecast";
  els.weather.hidden = false;
}

async function openForecast() {
  els.forecast.hidden = false;
  els.forecastPlace.textContent = "Loading…";
  els.forecastNowTemp.textContent = "";
  els.forecastNowLabel.textContent = "";
  els.forecastNowIcon.innerHTML = "";
  els.forecastStats.innerHTML = "";
  els.forecastHourly.innerHTML = "";
  els.forecastDaily.innerHTML = "";

  try {
    const data = await fetchForecast();
    await chrome.storage.local.set({ lastForecast: data });
    renderForecast(data);
  } catch {
    const cached = await chrome.storage.local.get("lastForecast");
    if (cached.lastForecast) {
      renderForecast(cached.lastForecast, { cached: true });
      return;
    }
    els.forecastPlace.textContent = "Couldn't load forecast";
  }
}

function closeForecast() {
  els.forecast.hidden = true;
}

/**
 * @param {Awaited<ReturnType<typeof fetchForecast>>} data
 * @param {{cached?: boolean}} [opts]
 */
function renderForecast(data, opts = {}) {
  const { current, hourly, daily, place } = data;
  els.forecastPlace.textContent = opts.cached
    ? `${place || "Local weather"} · offline`
    : place || "Local weather";
  els.forecastNowIcon.innerHTML = current.iconHtml;
  els.forecastNowTemp.textContent = `${current.temp}°`;
  els.forecastNowLabel.textContent = current.label;

  els.forecastStats.innerHTML = `
    <div><dt>Feels</dt><dd>${current.feelsLike ?? "—"}°</dd></div>
    <div><dt>Humidity</dt><dd>${current.humidity ?? "—"}%</dd></div>
    <div><dt>Wind</dt><dd>${current.wind ?? "—"} km/h</dd></div>
  `;

  els.forecastHourly.innerHTML = hourly
    .map((hour) => {
      const label = new Intl.DateTimeFormat(undefined, { hour: "numeric" }).format(
        new Date(hour.time)
      );
      return `<div class="forecast-hour">
        <span class="forecast-hour__time">${label}</span>
        <span class="forecast-hour__icon">${hour.iconHtml}</span>
        <span class="forecast-hour__temp">${hour.temp}°</span>
        <span class="forecast-hour__precip">${hour.precip ?? 0}%</span>
      </div>`;
    })
    .join("");

  const dayFmt = new Intl.DateTimeFormat(undefined, { weekday: "short" });
  els.forecastDaily.innerHTML = daily
    .map((day, index) => {
      const name = index === 0 ? "Today" : dayFmt.format(new Date(`${day.date}T12:00:00`));
      return `<div class="forecast-day">
        <span class="forecast-day__name">${name}</span>
        <span class="forecast-day__icon">${day.iconHtml}</span>
        <span class="forecast-day__label">${day.label}</span>
        <span class="forecast-day__temps"><strong>${day.high}°</strong> / ${day.low}°</span>
      </div>`;
    })
    .join("");
}

function dayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

init();
