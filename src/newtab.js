import { loadSettings, saveSettings } from "./storage.js";
import { fetchWeather, fetchForecast, requestLocationAccess } from "./weather.js";
import { pickUnsplash, pickCustom, RECENT_UNSPLASH_LIMIT } from "./backgrounds.js";
import { buildDestination, leadingIconHtml, placeholderFor, storeSearchIconHtml } from "./search.js";
import { applyFont, readFontFile } from "./fonts.js";
import { checkForUpdate } from "./updates.js";
import { enhanceSelects, syncSelectUi, closeAllMenus, hasOpenMenu, destroySelects } from "./dropdown.js";
import { STORE_BUILD } from "./flavor.js";

document.body.classList.toggle("flavor-store", STORE_BUILD);
document.body.classList.toggle("flavor-full", !STORE_BUILD);

/** @type {import('./types.js').Settings} */
let settings;

const els = {
  clockWrap: document.getElementById("clock-wrap"),
  clock: document.getElementById("clock"),
  clockHm: document.getElementById("clock-hm"),
  clockSec: document.getElementById("clock-sec"),
  clockSecDigits: document.getElementById("clock-sec-digits"),
  clockPeriod: document.getElementById("clock-period"),
  clockAnalog: document.getElementById("clock-analog"),
  analogHour: document.getElementById("analog-hour"),
  analogMinute: document.getElementById("analog-minute"),
  analogSecond: document.getElementById("analog-second"),
  greeting: document.getElementById("greeting"),
  weather: document.getElementById("weather"),
  weatherShell: document.getElementById("weather-shell"),
  weatherChip: document.getElementById("weather-chip"),
  weatherTemp: document.getElementById("weather-temp"),
  weatherCond: document.getElementById("weather-cond"),
  weatherIcon: document.getElementById("weather-icon"),
  weatherBody: document.getElementById("weather-body"),
  weatherLoading: document.getElementById("weather-loading"),
  weatherContent: document.getElementById("weather-content"),
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
  wallpaperReroll: document.getElementById("wallpaper-reroll"),
  topbar: document.getElementById("topbar"),
  searchZone: document.getElementById("search-zone"),
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
  preview: document.getElementById("preview"),
  settings: document.getElementById("settings"),
  settingsOpen: document.getElementById("settings-open"),
  settingsClose: document.getElementById("settings-close"),
  settingsRevert: document.getElementById("settings-revert"),
  settingsFoot: document.getElementById("settings-foot"),
  aboutVersion: document.getElementById("about-version"),
  settingName: document.getElementById("setting-name"),
  settingShowClock: document.getElementById("setting-show-clock"),
  settingShowGreeting: document.getElementById("setting-show-greeting"),
  settingShowSearch: document.getElementById("setting-show-search"),
  settingShowSearchHint: document.getElementById("setting-show-search-hint"),
  settingShowQuickLinks: document.getElementById("setting-show-quick-links"),
  settingShowPhotoCredit: document.getElementById("setting-show-photo-credit"),
  settingShowReroll: document.getElementById("setting-show-reroll"),
  settingShowSettingsButton: document.getElementById("setting-show-settings-button"),
  settingShowBackground: document.getElementById("setting-show-background"),
  settingWeather: document.getElementById("setting-weather"),
  settingClockStyle: document.getElementById("setting-clock-style"),
  setting24h: document.getElementById("setting-24h"),
  settingShowSeconds: document.getElementById("setting-show-seconds"),
  clock24hHelp: document.getElementById("clock-24h-help"),
  quickLinksEditor: document.getElementById("quick-links-editor"),
  quickLinksList: document.getElementById("quick-links-list"),
  quickLinkAdd: document.getElementById("quick-link-add"),
  backgroundOptions: document.getElementById("background-options"),
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
  updateBanner: document.getElementById("update-banner"),
  updateBannerCopy: document.getElementById("update-banner-copy"),
  updateDownload: document.getElementById("update-download"),
  updateDismiss: document.getElementById("update-dismiss"),
};

let searchMode = "web";
/** @type {string[]} */
let draftCustomImages = [];
/** @type {{title: string, url: string, icon?: string, display?: 'name'|'icon'|'both'}[]} */
let draftQuickLinks = [];
let draftFontDataUrl = "";
let draftFontFormat = "";
let clockTimer = 0;
/** @type {ReturnType<typeof setTimeout> | null} */
let previewTimer = null;
/** @type {{ url: string, credit?: string, link?: string } | null} */
let previewPhoto = null;
let sessionSettingsBackup = null;
/** @type {ReturnType<typeof setTimeout> | null} */
let weatherCloseTimer = null;
/** @type {WeakMap<HTMLElement, ReturnType<typeof setTimeout>>} */
const revealTimers = new WeakMap();
/** @type {ReturnType<typeof setTimeout> | null} */
let greetingSwapTimer = null;
const REVEAL_MS = 420;

