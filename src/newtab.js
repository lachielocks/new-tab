import { loadSettings, saveSettings } from "./storage.js";
import { fetchWeather, fetchForecast, requestLocationAccess } from "./weather.js";
import { pickUnsplash, pickCustom, RECENT_UNSPLASH_LIMIT } from "./backgrounds.js";
import { buildDestination, leadingIconHtml, placeholderFor, storeSearchIconHtml } from "./search.js";
import { applyFont, readFontFile } from "./fonts.js";
import { checkForUpdate } from "./updates.js";
import { enhanceSelects, syncSelectUi, closeAllMenus, hasOpenMenu, destroySelects } from "./dropdown.js";
import { STORE_BUILD } from "./flavor.js";
import {
  DEFAULT_LAYOUT,
  WALLPAPER_HISTORY_LIMIT,
  WIDGET_IDS,
  WIDGET_LABELS,
  cellAlign,
  findWidget,
  normalizeLayout,
  placeWidget,
  placedWidgets,
  removeWidget,
} from "./layout.js";
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
  weatherChipLoading: document.getElementById("weather-chip-loading"),
  weatherChipData: document.getElementById("weather-chip-data"),
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
  layoutGrid: document.getElementById("layout-grid"),
  widgetPool: document.getElementById("widget-pool"),
  settingsHome: document.getElementById("settings-home"),
  settingsLayoutPage: document.getElementById("settings-layout-page"),
  settingsMain: document.getElementById("settings-main"),
  settingsTabs: document.getElementById("settings-tabs"),
  settingsNavIndicator: document.getElementById("settings-nav-indicator"),
  settingsTitle: document.getElementById("settings-title"),
  layoutPalette: document.getElementById("layout-palette"),
  layoutEdit: document.getElementById("layout-edit"),
  layoutDone: document.getElementById("layout-done"),
  layoutReset: document.getElementById("layout-reset"),
  layoutBack: document.getElementById("layout-back"),
  wallpaperHistory: document.getElementById("wallpaper-history"),
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
  settingShowSearchHint: document.getElementById("setting-show-search-hint"),
  settingShowBackground: document.getElementById("setting-show-background"),
  settingClockStyle: document.getElementById("setting-clock-style"),
  setting24h: document.getElementById("setting-24h"),
  settingShowSeconds: document.getElementById("setting-show-seconds"),
  settingAlwaysShowQuickLinks: document.getElementById("setting-always-show-quick-links"),
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

/** @type {import('./types.js').WidgetId[][] | null} */
let draftLayout = null;
/** @type {HTMLElement[]} */
let layoutCells = [];
/** @type {Partial<Record<import('./types.js').WidgetId, HTMLElement>>} */
const widgetEls = {};
/** @type {ReturnType<typeof setTimeout> | null} */
let greetingSwapTimer = null;
const REVEAL_MS = 420;
const SEARCH_HINT_MAX_OPENS = 5;

function initLayoutSystem() {
  layoutCells = [];
  els.layoutGrid.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "layout-cell";
    cell.dataset.cell = String(i);
    const align = cellAlign(i);
    cell.dataset.alignX = align.horizontal;
    cell.dataset.alignY = align.vertical;
    els.layoutGrid.appendChild(cell);
    layoutCells.push(cell);
  }

  for (const id of WIDGET_IDS) {
    const el = document.querySelector(`[data-widget="${id}"]`);
    if (el instanceof HTMLElement) {
      widgetEls[id] = el;
      el.dataset.label = WIDGET_LABELS[id];
    }
  }
}

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
 * @param {import('./types.js').WidgetId} id
 * @param {import('./types.js').Settings} state
 */
function widgetEnabled(id, state) {
  switch (id) {
    case "credit":
    case "reroll":
      return Boolean(state.showBackground);
    default:
      return true;
  }
}

/**
 * @param {import('./types.js').WidgetId} id
 * @param {import('./types.js').Settings} state
 */
function widgetVisible(id, state) {
  const layout = normalizeLayout(draftLayout || state.layout);
  return placedWidgets(layout).has(id) && widgetEnabled(id, state);
}

/**
 * @param {import('./types.js').Settings} state
 * @param {{editing?: boolean}} [opts]
 */
function applyWidgetGrid(state, opts = {}) {
  const editing = Boolean(opts.editing);
  const layout = normalizeLayout(editing && draftLayout ? draftLayout : state.layout);

  for (const id of WIDGET_IDS) {
    const el = widgetEls[id];
    if (el) els.widgetPool.appendChild(el);
  }

  layout.forEach((stack, cellIndex) => {
    const cell = layoutCells[cellIndex];
    if (!cell) return;
    for (const id of stack) {
      const el = widgetEls[id];
      if (!el) continue;
      if (!editing && !widgetEnabled(id, state)) continue;
      cell.appendChild(el);
    }
  });

  if (editing) renderLayoutPalette(layout);
}

