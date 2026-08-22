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
  ],
  mountains: [
    ["1464822759023-fed622ff2c3b", "Kalen Emsley", "kalenemsley"],
    ["1506905925346-21bda4d32df4", "Pietro De Grandi", "peter_mc_greats"],
    ["1493246507139-91e8fad9978e", "Pine Watt", "pinewatt"],
    ["1519681393784-d120267933ba", "Benjamin Voros", "vorosbenisop"],
  ],
  ocean: [
    ["1505142468610-359e7d316be0", "Christoffer Engström", "christofferengstrom"],
    ["1507525428034-b723cf961d3e", "Sean Oulashin", "oulashin"],
    ["1505118380757-91f5f5632de0", "Silas Baisch", "silasbaisch"],
  ],
  cities: [
    ["1477959858617-67f85cf4f1df", "Pedro Lastra", "pedrolastra"],
    ["1514565131-fce0801e5785", "Benjamin Voros", "vorosbenisop"],
    ["1449824913935-59a10b8d2000", "Luca Bravo", "lucabravo"],
    ["1496568816309-51d7c20e3b21", "Pedro Lastra", "pedrolastra"],
  ],
  architecture: [
    ["1487958449943-2429e8be8625", "Joel Filipe", "joelfilip"],
    ["1486406146926-c627a92ad1ab", "Sean Pollock", "seanpollock"],
  ],
  minimal: [
    ["1494438639946-1ebd1d20bf85", "Scott Webb", "scottwebb"],
    ["1557683316-973673baf926", "Gradienta", "gradienta"],
    ["1550684848-fac1c5b4e853", "Pawel Czerwinski", "pawel_czerwinski"],
    ["1618005182384-a83a8bd57fbe", "Milad Fakurian", "fakurian"],
  ],
  abstract: [
    ["1579546929518-9e396f3cc809", "Gradienta", "gradienta"],
    ["1557672172-298e090bd0f1", "Pawel Czerwinski", "pawel_czerwinski"],
    ["1618005182384-a83a8bd57fbe", "Milad Fakurian", "fakurian"],
    ["1550684848-fac1c5b4e853", "Pawel Czerwinski", "pawel_czerwinski"],
  ],
  travel: [
    ["1488646953014-85cb44e25828", "Jaromír Kavan", "jerrykavan"],
    ["1469854523086-cc02fe5d8800", "Jake Blucker", "jakeblucker"],
    ["1501785888041-af3ef285b470", "Pietro De Grandi", "peter_mc_greats"],
    ["1500530855697-b586d89ba3ee", "Davide Cantelli", "davide_cantelli"],
  ],
  forest: [
    ["1511497584788-876760111969", "Sebastian Unrau", "sebastian_unrau"],
    ["1542273917363-3b1817f69a2d", "veeterzy", "veeterzy"],
    ["1441974231531-c6227db76b6e", "Casey Horner", "mischievous_penguins"],
  ],
  night: [
    ["1419242902214-272b3f66ee7a", "Jeremy Thomas", "jeremythomasphoto"],
    ["1464802686167-b939a6910659", "Jeremy Thomas", "jeremythomasphoto"],
    ["1519681393784-d120267933ba", "Benjamin Voros", "vorosbenisop"],
  ],
};

function dayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function photoUrl(id) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=2400&q=80`;
}

function creditLink(slug) {
  return `https://unsplash.com/@${slug}?utm_source=new_tab_extension&utm_medium=referral`;
}

/**
 * @param {string} category
 * @param {{forceNew?: boolean, previousUrl?: string|null}} [opts]
 */
export function pickUnsplash(category, opts = {}) {
  const list = PHOTOS[category] || PHOTOS.nature;
  const key = dayKey();
  let index = hash(`${key}:${category}`) % list.length;

  if (opts.forceNew && list.length > 1) {
    const currentIdx = list.findIndex(([id]) => photoUrl(id) === opts.previousUrl);
    let next = index;
    let guard = 0;
    do {
      next = Math.floor(Math.random() * list.length);
      guard += 1;
    } while (next === currentIdx && guard < 12);
    index = next;
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