async function init() {
  settings = await loadSettings();
  searchMode = settings.searchMode || "web";
  els.aboutVersion.textContent = chrome.runtime.getManifest().version;
  const searchTab = document.querySelector('.settings-nav__btn[data-tab="search"]');
  if (searchTab) searchTab.textContent = STORE_BUILD ? "Search" : "Search & AI";
  applyFont(settings);
  applyLayout();
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
    focusPrimary();
  }

  clockTimer = window.setInterval(renderClock, 1000);
  bindEvents();
  enhanceSelects();
  maybeShowUpdate();

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "OPEN_SETTINGS") openSettings();
  });

  if (new URLSearchParams(location.search).get("settings") === "1") {
    openSettings();
    history.replaceState(null, "", location.pathname);
  }

  requestAnimationFrame(() => {
    document.body.classList.add("ui-ready");
  });
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
    applyLayout();
    updateWeatherVisibility();
    focusPrimary();
  }

  els.settingsOpen.addEventListener("click", openSettings);
  els.settingsClose.addEventListener("click", closeSettings);

  els.settingsRevert.addEventListener("click", saveSettingsFromForm);

  els.settings.addEventListener("input", schedulePreview);
  els.settings.addEventListener("change", schedulePreview);
  bindSettingHighlights();

  document.getElementById("settings-tabs").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tab]");
    if (!btn) return;
    const tab = btn.dataset.tab;
    document.querySelectorAll(".settings-nav__btn").forEach((b) => {
      b.classList.toggle("is-active", b === btn);
    });
    document.querySelectorAll(".tab-panel").forEach((p) => {
      p.classList.toggle("is-active", p.dataset.panel === tab);
    });
    document.body.classList.toggle("settings-tab-links", tab === "links");
    els.settingsFoot.hidden = tab === "about";
    btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  });

  els.settingBgSource.addEventListener("change", () => {
    previewPhoto = null;
    syncBgSourceUi();
  });
  els.settingFontGoogle.addEventListener("input", () => {
    if (!els.settingFontGoogle.value.trim()) return;
    selectFontPreset("custom-google");
  });
  els.settingShowQuickLinks.addEventListener("change", syncQuickLinksEditor);
  els.settingShowBackground.addEventListener("change", syncBackgroundOptions);
  els.settingBgCategory.addEventListener("change", () => {
    previewPhoto = null;
  });

  els.settingBgUpload.addEventListener("change", async () => {
    await addImageFiles([...(els.settingBgUpload.files || [])]);
    els.settingBgUpload.value = "";
  });

  bindDropzone(els.bgDropzone, async (files) => {
    await addImageFiles(files);
  });

  els.refreshBg.addEventListener("click", async () => {
    const draft = readFormDraft();
    const photo =
      els.settingBgSource.value === "custom"
        ? pickCustom(draftCustomImages, {
            forceNew: true,
            previousUrl: previewPhoto?.url || settings.lastCustom?.url,
          })
        : pickUnsplash(
            els.settingBgCategory.value,
            bgPickOpts(true, previewPhoto?.url || settings.lastUnsplash?.url),
          );
    if (!photo) return;
    previewPhoto = photo;
    paintBackground(photo, { allowRetry: false, state: readFormDraft() });
  });

  els.wallpaperReroll?.addEventListener("click", () => {
    void rerollWallpaper();
  });

  els.quickLinkAdd.addEventListener("click", () => {
    if (draftQuickLinks.length >= 8) return;
    draftQuickLinks.push({ title: "", url: "", icon: "", display: "name" });
    renderQuickLinkRows();
    schedulePreview();
  });

  els.settingClockStyle.addEventListener("change", syncClockFields);

  els.quickLinksZone.addEventListener("mouseleave", () => {
    const active = document.activeElement;
    if (active && els.quickLinks.contains(active)) {
      /** @type {HTMLElement} */ (active).blur();
    }
  });

  els.settingFontFile.addEventListener("change", async () => {
    const file = els.settingFontFile.files?.[0];
    if (!file) return;
    await applyUploadedFont(file);
  });

  bindDropzone(els.settingFontFile?.closest(".dropzone"), async (files) => {
    const file = files.find((f) => /\.(woff2?|ttf|otf)$/i.test(f.name) || f.type.includes("font"));
    if (!file) return;
    await applyUploadedFont(file);
  });

  els.searchInput.addEventListener("keydown", (e) => {
    if (STORE_BUILD) return;
    if (e.key === "Tab" && !e.shiftKey && !e.altKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      setSearchMode(searchMode === "web" ? "ai" : "web");
    }
  });

  els.searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = els.searchInput.value.trim();
    if (!query) return;
    if (STORE_BUILD) {
      await chrome.search.query({ text: query, disposition: "CURRENT_TAB" });
      return;
    }
    const dest = buildDestination(searchMode, settings.searchEngine, settings.aiProvider, query);
    if (!dest) return;
    window.location.href = dest;
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    e.preventDefault();
    dismissTopLayer();
  });

  els.weatherChip.addEventListener("click", async () => {
    if (els.weather.classList.contains("weather--needs-location")) {
      const granted = await requestLocationAccess();
      if (granted) loadWeather();
      return;
    }
    if (els.weather.classList.contains("is-expanded")) return;
    openForecast();
  });

  els.forecastClose.addEventListener("click", (e) => {
    e.stopPropagation();
    closeForecast();
  });

  document.addEventListener("pointerdown", (e) => {
    if (!els.weather.classList.contains("is-expanded")) return;
    const target = /** @type {Node} */ (e.target);
    if (els.weather.contains(target)) return;
    closeForecast();
  });

  els.updateDismiss.addEventListener("click", async () => {
    const latest = els.updateBanner.dataset.latest || "";
    await chrome.storage.local.set({ dismissedUpdate: latest });
    els.updateBanner.hidden = true;
  });
}

const SETTINGS_ANIM_MS = 520;
const WEATHER_ANIM_MS = 520;

/**
 * Close the topmost open UI layer: menus → weather → settings.
 */
function dismissTopLayer() {
  if (hasOpenMenu()) {
    closeAllMenus();
    return;
  }
  if (els.weather.classList.contains("is-expanded")) {
    closeForecast();
    return;
  }
  if (document.body.classList.contains("settings-open")) {
    closeSettings();
  }
}

/**
 * @param {boolean} forceNew
 * @param {string|null|undefined} previousUrl
 */
function bgPickOpts(forceNew, previousUrl) {
  return {
    forceNew,
    previousUrl,
    excludeUrls: settings.recentUnsplashUrls || [],
  };
}

/**
 * @param {{url: string, credit: string, link: string, dayKey: string, category: string}} photo
 */