function setLayoutPageActive(active) {
  const page = els.settingsLayoutPage;
  const home = els.settingsHome;
  if (page) {
    page.setAttribute("aria-hidden", active ? "false" : "true");
    page.toggleAttribute("inert", !active);
  }
  if (home) {
    home.setAttribute("aria-hidden", active ? "true" : "false");
    home.toggleAttribute("inert", active);
  }

  const nextTitle = active ? "Edit layout" : "Settings";
  const title = els.settingsTitle;
  if (title && title.textContent !== nextTitle) {
    title.classList.add("is-swapping");
    window.setTimeout(() => {
      title.textContent = nextTitle;
      title.classList.remove("is-swapping");
    }, 160);
  } else if (title) {
    title.textContent = nextTitle;
  }

  document.body.classList.toggle("settings-layout-open", active);

  if (!active) {
    const aboutActive =
      document.querySelector(".settings-nav__btn.is-active")?.dataset.tab === "about";
    if (els.settingsFoot) els.settingsFoot.hidden = aboutActive;
    requestAnimationFrame(() => syncSettingsNavIndicator());
  }
}

function bindLayoutEditor() {
  els.layoutEdit?.addEventListener("click", () => {
    void enterLayoutEdit();
  });
  els.layoutDone?.addEventListener("click", () => {
    void exitLayoutEdit(true);
  });
  els.layoutBack?.addEventListener("click", () => {
    void exitLayoutEdit(false);
  });
  els.layoutReset?.addEventListener("click", () => {
    draftLayout = DEFAULT_LAYOUT.map((cell) => [...cell]);
    applyLayoutWithState(settings);
  });

  els.layoutPalette?.addEventListener("dragover", (e) => {
    if (!draftLayout) return;
    e.preventDefault();
    els.layoutPalette.classList.add("is-dragover");
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  });
  els.layoutPalette?.addEventListener("dragleave", () => {
    els.layoutPalette.classList.remove("is-dragover");
  });
  els.layoutPalette?.addEventListener("drop", (e) => {
    if (!draftLayout) return;
    e.preventDefault();
    els.layoutPalette.classList.remove("is-dragover");
    const id = e.dataTransfer?.getData("text/widget") || e.dataTransfer?.getData("text/plain");
    if (!id || !WIDGET_IDS.includes(/** @type {any} */ (id))) return;
    draftLayout = removeWidget(draftLayout, /** @type {any} */ (id));
    applyLayoutWithState(settings);
  });
}

async function enterLayoutEdit() {
  closeForecast();
  if (!document.body.classList.contains("settings-open")) {
    openSettings({ skipLayoutGuard: true });
  }
  draftLayout = normalizeLayout(settings.layout);
  document.body.classList.add("layout-editing");
  setLayoutPageActive(true);
  wireWidgetDragging(true);
  applyLayoutWithState(settings);
}

async function exitLayoutEdit(save) {
  if (save && draftLayout) {
    settings = await saveSettings({
      layout: draftLayout,
      ...showFlagsFromLayout(draftLayout),
    });
  }
  draftLayout = null;
  document.body.classList.remove("layout-editing");
  setLayoutPageActive(false);
  wireWidgetDragging(false);
  applyLayoutWithState(settings);
  updateWeatherVisibility();
}

/**
 * @param {import('./types.js').WidgetId[][]} layout
 */
function renderLayoutPalette(layout) {
  if (!els.layoutPalette) return;
  const used = placedWidgets(layout);
  els.layoutPalette.innerHTML = "";
  for (const id of WIDGET_IDS) {
    if (used.has(id)) continue;
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "layout-chip";
    chip.draggable = true;
    chip.dataset.widget = id;
    chip.textContent = WIDGET_LABELS[id];
    chip.addEventListener("dragstart", (e) => {
      e.dataTransfer?.setData("text/widget", id);
      e.dataTransfer?.setData("text/plain", id);
      if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
      chip.classList.add("is-dragging");
    });
    chip.addEventListener("dragend", () => chip.classList.remove("is-dragging"));
    els.layoutPalette.appendChild(chip);
  }
  if (!els.layoutPalette.childElementCount) {
    const empty = document.createElement("span");
    empty.className = "field__help";
    empty.textContent = "All widgets are on the page — drop one here to remove it.";
    els.layoutPalette.appendChild(empty);
  }
}

