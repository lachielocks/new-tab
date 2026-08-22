import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { zipSync } from "fflate";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");
const extRoot = join(webRoot, "..");
const outDir = join(webRoot, "public", "downloads");
const versionOut = join(webRoot, "public", "version.json");

const INCLUDE = ["manifest.json", "src", "icons"];

function walk(dir, base = dir) {
  /** @type {Record<string, Uint8Array>} */
  const files = {};
  for (const name of readdirSync(dir)) {
    if (name === ".DS_Store") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) Object.assign(files, walk(full, base));
    else files[relative(base, full).split("\\").join("/")] = new Uint8Array(readFileSync(full));
  }
  return files;
}

function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

function originPattern(url) {
  const u = new URL(url);
  return `${u.protocol}//${u.host}/*`;
}

mkdirSync(outDir, { recursive: true });

/** @type {Record<string, Uint8Array>} */
const bundle = {};
for (const entry of INCLUDE) {
  const full = join(extRoot, entry);
  const st = statSync(full);
  if (st.isDirectory()) Object.assign(bundle, walk(full, extRoot));
  else bundle[entry] = new Uint8Array(readFileSync(full));
}

const site = siteUrl();
const origin = originPattern(site);

const updateConfig = {
  feedUrl: `${site}/version.json`,
  downloadUrl: `${site}/downloads/new-tab.zip`,
  siteUrl: site,
};
bundle["src/update-config.json"] = new TextEncoder().encode(
  `${JSON.stringify(updateConfig, null, 2)}\n`
);

const unsplashKey = process.env.UNSPLASH_ACCESS_KEY?.trim();
if (unsplashKey) {
  const configPath = "src/unsplash-config.js";
  bundle[configPath] = new TextEncoder().encode(
    `/** Injected at pack time from UNSPLASH_ACCESS_KEY. */\nexport const UNSPLASH_ACCESS_KEY = ${JSON.stringify(unsplashKey)};\n`,
  );
}

const manifest = JSON.parse(readFileSync(join(extRoot, "manifest.json"), "utf8"));
manifest.host_permissions = [...new Set([...(manifest.host_permissions || []), origin])];
const csp = manifest.content_security_policy?.extension_pages || "";
if (csp && !csp.includes(new URL(site).origin)) {
  manifest.content_security_policy = {
    extension_pages: csp.replace(
      "connect-src 'self'",
      `connect-src 'self' ${new URL(site).origin}`
    ),
  };
}
bundle["manifest.json"] = new TextEncoder().encode(`${JSON.stringify(manifest, null, 2)}\n`);

const zipped = zipSync(bundle, { level: 6 });
writeFileSync(join(outDir, "new-tab.zip"), zipped);

const payload = {
  name: manifest.name,
  version: manifest.version,
  releasedAt: new Date().toISOString(),
  downloadUrl: `${site}/downloads/new-tab.zip`,
  notesUrl: `${site}/#install`,
  changelog: "Latest build from the New Tab repository.",
};

writeFileSync(versionOut, JSON.stringify(payload, null, 2));
console.log(`Packed extension v${manifest.version} → ${site}`);
console.log(`Feed → ${versionOut}`);