function unsplashRememberPatch(photo) {
  const recent = [photo.url, ...(settings.recentUnsplashUrls || [])];
  const recentUnsplashUrls = [...new Set(recent)].slice(0, RECENT_UNSPLASH_LIMIT);
  return { lastUnsplash: photo, recentUnsplashUrls };
}

async function rerollWallpaper() {
  if (!settings.showBackground) return;

  const btn = els.wallpaperReroll;
  if (btn) {
    btn.classList.remove("is-spinning");
    // Force restart so rapid clicks still animate
    void btn.offsetWidth;
    btn.classList.add("is-spinning");
    window.setTimeout(() => btn.classList.remove("is-spinning"), 560);
  }

  if (settings.bgSource === "custom") {
    const photo = pickCustom(settings.customImages, {
      forceNew: true,
      previousUrl: previewPhoto?.url || settings.lastCustom?.url,
    });
    if (!photo) return;
    previewPhoto = photo;
    settings = await saveSettings({ lastCustom: photo });
    paintBackground(photo);
    return;
  }

  const photo = pickUnsplash(
    settings.bgCategory,
    bgPickOpts(true, previewPhoto?.url || settings.lastUnsplash?.url),
  );
  if (!photo) return;
  previewPhoto = photo;
  settings = await saveSettings(unsplashRememberPatch(photo));
  paintBackground(photo);
}

function openSettings() {
  closeForecast();
  sessionSettingsBackup = JSON.parse(JSON.stringify(settings));
  populateSettingsForm();
  previewPhoto = null;
  const activeTab = document.querySelector(".settings-nav__btn.is-active")?.dataset.tab || "general";
  document.body.classList.toggle("settings-tab-links", activeTab === "links");
  els.settings.hidden = false;
  els.settings.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.add("settings-open");
    });
  });
  applyPreviewFromForm();
}

function finishCloseSettings() {
  els.settings.hidden = true;
  els.settings.setAttribute("aria-hidden", "true");
}

function closeSettings() {
  if (!document.body.classList.contains("settings-open")) {
    finishCloseSettings();
    return;
  }

  document.body.classList.remove("settings-open", "settings-tab-links");
  previewPhoto = null;
  clearSettingHighlight();
  closeAllMenus();

  let finished = false;
  const done = () => {
    if (finished || document.body.classList.contains("settings-open")) return;
    finished = true;
    finishCloseSettings();
  };

  els.preview.addEventListener(
    "transitionend",
    (event) => {
      if (event.target !== els.preview || event.propertyName !== "border-radius") return;
      done();
    },
    { once: true },
  );
  window.setTimeout(done, SETTINGS_ANIM_MS + 40);
}

function populateSettingsForm() {
  els.settingName.value = settings.name || "";
  els.settingShowClock.checked = settings.showClock;
  els.settingShowGreeting.checked = settings.showGreeting;
  els.settingShowSearch.checked = settings.showSearch;
  els.settingShowSearchHint.checked = settings.showSearchHint;
  els.settingShowQuickLinks.checked = settings.showQuickLinks;
  els.settingShowPhotoCredit.checked = settings.showPhotoCredit;
  els.settingShowReroll.checked = settings.showReroll !== false;
  els.settingShowSettingsButton.checked = settings.showSettingsButton;
  els.settingShowBackground.checked = settings.showBackground;
  els.settingWeather.checked = settings.showWeather;
  els.settingClockStyle.value = settings.clockStyle || "digital";
  els.setting24h.checked = settings.use24h;
  els.settingShowSeconds.checked = settings.showSeconds;
  els.settingBgNewOnOpen.checked = settings.newPhotoOnOpen;
  els.settingBgSource.value = settings.bgSource;
  els.settingBgCategory.value = settings.bgCategory;
  els.settingSearchEngine.value = settings.searchEngine;
  els.settingAiProvider.value = settings.aiProvider;
  els.settingFontPreset.value = settings.fontPreset;
  els.settingFontGoogle.value = settings.googleFontName || "";
  draftCustomImages = [...(settings.customImages || [])];
  draftQuickLinks = (settings.quickLinks || []).map((link) => ({
    title: link.title || "",
    url: link.url || "",
    icon: link.icon || "",
    display: link.display || (link.icon ? "both" : "name"),
  }));
  draftFontDataUrl = settings.customFontDataUrl || "";
  draftFontFormat = settings.customFontFormat || "";
  syncSelectUi(els.settingClockStyle);
  syncSelectUi(els.settingBgSource);
  syncSelectUi(els.settingBgCategory);
  syncSelectUi(els.settingSearchEngine);
  syncSelectUi(els.settingAiProvider);
  syncSelectUi(els.settingFontPreset);
  syncBgSourceUi();
  syncClockFields();
  syncQuickLinksEditor();
  syncBackgroundOptions();
  renderThumbs();
  renderQuickLinkRows();
  const activeTab = document.querySelector(".settings-nav__btn.is-active")?.dataset.tab;
  els.settingsFoot.hidden = activeTab === "about";
}

function revertPreview() {
  applyFont(settings);
  applyLayout();
  renderGreeting();
  renderClock();
  renderSearchChrome();
  updateWeatherVisibility();
  applyBackground(false);
  focusPrimary();
}

function schedulePreview() {
  if (els.settings.hidden) return;
  if (previewTimer) clearTimeout(previewTimer);
  previewTimer = setTimeout(async () => {
    previewTimer = null;
    const draft = readFormDraft();
    settings = await saveSettings(draft);
    applyPreviewFromForm();
  }, 60);
}

/**
 * @returns {import('./types.js').Settings}
 */
