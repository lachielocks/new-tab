/**
 * Compare dotted versions. Returns 1 if a>b, -1 if a<b, 0 if equal.
 * @param {string} a
 * @param {string} b
 */
export function compareVersions(a, b) {
  const pa = String(a).split(".").map((n) => parseInt(n, 10) || 0);
  const pb = String(b).split(".").map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

/**
 * @returns {Promise<{feedUrl: string, downloadUrl: string, siteUrl: string}>}
 */
async function loadConfig() {
  try {
    const res = await fetch(chrome.runtime.getURL("src/update-config.json"));
    return await res.json();
  } catch {
    return { feedUrl: "", downloadUrl: "", siteUrl: "" };
  }
}

/**
 * @typedef {{version: string, downloadUrl?: string, notesUrl?: string, changelog?: string}} RemoteVersion
 * @typedef {{available: boolean, current: string, latest?: string, downloadUrl?: string, notesUrl?: string, changelog?: string}} UpdateCheck
 */

/**
 * @returns {Promise<UpdateCheck>}
 */
export async function checkForUpdate() {
  const current = chrome.runtime.getManifest().version;
  const config = await loadConfig();
  if (!config.feedUrl) {
    return { available: false, current };
  }

  const res = await fetch(config.feedUrl, { cache: "no-store" });
  if (!res.ok) throw new Error("Update feed unavailable");
  /** @type {RemoteVersion} */
  const remote = await res.json();
  const available = compareVersions(remote.version, current) > 0;

  return {
    available,
    current,
    latest: remote.version,
    downloadUrl: remote.downloadUrl || config.downloadUrl,
    notesUrl: remote.notesUrl || config.siteUrl,
    changelog: remote.changelog,
  };
}
