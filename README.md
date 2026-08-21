# New Tab — Chrome extension + website

Calm new tab for Chrome (Manifest V3) with a Vercel site for downloads, install docs, and updates.

## Structure

- Extension root: `manifest.json`, `src/`, `icons/`
- Website: `web/` (Next.js) — set as the Vercel **Root Directory**

## Local extension

1. Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → this repo folder (the one with `manifest.json`)

## Local website

```bash
cd web
npm install
npm run dev
```

`predev` / `prebuild` packs `new-tab.zip` and writes `public/version.json`. Download at [http://localhost:3000/download](http://localhost:3000/download).

## Deploy (GitHub + Vercel)

1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Set **Root Directory** to `web`.
4. Optional: set `NEXT_PUBLIC_SITE_URL` to your production URL (e.g. `https://new-tab.vercel.app`) so packed zips point at the right update feed.
5. Deploy.

Each deploy refreshes `/downloads/new-tab.zip` and `/version.json`. Packaged builds inject that feed into `src/update-config.json` so the extension can show an update banner.

## Bumping a version

Edit `"version"` in `manifest.json`, push/deploy, then reload the unpacked extension after replacing files from the new zip.