function readFormDraft() {
  return {
    ...settings,
    name: els.settingName.value.trim() || settings.name,
    showClock: els.settingShowClock.checked,
    showGreeting: els.settingShowGreeting.checked,
    showSearch: els.settingShowSearch.checked,
    showSearchHint: els.settingShowSearchHint.checked,
    showQuickLinks: els.settingShowQuickLinks.checked,
    showPhotoCredit: els.settingShowPhotoCredit.checked,
    showReroll: els.settingShowReroll.checked,
    showSettingsButton: els.settingShowSettingsButton.checked,
    showBackground: els.settingShowBackground.checked,
    showWeather: els.settingWeather.checked,
    use24h: els.setting24h.checked,
    showSeconds: els.settingShowSeconds.checked,
    clockStyle: /** @type {'digital'|'analog'} */ (els.settingClockStyle.value),
    quickLinks: normalizeQuickLinks(draftQuickLinks),
    newPhotoOnOpen: els.settingBgNewOnOpen.checked,
    bgSource: /** @type {'unsplash'|'custom'} */ (els.settingBgSource.value),
    bgCategory: els.settingBgCategory.value,
    customImages: draftCustomImages,
    searchEngine: els.settingSearchEngine.value,
    aiProvider: els.settingAiProvider.value,
    fontPreset: els.settingFontPreset.value,
    googleFontName: els.settingFontGoogle.value.trim(),
    customFontDataUrl: draftFontDataUrl,
    customFontFormat: draftFontFormat,
  };
}

function applyPreviewFromForm() {
  const draft = readFormDraft();
  applyLayoutWithState(draft);
  applyFont(draft);
  renderGreetingWithState(draft);
  renderClockWithState(draft);
  renderSearchChromeWithState(draft);
  void previewBackground(draft);
  updateWeatherVisibilityWithState(draft);
}

function previewBackground(draft) {
  if (!draft.showBackground) {
    showBackgroundFallback();
    setRevealed(els.photoCredit, false);
    return;
  }

  if (previewPhoto) {
    paintBackground(previewPhoto, { allowRetry: false, state: draft });
    return;
  }

  if (draft.bgSource === "custom") {
    const photo = pickCustom(draft.customImages, {
      previousUrl: settings.lastCustom?.url,
    });
    if (!photo) {
      showBackgroundFallback();
      setRevealed(els.photoCredit, false);
      return;
    }
    paintBackground(photo, { allowRetry: false, state: draft });
    return;
  }

  const cached = settings.lastUnsplash;
  const photo =
    cached && cached.category === draft.bgCategory
      ? cached
      : pickUnsplash(
          draft.bgCategory,
          bgPickOpts(cached?.category !== draft.bgCategory, cached?.url),
        );
  paintBackground(photo, { allowRetry: false, state: draft });
}

async function saveSettingsFromForm() {
  if (sessionSettingsBackup) {
    previewPhoto = null;
    settings = await saveSettings(sessionSettingsBackup);
    populateSettingsForm();
    applyPreviewFromForm();
    await applyBackground(true);
    updateWeatherVisibility();
    // Don't close so they can see the revert, or close? The prompt: "a revert button for each session". We'll keep it open.
  }
}

function applyLayout() {
  applyLayoutWithState(settings);
}

/**
 * Smoothly show or hide a UI element with fade/slide.
 * @param {HTMLElement | null} el
 * @param {boolean} show
 */
function setRevealed(el, show) {
  if (!el) return;
  const pending = revealTimers.get(el);
  if (pending) window.clearTimeout(pending);

  if (show) {
    if (!el.hidden && el.classList.contains("is-shown")) return;
    el.hidden = false;
    el.classList.remove("is-hiding");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add("is-shown");
      });
    });
    return;
  }

  if (el.hidden && !el.classList.contains("is-shown")) return;
  el.classList.remove("is-shown");
  el.classList.add("is-hiding");
  const timer = window.setTimeout(() => {
    if (!el.classList.contains("is-shown")) {
      el.hidden = true;
      el.classList.remove("is-hiding");
    }
  }, REVEAL_MS);
  revealTimers.set(el, timer);
}

/** @type {{ el: HTMLElement, hidden: boolean } | null} */
let settingHighlight = null;
/** @type {HTMLElement | null} */
let settingHighlightField = null;

function bindSettingHighlights() {
  els.settings.addEventListener("pointerover", (e) => {
    const field = /** @type {HTMLElement | null} */ (
      e.target instanceof Element ? e.target.closest("[data-highlight]") : null
    );
    if (!field || field === settingHighlightField) return;
    settingHighlightField = field;
    setSettingHighlight(field.dataset.highlight || "");
  });

  els.settings.addEventListener("pointerout", (e) => {
    const field = /** @type {HTMLElement | null} */ (
      e.target instanceof Element ? e.target.closest("[data-highlight]") : null
    );
    if (!field || field !== settingHighlightField) return;
    const next = e.relatedTarget;
    if (next instanceof Node && field.contains(next)) return;
    settingHighlightField = null;
    clearSettingHighlight();
  });

  els.settings.addEventListener("focusin", (e) => {
    const field = /** @type {HTMLElement | null} */ (
      e.target instanceof Element ? e.target.closest("[data-highlight]") : null
    );
    if (!field) return;
    settingHighlightField = field;
    setSettingHighlight(field.dataset.highlight || "");
  });

  els.settings.addEventListener("focusout", (e) => {
    const field = /** @type {HTMLElement | null} */ (
      e.target instanceof Element ? e.target.closest("[data-highlight]") : null
    );
    if (!field) return;
    const next = e.relatedTarget;
    if (next instanceof Node && field.contains(next)) return;
    requestAnimationFrame(() => {
      const active = document.activeElement;
      const activeField =
        active instanceof Element ? active.closest("[data-highlight]") : null;
      if (activeField && els.settings.contains(activeField)) {
        settingHighlightField = /** @type {HTMLElement} */ (activeField);
        setSettingHighlight(activeField.getAttribute("data-highlight") || "");
        return;
      }
      settingHighlightField = null;
      clearSettingHighlight();
    });
  });
}

/**
 * @param {string} selector
 */
