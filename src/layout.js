/** @typedef {'clock'|'greeting'|'search'|'quicklinks'|'weather'|'settings'|'credit'|'reroll'} WidgetId */

/** @type {WidgetId[]} */
export const WIDGET_IDS = [
  "clock",
  "greeting",
  "search",
  "quicklinks",
  "weather",
  "settings",
  "credit",
  "reroll",
];

/** @type {Record<WidgetId, string>} */
export const WIDGET_LABELS = {
  clock: "Clock",
  greeting: "Greeting",
  search: "Search",
  quicklinks: "Quick links",
  weather: "Weather",
  settings: "Settings",
  credit: "Photo credit",
  reroll: "Wallpaper reroll",
};

/**
 * 9 cells, each a stack of widget ids (top → bottom).
 * Default: weather / settings corners, main stack centered,
 * photo credit & reroll in the bottom corners.
 * @type {WidgetId[][]}
 */
export const DEFAULT_LAYOUT = [
  ["weather"],
  [],
  ["settings"],
  [],
  ["clock", "greeting", "search", "quicklinks"],
  [],
  ["credit"],
  [],
  ["reroll"],
];

export const WALLPAPER_HISTORY_LIMIT = 12;

/**
 * @param {unknown} raw
 * @returns {WidgetId[][]}
 */
export function normalizeLayout(raw) {
  const base = DEFAULT_LAYOUT.map((cell) => [...cell]);
  if (!Array.isArray(raw) || raw.length !== 9) return base;

  /** @type {WidgetId[][]} */
  const mapped = raw.map((cell, index) => {
    if (!Array.isArray(cell)) return [...base[index]];
    /** @type {WidgetId[]} */
    const next = [];
    for (const id of cell) {
      if (typeof id !== "string") continue;
      // Legacy split expand widget → single weather widget
      if (id === "weatherExpand" || id === "weatherPanel") {
        if (!next.includes("weather")) next.push("weather");
        continue;
      }
      if (!WIDGET_IDS.includes(/** @type {WidgetId} */ (id))) continue;
      if (!next.includes(/** @type {WidgetId} */ (id))) next.push(/** @type {WidgetId} */ (id));
    }
    return next;
  });

  /** @type {Set<string>} */
  const seen = new Set();
  return mapped.map((cell) => {
    /** @type {WidgetId[]} */
    const next = [];
    for (const id of cell) {
      if (seen.has(id)) continue;
      seen.add(id);
      next.push(id);
    }
    return next;
  });
}

/**
 * @param {WidgetId[][]} layout
 * @returns {Set<WidgetId>}
 */
export function placedWidgets(layout) {
  /** @type {Set<WidgetId>} */
  const set = new Set();
  for (const cell of layout) {
    for (const id of cell) set.add(id);
  }
  return set;
}

/**
 * @param {WidgetId[][]} layout
 * @param {WidgetId} widgetId
 * @returns {{ cell: number, index: number } | null}
 */
export function findWidget(layout, widgetId) {
  for (let cell = 0; cell < layout.length; cell++) {
    const index = layout[cell].indexOf(widgetId);
    if (index >= 0) return { cell, index };
  }
  return null;
}

/**
 * @param {WidgetId[][]} layout
 * @param {WidgetId} widgetId
 * @returns {WidgetId[][]}
 */
export function removeWidget(layout, widgetId) {
  return layout.map((cell) => cell.filter((id) => id !== widgetId));
}

/**
 * @param {WidgetId[][]} layout
 * @param {WidgetId} widgetId
 * @param {number} cellIndex
 * @param {number} [stackIndex]
 * @returns {WidgetId[][]}
 */
export function placeWidget(layout, widgetId, cellIndex, stackIndex) {
  const next = removeWidget(layout, widgetId).map((cell) => [...cell]);
  if (cellIndex < 0 || cellIndex > 8) return next;
  const stack = next[cellIndex];
  const at = stackIndex == null ? stack.length : Math.max(0, Math.min(stack.length, stackIndex));
  stack.splice(at, 0, widgetId);
  return next;
}

/**
 * @param {number} index
 * @returns {{ vertical: 'start'|'center'|'end', horizontal: 'start'|'center'|'end' }}
 */
export function cellAlign(index) {
  const row = Math.floor(index / 3);
  const col = index % 3;
  const vertical = row === 0 ? "start" : row === 2 ? "end" : "center";
  const horizontal = col === 0 ? "start" : col === 2 ? "end" : "center";
  return { vertical, horizontal };
}