/**
 * @param {boolean} enabled
 */
function wireWidgetDragging(enabled) {
  for (const id of WIDGET_IDS) {
    const el = widgetEls[id];
    if (!el) continue;
    el.draggable = enabled;
    el.ondragstart = enabled
      ? (e) => {
          e.dataTransfer?.setData("text/widget", id);
          e.dataTransfer?.setData("text/plain", id);
          if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
          el.classList.add("is-dragging");
        }
      : null;
    el.ondragend = enabled
      ? () => el.classList.remove("is-dragging")
      : null;
  }

  layoutCells.forEach((cell, cellIndex) => {
    cell.ondragover = enabled
      ? (e) => {
          e.preventDefault();
          cell.classList.add("is-dragover");
          if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
        }
      : null;
    cell.ondragleave = enabled
      ? () => cell.classList.remove("is-dragover")
      : null;
    cell.ondrop = enabled
      ? (e) => {
          e.preventDefault();
          cell.classList.remove("is-dragover");
          const id = e.dataTransfer?.getData("text/widget") || e.dataTransfer?.getData("text/plain");
          if (!id || !WIDGET_IDS.includes(/** @type {any} */ (id))) return;
          if (!draftLayout) return;
          draftLayout = placeWidget(draftLayout, /** @type {any} */ (id), cellIndex);
          applyLayoutWithState(settings);
        }
      : null;
  });
}

function renderWallpaperHistory() {
  if (!els.wallpaperHistory) return;
  const history = settings.wallpaperHistory || [];
  const currentUrl =
    previewPhoto?.url ||
    (settings.bgSource === "custom" ? settings.lastCustom?.url : settings.lastUnsplash?.url) ||
    "";

  els.wallpaperHistory.innerHTML = "";
  if (!history.length) {
    const empty = document.createElement("p");
    empty.className = "field__help";
    empty.textContent = "Reroll or refresh to start building history.";
    els.wallpaperHistory.appendChild(empty);
    return;
  }

  history.forEach((photo) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "thumb";
    if (photo.url === currentUrl) btn.classList.add("is-active");
    btn.title = photo.credit || "Restore wallpaper";
    btn.style.backgroundImage = `url("${photo.url}")`;
    btn.addEventListener("click", async () => {
      previewPhoto = photo;
      const isDataUrl = photo.url.startsWith("data:");
      const inCustomLibrary = (settings.customImages || []).includes(photo.url);
      if (isDataUrl || inCustomLibrary || settings.bgSource === "custom") {
        settings = await saveSettings({
          lastCustom: photo,
          wallpaperHistory: pushWallpaperHistory(settings.wallpaperHistory, photo),
        });
      } else {
        settings = await saveSettings(unsplashRememberPatch(photo));
      }
      paintBackground(photo, { allowRetry: false, state: settings });
      renderWallpaperHistory();
    });
    els.wallpaperHistory.appendChild(btn);
  });
}