function setSettingHighlight(selector) {
  clearSettingHighlight();
  if (!selector) return;
  const el = document.querySelector(selector);
  if (!(el instanceof HTMLElement)) return;

  settingHighlight = { el, hidden: el.hidden };
  if (el.hidden) el.hidden = false;
  el.classList.add("is-setting-highlight");
  if (!el.classList.contains("is-shown")) {
    el.classList.add("is-setting-highlight-ghost");
  }
}

function clearSettingHighlight() {
  if (!settingHighlight) return;
  const { el, hidden } = settingHighlight;
  el.classList.remove("is-setting-highlight", "is-setting-highlight-ghost");
  if (hidden && !el.classList.contains("is-shown")) {
    el.hidden = true;
  }
  settingHighlight = null;
}

/**
 * @param {import('./types.js').Settings} state
 */
function applyLayoutWithState(state) {
  setRevealed(els.clockWrap, state.showClock);
  setRevealed(els.greeting, state.showGreeting);
  setRevealed(els.searchZone, state.showSearch);
  setRevealed(els.settingsOpen, state.showSettingsButton);
  setRevealed(els.wallpaperReroll, Boolean(state.showReroll && state.showBackground));

  const showTopbar = state.showWeather || state.showSettingsButton;
  els.topbar.hidden = !showTopbar;

  document.body.classList.toggle(
    "page-minimal",
    !state.showClock &&
      !state.showGreeting &&
      !state.showSearch &&
      !(state.showWeather || state.showSettingsButton)
  );
  renderQuickLinksWithState(state);
}

function focusPrimary() {
  if (!settings.setupComplete || !els.onboarding.hidden) return;
  if (settings.showSearch) {
    els.searchInput.focus();
  }
}

function syncBackgroundOptions() {
  els.backgroundOptions.hidden = !els.settingShowBackground.checked;
}

function syncBgSourceUi() {
  const custom = els.settingBgSource.value === "custom";
  els.unsplashOptions.hidden = custom;
  els.customOptions.hidden = !custom;
}

/**
 * @param {'custom-google'|'custom-file'|string} value
 */
function selectFontPreset(value) {
  if (els.settingFontPreset.value === value) return;
  els.settingFontPreset.value = value;
  syncSelectUi(els.settingFontPreset);
}

/**
 * @param {File} file
 */
async function applyUploadedFont(file) {
  const { dataUrl, format } = await readFontFile(file);
  draftFontDataUrl = dataUrl;
  draftFontFormat = format;
  const zone = els.settingFontFile.closest(".dropzone");
  const title = zone?.querySelector(".dropzone__title");
  if (title) title.textContent = file.name;
  selectFontPreset("custom-file");
  schedulePreview();
}

function syncClockFields() {
  const analog = els.settingClockStyle.value === "analog";
  els.setting24h.closest(".field")?.classList.toggle("is-disabled", analog);
  els.setting24h.disabled = analog;
  if (els.clock24hHelp) {
    els.clock24hHelp.hidden = !analog;
    els.clock24hHelp.textContent = analog
      ? "24-hour format applies to the digital clock."
      : "Applies to the digital clock.";
  }
}

function syncQuickLinksEditor() {
  els.quickLinksEditor.hidden = !els.settingShowQuickLinks.checked;
}

function renderQuickLinkRows() {
  destroySelects(els.quickLinksList);
  els.quickLinksList.innerHTML = "";
  draftQuickLinks.forEach((link, index) => {
    const display = link.display || (link.icon ? "both" : "name");
    const row = document.createElement("div");
    row.className = "link-row";
    row.innerHTML = `
      <div class="link-row__fields">
        <input class="field__input link-row__title" type="text" placeholder="Label" maxlength="32" value="${escapeAttr(link.title)}" />
        <input class="field__input link-row__url" type="text" placeholder="https://" autocomplete="off" spellcheck="false" value="${escapeAttr(link.url)}" />
        <button type="button" class="link-row__remove" aria-label="Remove link">×</button>
      </div>
      <div class="link-row__meta">
        <div class="link-row__icon">
          <span class="link-row__icon-label">Favicon</span>
          <div class="link-row__icon-controls">
            <span class="link-row__icon-preview">${
              link.icon
                ? `<img src="${escapeAttr(link.icon)}" alt="" />`
                : `<span aria-hidden="true">◇</span>`
            }</span>
            <label class="link-row__icon-btn">
              ${link.icon ? "Replace" : "Upload"}
              <input class="link-row__icon-input" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,.ico" />
            </label>
            ${
              link.icon
                ? `<button type="button" class="link-row__icon-btn link-row__icon-btn--clear" aria-label="Remove favicon">×</button>`
                : ""
            }
          </div>
        </div>
        <label class="field">
          <span class="field__label">Show</span>
          <select class="field__input field__input--select link-row__display">
            <option value="name"${display === "name" ? " selected" : ""}>Name only</option>
            <option value="icon"${display === "icon" ? " selected" : ""}>Favicon only</option>
            <option value="both"${display === "both" ? " selected" : ""}>Name + favicon</option>
          </select>
        </label>
      </div>`;

    row.querySelector(".link-row__title").addEventListener("input", (e) => {
      draftQuickLinks[index].title = /** @type {HTMLInputElement} */ (e.target).value;
      schedulePreview();
    });
    row.querySelector(".link-row__url").addEventListener("input", (e) => {
      draftQuickLinks[index].url = /** @type {HTMLInputElement} */ (e.target).value;
      schedulePreview();
    });
    row.querySelector(".link-row__remove").addEventListener("click", () => {
      draftQuickLinks.splice(index, 1);
      renderQuickLinkRows();
      schedulePreview();
    });
    row.querySelector(".link-row__display").addEventListener("change", (e) => {
      draftQuickLinks[index].display = /** @type {'name'|'icon'|'both'} */ (
        /** @type {HTMLSelectElement} */ (e.target).value
      );
      schedulePreview();
    });
    row.querySelector(".link-row__icon-input").addEventListener("change", async (e) => {
      const file = /** @type {HTMLInputElement} */ (e.target).files?.[0];
      if (!file) return;
      try {
        draftQuickLinks[index].icon = await readIconFile(file);
        if (!draftQuickLinks[index].display || draftQuickLinks[index].display === "name") {
          draftQuickLinks[index].display = "both";
        }
        renderQuickLinkRows();
        schedulePreview();
      } catch {
        // ignore bad uploads
      }
    });
    row.querySelector(".link-row__icon-btn--clear")?.addEventListener("click", () => {
      draftQuickLinks[index].icon = "";
      if (draftQuickLinks[index].display === "icon") {
        draftQuickLinks[index].display = "name";
      }
      renderQuickLinkRows();
      schedulePreview();
    });

    els.quickLinksList.appendChild(row);
    enhanceSelects(row);
  });
  els.quickLinkAdd.disabled = draftQuickLinks.length >= 8;
}

