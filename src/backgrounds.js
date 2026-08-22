/**
 * Curated Unsplash photos by category (verified CDN IDs — no API key).
 * Each entry: [photoId, photographer, profileSlug]
 */
const PHOTOS = {
  nature: [
    ["1470071459604-3b5ec3a7fe05", "Luca Bravo", "lucabravo"],
    ["1469474968028-56623f02e42e", "David Marcu", "davidmarcu"],
    ["1426604966848-d7adac402bff", "Ken Cheung", "kencheungphoto"],
    ["1472214103451-9374bd1c798e", "Robert Lukeman", "robertlukeman"],
    ["1470770841072-f978cf4d019e", "Luca Bravo", "lucabravo"],
    ["1569459785779-5bd4ea198ded", "Luca Bravo", "lucabravo"],
    ["1569365788898-f96aa58c27eb", "David Marcu", "davidmarcu"],
    ["1569524872948-0ba4d096f997", "Luca Bravo", "lucabravo"],
    ["1501854140801-50d01698950b", "Johannes Plenio", "jplenio"],
    ["1528184039930-bd03972bd974", "Johannes Plenio", "jplenio"],
    ["1570156514207-424441cb02a8", "Luca Bravo", "lucabravo"],
    ["1570207606693-e5539f3d0f8c", "Luca Bravo", "lucabravo"],
  ],
  mountains: [
    ["1464822759023-fed622ff2c3b", "Kalen Emsley", "kalenemsley"],
    ["1506905925346-21bda4d32df4", "Pietro De Grandi", "peter_mc_greats"],
    ["1493246507139-91e8fad9978e", "Pine Watt", "pinewatt"],
    ["1519681393784-d120267933ba", "Benjamin Voros", "vorosbenisop"],
    ["1469854523086-cc02fe5d8800", "Jake Blucker", "jakeblucker"],
    ["1501785888041-af3ef285b470", "Pietro De Grandi", "peter_mc_greats"],
    ["1622744678361-64f90c825820", "Luca Bravo", "lucabravo"],
    ["1565446145753-f118778ef6c6", "Luca Bravo", "lucabravo"],
    ["1503424886307-b090341d25d1", "Luca Bravo", "lucabravo"],
  ],
  ocean: [
    ["1505142468610-359e7d316be0", "Christoffer Engström", "christofferengstrom"],
    ["1507525428034-b723cf961d3e", "Sean Oulashin", "oulashin"],
    ["1505118380757-91f5f5632de0", "Silas Baisch", "silasbaisch"],
    ["1559827260-dc66d52bef19", "Sean Oulashin", "oulashin"],
    ["1567788150222-c580695fa1d7", "Sean Oulashin", "oulashin"],
    ["1571427978027-75c8bde0b6bc", "Sean Oulashin", "oulashin"],
    ["1570636801932-8f6530add4d1", "Sean Oulashin", "oulashin"],
    ["1570063794363-e221037f4b6f", "Sean Oulashin", "oulashin"],
    ["1617130266198-067b697fd425", "Sean Oulashin", "oulashin"],
  ],
  cities: [
    ["1477959858617-67f85cf4f1df", "Pedro Lastra", "pedrolastra"],
    ["1514565131-fce0801e5785", "Benjamin Voros", "vorosbenisop"],
    ["1449824913935-59a10b8d2000", "Luca Bravo", "lucabravo"],
    ["1496568816309-51d7c20e3b21", "Pedro Lastra", "pedrolastra"],
    ["1513635269975-59663e0ac1ad", "Pedro Lastra", "pedrolastra"],
    ["1617167091802-36a28503255a", "Pedro Lastra", "pedrolastra"],
    ["1617246405400-462cb1ab98ab", "Pedro Lastra", "pedrolastra"],
    ["1569761316261-9a8696fa2ca3", "Benjamin Voros", "vorosbenisop"],
    ["1497366216548-37526070297c", "Benjamin Voros", "vorosbenisop"],
  ],
  architecture: [
    ["1487958449943-2429e8be8625", "Joel Filipe", "joelfilip"],
    ["1486406146926-c627a92ad1ab", "Sean Pollock", "seanpollock"],
    ["1497366216548-37526070297c", "Benjamin Voros", "vorosbenisop"],
    ["1569761316261-9a8696fa2ca3", "Benjamin Voros", "vorosbenisop"],
    ["1617167091802-36a28503255a", "Pedro Lastra", "pedrolastra"],
    ["1617246405400-462cb1ab98ab", "Pedro Lastra", "pedrolastra"],
    ["1564953078506-4999114094aa", "Luca Bravo", "lucabravo"],
    ["1514565131-fce0801e5785", "Benjamin Voros", "vorosbenisop"],
    ["1477959858617-67f85cf4f1df", "Pedro Lastra", "pedrolastra"],
  ],
  minimal: [
    ["1494438639946-1ebd1d20bf85", "Scott Webb", "scottwebb"],
    ["1557683316-973673baf926", "Gradienta", "gradienta"],
    ["1550684848-fac1c5b4e853", "Pawel Czerwinski", "pawel_czerwinski"],
    ["1618005182384-a83a8bd57fbe", "Milad Fakurian", "fakurian"],
    ["1557672172-298e090bd0f1", "Pawel Czerwinski", "pawel_czerwinski"],
    ["1579546929518-9e396f3cc809", "Gradienta", "gradienta"],
    ["1564953078506-4999114094aa", "Luca Bravo", "lucabravo"],
  ],
  abstract: [
    ["1579546929518-9e396f3cc809", "Gradienta", "gradienta"],
    ["1557672172-298e090bd0f1", "Pawel Czerwinski", "pawel_czerwinski"],
    ["1618005182384-a83a8bd57fbe", "Milad Fakurian", "fakurian"],
    ["1550684848-fac1c5b4e853", "Pawel Czerwinski", "pawel_czerwinski"],
    ["1557683316-973673baf926", "Gradienta", "gradienta"],
    ["1494438639946-1ebd1d20bf85", "Scott Webb", "scottwebb"],
    ["1564953078506-4999114094aa", "Luca Bravo", "lucabravo"],
  ],
  travel: [
    ["1488646953014-85cb44e25828", "Jaromír Kavan", "jerrykavan"],
    ["1469854523086-cc02fe5d8800", "Jake Blucker", "jakeblucker"],
    ["1501785888041-af3ef285b470", "Pietro De Grandi", "peter_mc_greats"],
    ["1500530855697-b586d89ba3ee", "Davide Cantelli", "davide_cantelli"],
    ["1570207477021-a13c135cda00", "Luca Bravo", "lucabravo"],
    ["1565446145753-f118778ef6c6", "Luca Bravo", "lucabravo"],
    ["1622744678361-64f90c825820", "Luca Bravo", "lucabravo"],
    ["1569459785779-5bd4ea198ded", "Luca Bravo", "lucabravo"],
    ["1570207438980-4c1e173c318f", "Luca Bravo", "lucabravo"],
  ],
  forest: [
    ["1511497584788-876760111969", "Sebastian Unrau", "sebastian_unrau"],
    ["1542273917363-3b1817f69a2d", "veeterzy", "veeterzy"],
    ["1441974231531-c6227db76b6e", "Casey Horner", "mischievous_penguins"],
    ["1501854140801-50d01698950b", "Johannes Plenio", "jplenio"],
    ["1528184039930-bd03972bd974", "Johannes Plenio", "jplenio"],
    ["1570156514207-424441cb02a8", "Luca Bravo", "lucabravo"],
    ["1570207498683-85061be82658", "Luca Bravo", "lucabravo"],
    ["1570207606693-e5539f3d0f8c", "Luca Bravo", "lucabravo"],
    ["1570207524888-f2db86ba4124", "Luca Bravo", "lucabravo"],
    ["1570207438980-4c1e173c318f", "Luca Bravo", "lucabravo"],
    ["1569459785779-5bd4ea198ded", "Luca Bravo", "lucabravo"],
    ["1569365788898-f96aa58c27eb", "David Marcu", "davidmarcu"],
  ],
  night: [
    ["1419242902214-272b3f66ee7a", "Jeremy Thomas", "jeremythomasphoto"],
    ["1464802686167-b939a6910659", "Jeremy Thomas", "jeremythomasphoto"],
    ["1519681393784-d120267933ba", "Benjamin Voros", "vorosbenisop"],
    ["1617130266198-067b697fd425", "Sean Oulashin", "oulashin"],
    ["1477959858617-67f85cf4f1df", "Pedro Lastra", "pedrolastra"],
    ["1449824913935-59a10b8d2000", "Luca Bravo", "lucabravo"],
    ["1496568816309-51d7c20e3b21", "Pedro Lastra", "pedrolastra"],
    ["1617167091802-36a28503255a", "Pedro Lastra", "pedrolastra"],
    ["1617246405400-462cb1ab98ab", "Pedro Lastra", "pedrolastra"],
    ["1506905925346-21bda4d32df4", "Pietro De Grandi", "peter_mc_greats"],
    ["1464822759023-fed622ff2c3b", "Kalen Emsley", "kalenemsley"],
    ["1501785888041-af3ef285b470", "Pietro De Grandi", "peter_mc_greats"],
  ],
};