async function init() {
  settings = await loadSettings();
  searchMode = settings.searchMode || "web";
  els.aboutVersion.textContent = chrome.runtime.getManifest().version;
  const searchTab = document.querySelector('.settings-nav__btn[data-tab="search"]');
  if (searchTab) searchTab.textContent = STORE_BUILD ? "Search" : "Search & AI";
  applyFont(settings);
  initLayoutSystem();
  applyLayout();
  renderClock();
  renderGreeting();
  renderSearchChrome();
  renderQuickLinks();
  await applyBackground(false);
  updateWeatherVisibility();
  if (settings.setupComplete && widgetVisible("weather", settings)) loadWeather();
  if (settings.setupComplete) void trackSearchHintOpen();

  if (!settings.setupComplete) {
    els.onboarding.hidden = false;
    els.setupStepName.hidden = false;
    els.setupStepLocation.hidden = true;
    els.setupName.focus();
  } else {
    focusPrimary();
  }

  startClockTimer();
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
      let layout = normalizeLayout(settings.layout);
      if (!placedWidgets(layout).has("weather")) {
        layout = placeWidget(layout, "weather", 0);
      }
      await finishSetup({ layout, ...showFlagsFromLayout(layout) });
      loadWeather();
      return;
    }
    els.setupLocationStatus.textContent =
      "Location wasn’t allowed. You can enable it later from the weather chip.";
  });

  els.setupLocationSkip.addEventListener("click", async () => {
    let layout = normalizeLayout(settings.layout);
    layout = removeWidget(layout, "weather");
    await finishSetup({ layout, ...showFlagsFromLayout(layout) });
  });

  async function finishSetup(patch = {}) {
    settings = await saveSettings({ setupComplete: true, ...patch });
    els.onboarding.hidden = true;
    renderGreeting();
    applyLayout();
    updateWeatherVisibility();
    focusPrimary();
  }

  els.settingsOpen.addEventListener("click", (e) => {
    if (document.body.classList.contains("layout-editing")) {
      e.preventDefault();
      return;
    }
    openSettings();
  });
  els.settingsClose.addEventListener("click", closeSettings);

  els.settingsRevert.addEventListener("click", saveSettingsFromForm);

  els.settings.addEventListener("input", schedulePreview);
  els.settings.addEventListener("change", schedulePreview);
  bindSettingHighlights();
  bindLayoutEditor();

  els.settingsTabs?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tab]");
    if (!(btn instanceof HTMLElement)) return;
    const tab = btn.dataset.tab;
    if (!tab) return;
    switchSettingsTab(tab, btn);
  });

  els.settingsTabs?.addEventListener("scroll", () => {
    syncSettingsNavIndicator();
  });

  window.addEventListener("resize", () => {
    if (!document.body.classList.contains("settings-open")) return;
    syncSettingsNavIndicator();
  });

  els.settingBgSource.addEventListener("change", () => {
    previewPhoto = null;
    syncBgSourceUi();
  });
  els.settingFontGoogle.addEventListener("input", () => {
    if (!els.settingFontGoogle.value.trim()) return;
    selectFontPreset("custom-google");
  });
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

  els.wallpaperReroll?.addEventListener("click", (e) => {
    if (document.body.classList.contains("layout-editing")) {
      e.preventDefault();
      return;
    }
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
    if (document.body.classList.contains("layout-editing")) return;
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

  els.weather.addEventListener("click", async (e) => {
    if (document.body.classList.contains("layout-editing")) return;
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (target.closest("#forecast-close")) return;
    if (els.weather.classList.contains("is-expanded")) return;
    if (els.weather.classList.contains("weather--chip-loading")) return;
    if (els.weather.classList.contains("weather--needs-location")) {
      const granted = await requestLocationAccess();
      if (granted) {
        showWeatherChipLoading();
        weatherLoadPromise = null;
        void loadWeather();
      }
      return;
    }
    if (els.weather.classList.contains("weather--error")) {
      showWeatherChipLoading();
      weatherLoadPromise = null;
      void loadWeather();
      return;
    }
    void openForecast();
  });

  els.forecastClose.addEventListener("click", (e) => {
    e.stopPropagation();
    closeForecast();
  });

  els.weather.addEventListener("mouseenter", () => {
    if (weatherCloseTimer) {
      clearTimeout(weatherCloseTimer);
      weatherCloseTimer = null;
    }
  });

  els.weather.addEventListener("mouseleave", () => {
    if (!els.weather.classList.contains("is-expanded")) return;
    if (weatherCloseTimer) clearTimeout(weatherCloseTimer);
    weatherCloseTimer = window.setTimeout(() => {
      weatherCloseTimer = null;
      closeForecast();
    }, 220);
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
const SETTINGS_TAB_ANIM_MS = 420;

/** @type {readonly string[]} */
const SETTINGS_TAB_ORDER = [
  "general",
  "links",
  "background",
  "search",
  "fonts",
  "about",
];

/** @type {number | null} */
let settingsTabAnimTimer = null;

/**
 * @param {HTMLElement | null} [activeBtn]
 */
function syncSettingsNavIndicator(activeBtn) {
  const nav = els.settingsTabs;
  const indicator = els.settingsNavIndicator;
  if (!nav || !indicator) return;

  const btn =
    activeBtn instanceof HTMLElement
      ? activeBtn
      : nav.querySelector(".settings-nav__btn.is-active");
  if (!(btn instanceof HTMLElement)) {
    indicator.classList.remove("is-visible");
    return;
  }

  const left = btn.offsetLeft;
  indicator.style.width = `${btn.offsetWidth}px`;
  indicator.style.height = `${btn.offsetHeight}px`;
  indicator.style.transform = `translateX(${left}px)`;
  indicator.classList.add("is-visible");
}

/**
 * @param {string} tab
 * @param {HTMLElement} btn
 */
function switchSettingsTab(tab, btn) {
  const nextPanel = document.querySelector(`.tab-panel[data-panel="${tab}"]`);
  const currentPanel = document.querySelector(".tab-panel.is-active");
  const currentBtn = document.querySelector(".settings-nav__btn.is-active");
  if (!(nextPanel instanceof HTMLElement) || currentBtn === btn) return;

  if (settingsTabAnimTimer) {
    clearTimeout(settingsTabAnimTimer);
    settingsTabAnimTimer = null;
    document.querySelectorAll(".tab-panel.is-exiting").forEach((panel) => {
      panel.classList.remove("is-exiting", "is-active");
    });
  }

  const fromIdx = SETTINGS_TAB_ORDER.indexOf(currentPanel?.dataset.panel || "");
  const toIdx = SETTINGS_TAB_ORDER.indexOf(tab);
  const dir = toIdx >= fromIdx ? 1 : -1;
  const shift = `${dir * 16}px`;

  document.querySelectorAll(".settings-nav__btn").forEach((b) => {
    b.classList.toggle("is-active", b === btn);
  });
  syncSettingsNavIndicator(btn);

  nextPanel.classList.remove("is-exiting");

  if (currentPanel instanceof HTMLElement && currentPanel !== nextPanel) {
    currentPanel.style.setProperty("--settings-tab-shift", shift);
    nextPanel.style.setProperty("--settings-tab-shift", shift);
    nextPanel.classList.remove("is-active");
    void nextPanel.offsetWidth;
    nextPanel.classList.add("is-active");
    currentPanel.classList.remove("is-active");
    currentPanel.classList.add("is-exiting");
    settingsTabAnimTimer = window.setTimeout(() => {
      currentPanel.classList.remove("is-exiting");
      settingsTabAnimTimer = null;
    }, SETTINGS_TAB_ANIM_MS);
  } else {
    nextPanel.classList.add("is-active");
  }

    document.body.classList.toggle("settings-tab-links", tab === "links");
  els.settingsFoot.hidden = tab === "about" || document.body.classList.contains("settings-layout-open");
  btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
}

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
  if (document.body.classList.contains("layout-editing")) {
    void exitLayoutEdit(false);
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
  return {
    lastUnsplash: photo,
    recentUnsplashUrls,
    wallpaperHistory: pushWallpaperHistory(settings.wallpaperHistory, photo),
  };
}

/**
 * @param {import('./types.js').WallpaperPhoto[] | undefined} history
 * @param {import('./types.js').WallpaperPhoto} photo
 */
function pushWallpaperHistory(history, photo) {
  const prev = Array.isArray(history) ? history : [];
  const next = [photo, ...prev.filter((item) => item.url !== photo.url)];
  return next.slice(0, WALLPAPER_HISTORY_LIMIT);
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
    settings = await saveSettings({
      lastCustom: photo,
      wallpaperHistory: pushWallpaperHistory(settings.wallpaperHistory, photo),
    });
    paintBackground(photo);
    renderWallpaperHistory();
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
  renderWallpaperHistory();
}

function openSettings(opts = {}) {
  if (!opts.skipLayoutGuard && document.body.classList.contains("layout-editing")) return;
  closeForecast();
  sessionSettingsBackup = JSON.parse(JSON.stringify(settings));
  populateSettingsForm();
  previewPhoto = null;
  const activeTab = document.querySelector(".settings-nav__btn.is-active")?.dataset.tab || "general";
  document.body.classList.toggle("settings-tab-links", activeTab === "links");
  syncSettingsSidebarSide();
  els.settings.hidden = false;
  els.settings.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.add("settings-open");
      syncSettingsNavIndicator();
    });
  });
  applyPreviewFromForm();
  renderWallpaperHistory();
}