function renderQuickLinks() {
  renderQuickLinksWithState(settings);
}

/**
 * @param {import('./types.js').Settings} state
 */
function renderQuickLinksWithState(state) {
  const links = state.showQuickLinks && state.showSearch ? state.quickLinks || [] : [];
  if (!links.length) {
    setRevealed(els.quickLinksZone, false);
    els.quickLinks.innerHTML = "";
    return;
  }

  els.quickLinks.innerHTML = links
    .map((link) => {
      const url = normalizeUrl(link.url);
      if (!url) return "";
      const label = link.title?.trim() || linkDomain(url) || "Link";
      const display = resolveLinkDisplay(link);
      const icon =
        link.icon && display !== "name"
          ? `<img class="quick-links__icon" src="${escapeAttr(link.icon)}" alt="" />`
          : "";
      const text =
        display !== "icon" ? `<span class="quick-links__label">${escapeHtml(label)}</span>` : "";
      const iconOnly = display === "icon" ? " quick-links__item--icon-only" : "";
      return `<a class="quick-links__item${iconOnly}" href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer" title="${escapeAttr(label)}">${icon}${text}</a>`;
    })
    .join("");
  setRevealed(els.quickLinksZone, true);
}

/**
 * @param {{title: string, url: string, icon?: string, display?: 'name'|'icon'|'both'}} link
 * @returns {'name'|'icon'|'both'}
 */
function resolveLinkDisplay(link) {
  const requested = link.display || (link.icon ? "both" : "name");
  if ((requested === "icon" || requested === "both") && !link.icon) return "name";
  return requested;
}

/**
 * @param {{title: string, url: string, icon?: string, display?: 'name'|'icon'|'both'}[]} links
 */