/** @type {Record<string, [string, string, string][]>} */
const UNIQUE_PHOTOS = Object.fromEntries(
  Object.entries(PHOTOS).map(([category, list]) => {
    const seen = new Set();
    const unique = list.filter(([id]) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    return [category, unique];
  }),
);

export const RECENT_UNSPLASH_LIMIT = 24;

function dayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function photoUrl(id) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=2400&q=80`;
}

function creditLink(slug) {
  return `https://unsplash.com/@${slug}?utm_source=new_tab_extension&utm_medium=referral`;
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
 * @param {string} category
 * @param {{forceNew?: boolean, previousUrl?: string|null, excludeUrls?: string[]}} [opts]
 */
export function pickUnsplash(category, opts = {}) {
  const list = UNIQUE_PHOTOS[category] || UNIQUE_PHOTOS.nature;
  const key = dayKey();
  const exclude = new Set(
    [opts.previousUrl, ...(opts.excludeUrls || [])].filter(Boolean),
  );

  /** @type {number[]} */
  let candidates = list
    .map((_, index) => index)
    .filter((index) => !exclude.has(photoUrl(list[index][0])));

  if (candidates.length < 2) {
    candidates = list
      .map((_, index) => index)
      .filter((index) => photoUrl(list[index][0]) !== opts.previousUrl);
  }
  if (!candidates.length) {
    candidates = list.map((_, index) => index);
  }

  let index;
  if (opts.forceNew) {
    index = candidates[randomIndex(candidates.length)];
  } else {
    const preferred = hash(`${key}:${category}`) % list.length;
    index = candidates.includes(preferred)
      ? preferred
      : candidates[hash(`${key}:${category}:alt`) % candidates.length];
  }

  const [id, name, slug] = list[index];
  return {
    url: photoUrl(id),
    credit: `Photo by ${name} on Unsplash`,
    link: creditLink(slug),
    dayKey: key,
    category,
  };
}

/**
 * @param {string[]} images
 * @param {{forceNew?: boolean, previousUrl?: string|null}} [opts]
 */
export function pickCustom(images, opts = {}) {
  if (!images?.length) return null;

  if (!opts.forceNew && opts.previousUrl && images.includes(opts.previousUrl)) {
    return {
      url: opts.previousUrl,
      credit: "",
      link: "",
      dayKey: dayKey(),
      category: "custom",
    };
  }

  let url = images[Math.floor(Math.random() * images.length)];
  if (opts.forceNew && images.length > 1 && opts.previousUrl) {
    let guard = 0;
    do {
      url = images[Math.floor(Math.random() * images.length)];
      guard += 1;
    } while (url === opts.previousUrl && guard < 12);
  }

  return { url, credit: "", link: "", dayKey: dayKey(), category: "custom" };
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