/**
 * Open settings beside the settings icon: left column → left panel, else right.
 * @param {import('./types.js').Settings} [state]
 */
function settingsSidebarSide(state = settings) {
  const layout = normalizeLayout(draftLayout || state.layout);
  const found = findWidget(layout, "settings");
  if (!found) return "right";
  return found.cell % 3 === 0 ? "left" : "right";
}

/**
 * @param {import('./types.js').Settings} [state]
 */
function syncSettingsSidebarSide(state = settings) {
  const left = settingsSidebarSide(state) === "left";
  document.body.classList.toggle("settings-side-left", left);
  document.body.classList.toggle("settings-side-right", !left);
}

function finishCloseSettings() {
  els.settings.hidden = true;
  els.settings.setAttribute("aria-hidden", "true");
}

function closeSettings() {
  if (draftLayout) {
    void exitLayoutEdit(false).then(() => closeSettings());
    return;
  }

  if (!document.body.classList.contains("settings-open")) {
    finishCloseSettings();
    return;
  }

  document.body.classList.remove(
    "settings-open",
    "settings-tab-links",
    "settings-layout-open",
  );
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
  els.settingShowSearchHint.checked = settings.showSearchHint;
  els.settingShowBackground.checked = settings.showBackground;
  els.settingClockStyle.value = settings.clockStyle || "digital";
  els.setting24h.checked = settings.use24h;
  els.settingShowSeconds.checked = settings.showSeconds;
  if (els.settingAlwaysShowQuickLinks) {
    els.settingAlwaysShowQuickLinks.checked = Boolean(settings.alwaysShowQuickLinks);
  }
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
  syncBackgroundOptions();
  renderThumbs();
  renderWallpaperHistory();
  renderQuickLinkRows();
  const activeTab = document.querySelector(".settings-nav__btn.is-active")?.dataset.tab;
  els.settingsFoot.hidden = activeTab === "about" || document.body.classList.contains("settings-layout-open");
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
    showSearchHint: els.settingShowSearchHint.checked,
    searchHintOpens:
      els.settingShowSearchHint.checked && !settings.showSearchHint
        ? 0
        : settings.searchHintOpens || 0,
    showBackground: els.settingShowBackground.checked,
    use24h: els.setting24h.checked,
    showSeconds: els.settingShowSeconds.checked,
    alwaysShowQuickLinks: Boolean(els.settingAlwaysShowQuickLinks?.checked),
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
  const editing = Boolean(draftLayout);
  applyWidgetGrid(state, { editing });
  setRevealed(els.clockWrap, widgetVisible("clock", state));
  setRevealed(els.greeting, widgetVisible("greeting", state));
  setRevealed(els.searchZone, widgetVisible("search", state));
  setRevealed(els.settingsOpen, widgetVisible("settings", state));
  setRevealed(els.wallpaperReroll, widgetVisible("reroll", state));
  if (editing) {
    setRevealed(els.weather, widgetVisible("weather", state));
    setRevealed(els.photoCredit, widgetVisible("credit", state));
  }

  document.body.classList.toggle(
    "page-minimal",
    !widgetVisible("clock", state) &&
      !widgetVisible("greeting", state) &&
      !widgetVisible("search", state) &&
      !widgetVisible("weather", state) &&
      !widgetVisible("settings", state)
  );
  renderQuickLinksWithState(state);
  if (!draftLayout) renderWallpaperHistory();
}