function normalizeQuickLinks(links) {
  return links
    .map((link) => {
      const icon = typeof link.icon === "string" && link.icon.startsWith("data:") ? link.icon : "";
      const display = resolveLinkDisplay({ ...link, icon });
      return {
        title: link.title.trim(),
        url: normalizeUrl(link.url),
        icon,
        display,
      };
    })
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
      previewPhoto = null;
      schedulePreview();
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

function renderClock() {
  renderClockWithState(settings);
}

/**
 * @param {import('./types.js').Settings} state
 */
function renderClockWithState(state) {
  if (!state.showClock && els.clockWrap.hidden) return;
  const now = new Date();
  const analog = state.clockStyle === "analog";

  els.clockWrap.classList.toggle("has-seconds", Boolean(state.showSeconds));
  els.clock.classList.toggle("is-active", !analog);
  els.clockAnalog.classList.toggle("is-active", analog);
  els.clockAnalog.setAttribute("aria-hidden", analog ? "false" : "true");
  els.clockSec?.setAttribute("aria-hidden", state.showSeconds ? "false" : "true");

  if (analog) {
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const hourAngle = hours * 30 + minutes * 0.5;
    const minuteAngle = minutes * 6 + seconds * 0.1;
    const secondAngle = seconds * 6;
    els.analogHour.style.transform = `rotate(${hourAngle}deg)`;
    els.analogMinute.style.transform = `rotate(${minuteAngle}deg)`;
    els.analogSecond.style.transform = `rotate(${secondAngle}deg)`;
    els.clock.dateTime = now.toISOString();
    return;
  }

  const parts = formatDigitalParts(now, {
    use24h: state.use24h,
    showSeconds: state.showSeconds,
  });
  els.clockHm.textContent = parts.hm;
  els.clockSecDigits.textContent = parts.sec;
  els.clockPeriod.textContent = parts.period;
  els.clock.dateTime = now.toISOString();
}

/**
 * @param {Date} now
 * @param {{use24h: boolean, showSeconds: boolean}} opts
 */
function formatDigitalParts(now, opts) {
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const sec = String(now.getSeconds()).padStart(2, "0");
  let period = "";
  if (!opts.use24h) {
    period = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
  }
  return {
    hm: `${hours}:${minutes}`,
    sec,
    period,
  };
}

function renderGreeting() {
  renderGreetingWithState(settings);
}

/**
 * @param {import('./types.js').Settings} state
 */
function renderGreetingWithState(state) {
  if (!state.showGreeting && els.greeting.hidden) return;
  const hour = new Date().getHours();
  let part = "evening";
  if (hour < 12) part = "morning";
  else if (hour < 18) part = "afternoon";
  const name = state.name?.trim();
  const next = name ? `Good ${part}, ${name}` : `Good ${part}`;
  setGreetingText(next);
}

/**
 * @param {string} next
 */
function setGreetingText(next) {
  if (els.greeting.textContent === next) return;
  if (!document.body.classList.contains("ui-ready") || !els.greeting.classList.contains("is-shown")) {
    els.greeting.textContent = next;
    return;
  }
  if (greetingSwapTimer) window.clearTimeout(greetingSwapTimer);
  els.greeting.classList.add("is-swapping");
  greetingSwapTimer = window.setTimeout(() => {
    els.greeting.textContent = next;
    requestAnimationFrame(() => {
      els.greeting.classList.remove("is-swapping");
    });
  }, 180);
}

function renderSearchChrome() {
  renderSearchChromeWithState(settings);
}

/**
 * @param {import('./types.js').Settings} state
 */
function renderSearchChromeWithState(state) {
  if (STORE_BUILD) {
    els.searchLeading.innerHTML = storeSearchIconHtml();
    els.searchInput.placeholder = "Search";
    setRevealed(els.searchHint, Boolean(state.showSearch && state.showSearchHint));
    if (state.showSearch && state.showSearchHint) {
      els.searchHint.textContent = "Press Enter to search";
    }
    return;
  }

  els.searchLeading.innerHTML = leadingIconHtml(
    searchMode,
    state.searchEngine,
    state.aiProvider
  );
  els.searchInput.placeholder = placeholderFor(
    searchMode,
    state.searchEngine,
    state.aiProvider
  );
  const showHint = Boolean(state.showSearch && state.showSearchHint);
  setRevealed(els.searchHint, showHint);
  if (!showHint) return;
  const aiName =
    state.aiProvider === "acosta"
      ? "Acosta"
      : state.aiProvider.charAt(0).toUpperCase() + state.aiProvider.slice(1);
  els.searchHint.textContent =
    searchMode === "ai"
      ? `Press Enter to ask ${aiName} · Tab for web search`
      : "Press Enter to search · Tab to ask AI";
}

async function applyBackground(fromSettings) {
  if (!settings.showBackground) {
    showBackgroundFallback();
    setRevealed(els.photoCredit, false);
    return;
  }

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
      : pickUnsplash(
          settings.bgCategory,
          bgPickOpts(forceNew || fromSettings, cached?.url),
        );

  if (!sameDay || fromSettings || forceNew) {
    settings = await saveSettings(unsplashRememberPatch(photo));
  }
  paintBackground(photo);
}

function paintBackground(photo, { allowRetry = true, state = settings, tried = new Set() } = {}) {
  if (!photo?.url) {
    showBackgroundFallback();
    return;
  }
  if (tried.has(photo.url)) {
    showBackgroundFallback();
    return;
  }
  tried.add(photo.url);

  const img = new Image();
  img.onload = () => {
    els.bgImage.classList.remove("is-fallback");
    els.bgImage.style.backgroundImage = `url("${photo.url}")`;
    if (photo.credit && state.showPhotoCredit) {
      els.photoCreditLink.textContent = photo.credit;
      els.photoCreditLink.href = photo.link || "#";
      setRevealed(els.photoCredit, true);
    } else {
      setRevealed(els.photoCredit, false);
    }
  };
  img.onerror = () => {
    if (
      allowRetry &&
      state.bgSource === "unsplash" &&
      tried.size < 8
    ) {
      const next = pickUnsplash(state.bgCategory, {
        forceNew: true,
        previousUrl: photo.url,
        excludeUrls: [...tried, ...(state.recentUnsplashUrls || [])],
      });
      if (next?.url && !tried.has(next.url)) {
        paintBackground(next, { allowRetry: true, state, tried });
        return;
      }
    }
    if (
      allowRetry &&
      settings.lastUnsplash?.url &&
      !tried.has(settings.lastUnsplash.url)
    ) {
      paintBackground(settings.lastUnsplash, { allowRetry: false, state, tried });
      return;
    }
    showBackgroundFallback();
  };
  img.src = photo.url;
}

function showBackgroundFallback() {
  els.bgImage.classList.add("is-fallback");
  els.bgImage.style.backgroundImage = "";
  setRevealed(els.photoCredit, false);
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
  schedulePreview();
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
  updateWeatherVisibilityWithState(settings);
}

/**
 * @param {import('./types.js').Settings} state
 */
function updateWeatherVisibilityWithState(state) {
  if (!state.showWeather) {
    closeForecast();
    els.weather.classList.remove("weather--needs-location", "is-expanded", "is-loading", "is-ready");
    setRevealed(els.weather, false);
    return;
  }

  const visible =
    els.weather.classList.contains("is-shown") && !els.weather.classList.contains("is-hiding");
  if (!visible) loadWeather();
}

async function maybeShowUpdate() {
  if (STORE_BUILD) return;
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
    els.weather.classList.remove("weather--needs-location");
    setRevealed(els.weather, false);
  }
}

/**
 * @param {{temp: number, label: string, iconHtml: string}} weather
 * @param {{needsLocation?: boolean, cached?: boolean}} [opts]
 */
function showWeatherChip(weather, opts = {}) {
  if (!els.weather.classList.contains("is-expanded")) {
    els.weather.classList.add("is-settled");
  }

  if (opts.needsLocation) {
    els.weatherTemp.textContent = "";
    els.weatherCond.textContent = weather.label;
    els.weatherIcon.innerHTML = weather.iconHtml;
    els.weather.classList.add("weather--needs-location");
    els.weatherChip.title = "Click to allow location access for weather";
    els.weatherChip.setAttribute("aria-label", "Enable location for weather");
    setRevealed(els.weather, true);
    requestAnimationFrame(() => settleWeatherChip());
    return;
  }

  els.weatherTemp.textContent = `${weather.temp}°`;
  els.weatherCond.textContent = opts.cached ? `${weather.label} · offline` : weather.label;
  els.weatherIcon.innerHTML = weather.iconHtml;
  els.weather.classList.remove("weather--needs-location");
  els.weatherChip.title = opts.cached ? "Showing last known weather (offline)" : "Open forecast";
  els.weatherChip.setAttribute("aria-label", "Open weather forecast");
  setRevealed(els.weather, true);
  requestAnimationFrame(() => settleWeatherChip());
}

