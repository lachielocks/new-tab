import { UNSPLASH_ACCESS_KEY } from "./unsplash-config.js";
import { pickUnsplash } from "./backgrounds.js";

const API = "https://api.unsplash.com";
const POOL_MIN = 3;
const POOL_BATCH = 30;
const POOL_MAX = 48;

/** @type {Record<string, string>} */
const CATEGORY_QUERIES = {
  nature: "nature landscape",
  mountains: "mountain alpine",
  ocean: "ocean sea coast",
  cities: "city skyline urban",
  architecture: "architecture building",
  minimal: "minimal simple clean",
  abstract: "abstract texture gradient",
  travel: "travel adventure wanderlust",
  forest: "forest woodland trees",
  night: "night sky stars city lights",
};

function dayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/**
 * @param {import('./types.js').Settings} settings
 */
function accessKey(settings) {
  return settings.unsplashAccessKey?.trim() || UNSPLASH_ACCESS_KEY;
}

/**
 * @param {number} max
 */
function randomIndex(max) {
  if (max <= 1) return 0;
  if (globalThis.crypto?.getRandomValues) {
    const bucket = new Uint32Array(1);
    crypto.getRandomValues(bucket);
    return bucket[0] % max;
  }
  return Math.floor(Math.random() * max);
}

/**
 * @param {Record<string, unknown>} raw
 * @param {string} category
 */
function rawToPhoto(raw, category) {
  const urls = /** @type {{ raw?: string, full?: string, regular?: string }} */ (raw.urls || {});
  const user = /** @type {{ name?: string, links?: { html?: string } }} */ (raw.user || {});
  const links = /** @type {{ download_location?: string }} */ (raw.links || {});
  const url = urls.raw
    ? `${urls.raw}&w=2400&fit=crop&q=80&auto=format`
    : urls.full || urls.regular || "";

  return {
    url,
    credit: `Photo by ${user.name || "Unsplash"} on Unsplash`,
    link: `${user.links?.html || "https://unsplash.com"}?utm_source=new_tab_extension&utm_medium=referral`,
    dayKey: dayKey(),
    category,
    downloadLocation: links.download_location || "",
  };
}

/**
 * @param {string} category
 * @returns {Promise<Record<string, unknown>[]>}
 */
async function fetchRandomBatch(category, key) {
  const query = CATEGORY_QUERIES[category] || CATEGORY_QUERIES.nature;
  const params = new URLSearchParams({
    query,
    count: String(POOL_BATCH),
    orientation: "landscape",
    content_filter: "high",
  });

  const res = await fetch(`${API}/photos/random?${params}`, {
    headers: { Authorization: `Client-ID ${key}` },
  });
  if (res.status === 401 || res.status === 403) {
    const err = new Error("Unsplash API unauthorized");
    err.code = "UNSPLASH_AUTH";
    throw err;
  }
  if (!res.ok) {
    throw new Error(`Unsplash API ${res.status}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [data];
}

/**
 * @param {string} downloadLocation
 * @param {string} key
 */
async function triggerDownload(downloadLocation, key) {
  if (!downloadLocation) return;
  try {
    await fetch(downloadLocation, {
      headers: { Authorization: `Client-ID ${key}` },
    });
  } catch {
    /* Unsplash view counts are best-effort */
  }
}

/**
 * @param {string} category
 */
async function loadPool(category) {
  const stored = await chrome.storage.local.get("unsplashPools");
  const pools = /** @type {Record<string, unknown[]>} */ (stored.unsplashPools || {});
  return pools[category] || [];
}

/**
 * @param {string} category
 * @param {unknown[]} pool
 */
async function savePool(category, pool) {
  const stored = await chrome.storage.local.get("unsplashPools");
  const pools = /** @type {Record<string, unknown[]>} */ (stored.unsplashPools || {});
  pools[category] = pool;
  await chrome.storage.local.set({ unsplashPools: pools });
}

/**
 * @param {string} category
 * @param {{forceNew?: boolean, previousUrl?: string|null, excludeUrls?: string[]}} opts
 * @param {string} key
 */
async function refillPool(category, opts, key) {
  const batch = await fetchRandomBatch(category, key);
  const exclude = new Set(
    [opts.previousUrl, ...(opts.excludeUrls || [])].filter(Boolean),
  );

  const incoming = batch
    .map((raw) => rawToPhoto(raw, category))
    .filter((photo) => photo.url && !exclude.has(photo.url));

  const existing = /** @type {ReturnType<typeof rawToPhoto>[]} */ (await loadPool(category));
  const seen = new Set();
  const merged = [];

  for (const photo of [...existing, ...incoming]) {
    if (!photo.url || seen.has(photo.url) || exclude.has(photo.url)) continue;
    seen.add(photo.url);
    merged.push(photo);
  }

  await savePool(category, merged.slice(0, POOL_MAX));
}

/**
 * @param {ReturnType<typeof rawToPhoto>} picked
 * @param {string} key
 */
async function finalizePhoto(picked, key) {
  await triggerDownload(picked.downloadLocation, key);
  return {
    url: picked.url,
    credit: picked.credit,
    link: picked.link,
    dayKey: picked.dayKey,
    category: picked.category,
  };
}

/**
 * @param {string} category
 * @param {{forceNew?: boolean, previousUrl?: string|null, excludeUrls?: string[]}} opts
 * @param {string} key
 */
async function takeFromPool(category, opts, key) {
  const exclude = new Set(
    [opts.previousUrl, ...(opts.excludeUrls || [])].filter(Boolean),
  );

  let pool = /** @type {ReturnType<typeof rawToPhoto>[]} */ (await loadPool(category));
  pool = pool.filter((photo) => photo.url && !exclude.has(photo.url));

  if (pool.length < POOL_MIN) {
    await refillPool(category, opts, key);
    pool = /** @type {ReturnType<typeof rawToPhoto>[]} */ (await loadPool(category));
    pool = pool.filter((photo) => photo.url && !exclude.has(photo.url));
  }

  if (!pool.length) return null;

  const index = randomIndex(pool.length);
  const picked = pool[index];
  pool.splice(index, 1);
  await savePool(category, pool);
  return finalizePhoto(picked, key);
}

/**
 * @param {string} category
 * @param {{forceNew?: boolean, previousUrl?: string|null, excludeUrls?: string[]}} [opts]
 * @param {import('./types.js').Settings} [settings]
 */
export async function resolveUnsplashPhoto(category, opts = {}, settings = {}) {
  const key = accessKey(settings);
  if (!key) {
    return pickUnsplash(category, opts);
  }

  try {
    const photo = await takeFromPool(category, opts, key);
    if (photo) return photo;
  } catch (err) {
    if (/** @type {{ code?: string }} */ (err).code === "UNSPLASH_AUTH") {
      console.warn("[New Tab] Unsplash access key rejected, using offline photos.");
    } else {
      console.warn("[New Tab] Unsplash API unavailable, using offline photos.", err);
    }
  }

  return pickUnsplash(category, opts);
}

/**
 * @param {import('./types.js').Settings} settings
 */
export function hasUnsplashApi(settings) {
  return Boolean(accessKey(settings));
}