function focusPrimary() {
  if (!settings.setupComplete || !els.onboarding.hidden) return;
  if (widgetVisible("search", settings)) {
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
  const show = widgetVisible("quicklinks", state);
  const links = show ? state.quickLinks || [] : [];
  document.body.classList.toggle(
    "quick-links-always-visible",
    Boolean(state.alwaysShowQuickLinks) && show && links.some((link) => normalizeUrl(link.url)),
  );
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

function startClockTimer() {
  if (clockTimer) {
    window.clearTimeout(clockTimer);
    window.clearInterval(clockTimer);
    clockTimer = 0;
  }
  renderClock();
  const delay = Math.max(16, 1000 - (Date.now() % 1000));
  clockTimer = window.setTimeout(() => {
    renderClock();
    clockTimer = window.setInterval(renderClock, 1000);
  }, delay);
}

/**
 * @param {import('./types.js').Settings} state
 */
function renderClockWithState(state) {
  if (!widgetVisible("clock", state) && els.clockWrap.hidden) return;
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
    // Keep angle continuous across the minute so the hand never rewinds
    const secondAngle = (minutes * 60 + seconds) * 6;
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
  if (!widgetVisible("greeting", state) && els.greeting.hidden) return;
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

/**
 * @param {import('./types.js').Settings} state
 */
function searchHintVisible(state) {
  return Boolean(
    state.showSearchHint &&
      (state.searchHintOpens || 0) < SEARCH_HINT_MAX_OPENS &&
      widgetVisible("search", state),
  );
}

async function trackSearchHintOpen() {
  if (!settings.setupComplete || !settings.showSearchHint) return;
  const opens = Number(settings.searchHintOpens) || 0;
  if (opens >= SEARCH_HINT_MAX_OPENS) {
    settings = await saveSettings({ showSearchHint: false });
    renderSearchChrome();
    return;
  }
  settings = await saveSettings({ searchHintOpens: opens + 1 });
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
    const showHint = searchHintVisible(state);
    setRevealed(els.searchHint, showHint);
    if (showHint) {
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
  const showHint = searchHintVisible(state);
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
      settings = await saveSettings({
        lastCustom: photo,
        wallpaperHistory: pushWallpaperHistory(settings.wallpaperHistory, photo),
      });
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
    if (photo.credit && widgetVisible("credit", state)) {
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

/** @type {Promise<void> | null} */
let weatherLoadPromise = null;
/** @type {number | null} */
let weatherCollapsedWidth = null;

function updateWeatherVisibility() {
  updateWeatherVisibilityWithState(settings);
}

/**
 * @param {import('./types.js').Settings} state
 */
function updateWeatherVisibilityWithState(state) {
  const show = widgetVisible("weather", state);
  if (!show) {
    closeForecast();
    weatherLoadPromise = null;
    els.weather.classList.remove(
      "weather--needs-location",
      "weather--chip-loading",
      "weather--ready",
      "weather--error",
      "is-expanded",
      "is-loading",
      "is-ready",
    );
    els.weatherChip?.removeAttribute("aria-busy");
    setRevealed(els.weather, false);
    return;
  }

  setRevealed(els.weather, true);
  if (
    els.weather.classList.contains("weather--ready") ||
    els.weather.classList.contains("weather--needs-location")
  ) {
    return;
  }
  showWeatherChipLoading();
  void loadWeather();
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
  if (weatherLoadPromise) return weatherLoadPromise;

  weatherLoadPromise = (async () => {
    if (!widgetVisible("weather", settings)) return;
    if (
      !els.weather.classList.contains("weather--ready") &&
      !els.weather.classList.contains("weather--needs-location")
    ) {
      showWeatherChipLoading();
    }

    try {
      const weather = await fetchWeather();
      if (!weather || !widgetVisible("weather", settings)) return;

      if (weather.needsLocation) {
        showWeatherChip(weather, { needsLocation: true });
        return;
      }

      await chrome.storage.local.set({ lastWeather: weather });
      showWeatherChip(weather);
    } catch {
      if (!widgetVisible("weather", settings)) return;
      const cached = await chrome.storage.local.get("lastWeather");
      if (cached.lastWeather) {
        showWeatherChip(cached.lastWeather, { cached: true });
        return;
      }
      showWeatherChip(
        {
          temp: 0,
          label: "Unavailable",
          iconHtml: "",
          feelsLike: undefined,
          humidity: undefined,
          wind: undefined,
        },
        { error: true },
      );
    }
  })().finally(() => {
    weatherLoadPromise = null;
  });

  return weatherLoadPromise;
}

function showWeatherChipLoading() {
  if (els.weather.classList.contains("is-expanded")) return;

  els.weather.classList.add("weather--chip-loading", "is-settled");
  els.weather.classList.remove("weather--needs-location", "weather--ready", "weather--error");
  els.weatherChip.title = "Loading weather";
  els.weatherChip.setAttribute("aria-label", "Loading weather");
  els.weatherChip.setAttribute("aria-busy", "true");
  setRevealed(els.weather, true);
  requestAnimationFrame(() => settleWeatherChip());
}

/**
 * @param {{
 *   temp: number,
 *   label: string,
 *   iconHtml: string,
 *   feelsLike?: number,
 *   humidity?: number,
 *   wind?: number,
 * }} weather
 * @param {{needsLocation?: boolean, cached?: boolean, error?: boolean}} [opts]
 */
function showWeatherChip(weather, opts = {}) {
  if (!els.weather.classList.contains("is-expanded")) {
    els.weather.classList.add("is-settled");
  }

  const revealContent = () => {
    els.weather.classList.remove("weather--chip-loading");
    els.weatherChip.removeAttribute("aria-busy");
    if (!els.weather.classList.contains("is-expanded")) {
      requestAnimationFrame(() => animateSettleWeatherChip());
    }
  };

  if (opts.needsLocation) {
    els.weatherTemp.textContent = "";
    els.weatherCond.textContent = weather.label;
    els.weatherIcon.innerHTML = weather.iconHtml;
    els.weather.classList.add("weather--needs-location");
    els.weather.classList.remove("weather--ready", "weather--error");
    els.weatherChip.title = "Click to allow location access for weather";
    els.weatherChip.setAttribute("aria-label", "Enable location for weather");
    setRevealed(els.weather, true);
    revealContent();
    return;
  }

  if (opts.error) {
    els.weatherTemp.textContent = "";
    els.weatherCond.textContent = weather.label || "Unavailable";
    els.weatherIcon.innerHTML = weather.iconHtml || "";
    els.weather.classList.remove("weather--needs-location");
    els.weather.classList.add("weather--ready", "weather--error");
    els.weatherChip.title = "Weather unavailable — click to retry";
    els.weatherChip.setAttribute("aria-label", "Weather unavailable, click to retry");
    setRevealed(els.weather, true);
    revealContent();
    return;
  }

  els.weatherTemp.textContent = `${weather.temp}°`;
  els.weatherCond.textContent = opts.cached ? `${weather.label} · offline` : weather.label;
  els.weatherIcon.innerHTML = weather.iconHtml;
  els.weather.classList.remove("weather--needs-location", "weather--error");
  els.weather.classList.add("weather--ready");
  els.weatherChip.title = opts.cached ? "Showing last known weather (offline)" : "Open forecast";
  els.weatherChip.setAttribute("aria-label", "Open weather forecast");
  setRevealed(els.weather, true);
  revealContent();
}

function weatherExpandedWidthPx() {
  const raw = getComputedStyle(els.weather).getPropertyValue("--weather-expanded-width").trim();
  const probe = document.createElement("div");
  probe.style.cssText = `position:absolute;visibility:hidden;width:${raw}`;
  document.body.appendChild(probe);
  const width = probe.getBoundingClientRect().width;
  probe.remove();
  return Math.round(width) || Math.min(352, window.innerWidth - 40);
}

function lockWeatherShellWidth(px) {
  els.weatherShell.style.width = `${Math.round(px)}px`;
}

function clearWeatherShellWidth() {
  els.weatherShell.style.width = "";
}

function measureWeatherChipWidth() {
  const chip = els.weatherChip;
  if (!chip) return 1;
  const visible = els.weather.classList.contains("weather--chip-loading")
    ? els.weatherChipLoading
    : els.weatherChipData;
  const measured = visible
    ? Math.round(visible.scrollWidth + 24)
    : Math.round(chip.scrollWidth);
  return Math.max(1, measured || Math.round(chip.getBoundingClientRect().width) || Math.round(chip.scrollWidth));
}

function settleWeatherChip() {
  if (els.weather.classList.contains("is-expanded")) return;
  els.weather.classList.add("is-settled");
  const prevTransition = els.weatherShell.style.transition;
  els.weatherShell.style.transition = "none";
  clearWeatherShellWidth();
  const width = measureWeatherChipWidth();
  weatherCollapsedWidth = width;
  lockWeatherShellWidth(width);
  void els.weatherShell.offsetWidth;
  els.weatherShell.style.transition = prevTransition;
}

function animateSettleWeatherChip() {
  if (els.weather.classList.contains("is-expanded")) return;
  els.weather.classList.add("is-settled");
  const from =
    Math.round(els.weatherShell.getBoundingClientRect().width) ||
    weatherCollapsedWidth ||
    measureWeatherChipWidth();
  lockWeatherShellWidth(from);
  void els.weatherShell.offsetWidth;

  const prevTransition = els.weatherShell.style.transition;
  els.weatherShell.style.transition = "none";
  clearWeatherShellWidth();
  const to = measureWeatherChipWidth();
  lockWeatherShellWidth(from);
  void els.weatherShell.offsetWidth;
  els.weatherShell.style.transition = prevTransition || "";
  weatherCollapsedWidth = to;
  lockWeatherShellWidth(to);
}

function weatherCollapsedWidthPx() {
  clearWeatherShellWidth();
  return measureWeatherChipWidth();
}

async function openForecast() {
  if (!widgetVisible("weather", settings)) return;
  if (document.body.classList.contains("layout-editing")) return;
  if (els.weather.classList.contains("weather--needs-location")) return;
  if (els.weather.classList.contains("is-expanded")) return;

  if (weatherCloseTimer) {
    clearTimeout(weatherCloseTimer);
    weatherCloseTimer = null;
  }

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
  if (els.forecastStats) els.forecastStats.innerHTML = "";
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
  els.forecastClose.hidden = true;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      els.weather.classList.remove("is-expanded");
      lockWeatherShellWidth(targetW);
    });
  });

  window.setTimeout(() => {
    if (els.weather.classList.contains("is-expanded")) return;
    els.weatherContent.hidden = true;
    els.forecastNowIcon.innerHTML = "";
    els.forecastNowTemp.textContent = "";
    els.forecastNowLabel.textContent = "";
    if (els.forecastStats) els.forecastStats.innerHTML = "";
    els.forecastHourly.innerHTML = "";
    els.forecastDaily.innerHTML = "";
    settleWeatherChip();
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

  if (els.forecastStats) {
    els.forecastStats.innerHTML = `
    <div><dt>Feels</dt><dd>${current.feelsLike ?? "—"}°</dd></div>
    <div><dt>Humidity</dt><dd>${current.humidity ?? "—"}%</dd></div>
    <div><dt>Wind</dt><dd>${current.wind ?? "—"} km/h</dd></div>
  `;
  }

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