/** @type {number | null} */
let weatherCollapsedWidth = null;

function weatherExpandedWidthPx() {
  const raw = getComputedStyle(els.weather).getPropertyValue("--weather-width").trim();
  const probe = document.createElement("div");
  probe.style.cssText = `position:absolute;visibility:hidden;width:${raw}`;
  document.body.appendChild(probe);
  const width = probe.getBoundingClientRect().width;
  probe.remove();
  return Math.round(width) || Math.min(304, window.innerWidth - 40);
}

function lockWeatherShellWidth(px) {
  els.weatherShell.style.width = `${Math.round(px)}px`;
}

function clearWeatherShellWidth() {
  els.weatherShell.style.width = "";
}

function measureWeatherChipWidth() {
  return Math.max(
    1,
    Math.round(els.weatherChip.scrollWidth) ||
      Math.round(els.weatherChip.getBoundingClientRect().width),
  );
}

/** Lock shell to chip content width and hide body from layout. */
function settleWeatherChip() {
  if (els.weather.classList.contains("is-expanded")) return;
  els.weather.classList.add("is-settled");
  const prevTransition = els.weatherShell.style.transition;
  els.weatherShell.style.transition = "none";
  clearWeatherShellWidth();
  const width = measureWeatherChipWidth();
  weatherCollapsedWidth = width;
  lockWeatherShellWidth(width);
  // Force reflow so the next frame can animate expand/collapse again
  void els.weatherShell.offsetWidth;
  els.weatherShell.style.transition = prevTransition;
}

function weatherCollapsedWidthPx() {
  clearWeatherShellWidth();
  return measureWeatherChipWidth();
}

async function openForecast() {
  if (weatherCloseTimer) {
    clearTimeout(weatherCloseTimer);
    weatherCloseTimer = null;
  }

  // Body must participate in layout for the expand morph
  els.weather.classList.remove("is-settled");
  weatherCollapsedWidth = weatherCollapsedWidthPx();
  lockWeatherShellWidth(weatherCollapsedWidth);

  els.weather.classList.remove("is-ready");
  els.weather.classList.add("is-loading");
  els.weatherContent.hidden = true;
  els.forecastClose.hidden = false;
  els.forecastClose.tabIndex = 0;
  els.weatherBody.setAttribute("aria-hidden", "false");
  els.weatherChip.setAttribute("aria-expanded", "true");
  els.forecastPlace.textContent = "Local weather";
  els.forecastNowTemp.textContent = "";
  els.forecastNowLabel.textContent = "";
  els.forecastNowIcon.innerHTML = "";
  els.forecastStats.innerHTML = "";
  els.forecastHourly.innerHTML = "";
  els.forecastDaily.innerHTML = "";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      els.weather.classList.add("is-expanded");
      lockWeatherShellWidth(weatherExpandedWidthPx());
    });
  });

  try {
    const data = await fetchForecast();
    await chrome.storage.local.set({ lastForecast: data });
    renderForecast(data);
    revealForecastContent();
  } catch {
    const cached = await chrome.storage.local.get("lastForecast");
    if (cached.lastForecast) {
      renderForecast(cached.lastForecast, { cached: true });
      revealForecastContent();
      return;
    }
    els.forecastPlace.textContent = "Couldn't load forecast";
    els.forecastNowLabel.textContent = "Try again in a moment";
    els.weatherContent.hidden = false;
    revealForecastContent();
  }
}

function revealForecastContent() {
  els.weatherContent.hidden = false;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      els.weather.classList.remove("is-loading");
      els.weather.classList.add("is-ready");
    });
  });
}

function closeForecast() {
  if (!els.weather.classList.contains("is-expanded")) return;

  const currentW = Math.round(els.weatherShell.getBoundingClientRect().width);
  lockWeatherShellWidth(currentW);

  const targetW = weatherCollapsedWidth || measureWeatherChipWidth();

  els.weather.classList.remove("is-ready", "is-loading", "is-settled");
  els.weatherChip.setAttribute("aria-expanded", "false");
  els.weatherBody.setAttribute("aria-hidden", "true");
  els.forecastClose.tabIndex = -1;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      els.weather.classList.remove("is-expanded");
      lockWeatherShellWidth(targetW);
    });
  });

  if (weatherCloseTimer) clearTimeout(weatherCloseTimer);
  weatherCloseTimer = window.setTimeout(() => {
    weatherCloseTimer = null;
    if (!els.weather.classList.contains("is-expanded")) {
      els.weatherContent.hidden = true;
      els.forecastClose.hidden = true;
      els.forecastNowIcon.innerHTML = "";
      els.forecastNowTemp.textContent = "";
      els.forecastNowLabel.textContent = "";
      els.forecastStats.innerHTML = "";
      els.forecastHourly.innerHTML = "";
      els.forecastDaily.innerHTML = "";
      // Keep the narrow width from the close animation — clearing it
      // let forecast content inflate max-content again.
      settleWeatherChip();
    }
  }, WEATHER_ANIM_MS);
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

/**
 * Resize and store a small favicon data URL.
 * @param {File} file
 * @returns {Promise<string>}
 */
async function readIconFile(file) {
  const dataUrl = await readAsDataUrl(file);
  if (file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")) {
    if (dataUrl.length > 40_000) throw new Error("Icon too large");
    return dataUrl;
  }

  const img = await loadImage(dataUrl);
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  const scale = Math.min(size / img.width, size / img.height);
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const x = Math.round((size - w) / 2);
  const y = Math.round((size - h) / 2);
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(img, x, y, w, h);
  return canvas.toDataURL("image/png");
}

/**
 * @param {string} src
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read image"));
    img.src = src;
  });
}

init();
