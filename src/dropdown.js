/**
 * Enhance native <select> elements into custom dropdown menus.
 * Lists are portaled to document.body + position:fixed so they overlay
 * scrollable panels without expanding/scrolling the popup.
 */

const CHEVRON = `<svg class="menu__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`;

/** @type {WeakMap<HTMLElement, {trigger: HTMLButtonElement, list: HTMLElement, select: HTMLSelectElement}>} */
const menus = new WeakMap();

/** @type {HTMLElement | null} */
let openWrap = null;

/**
 * @param {ParentNode} [root]
 */
export function enhanceSelects(root = document) {
  root.querySelectorAll("select.field__input--select").forEach((select) => {
    if (select.dataset.enhanced === "true") return;
    enhanceSelect(/** @type {HTMLSelectElement} */ (select));
  });
}

/**
 * Sync visible custom menu label after programmatic value changes.
 * @param {HTMLSelectElement} select
 */
export function syncSelectUi(select) {
  const wrap = select.closest(".menu");
  if (!wrap) return;
  const refs = menus.get(wrap);
  if (!refs) return;
  const { trigger, list } = refs;
  const label = trigger.querySelector(".menu__label");
  if (!label) return;
  const option = select.selectedOptions[0];
  label.innerHTML = optionHtml(option);
  list.querySelectorAll(".menu__option").forEach((btn) => {
    const selected = btn.dataset.value === select.value;
    btn.classList.toggle("is-selected", selected);
    btn.setAttribute("aria-selected", selected ? "true" : "false");
  });
}

/**
 * Close every open custom menu.
 */
export function closeAllMenus() {
  document.querySelectorAll(".menu.is-open").forEach((wrap) => {
    const refs = menus.get(/** @type {HTMLElement} */ (wrap));
    if (refs) closeMenu(/** @type {HTMLElement} */ (wrap), refs.trigger, refs.list);
  });
}

/**
 * @param {HTMLSelectElement} select
 */
function enhanceSelect(select) {
  select.dataset.enhanced = "true";
  select.classList.add("menu__native");
  select.tabIndex = -1;
  select.setAttribute("aria-hidden", "true");

  const wrap = document.createElement("div");
  wrap.className = "menu";
  select.parentNode.insertBefore(wrap, select);
  wrap.appendChild(select);

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "menu__trigger";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  trigger.innerHTML = `<span class="menu__label"></span>${CHEVRON}`;
  wrap.appendChild(trigger);

  const list = document.createElement("div");
  list.className = "menu__list";
  list.setAttribute("role", "listbox");
  list.hidden = true;
  document.body.appendChild(list);

  menus.set(wrap, { trigger, list, select });

  [...select.options].forEach((option) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "menu__option";
    btn.dataset.value = option.value;
    btn.setAttribute("role", "option");
    btn.innerHTML = optionHtml(option);
    btn.addEventListener("click", () => {
      select.value = option.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      syncSelectUi(select);
      closeMenu(wrap, trigger, list);
      trigger.focus();
    });
    list.appendChild(btn);
  });

  syncSelectUi(select);

  trigger.addEventListener("click", () => {
    const open = trigger.getAttribute("aria-expanded") === "true";
    if (open) closeMenu(wrap, trigger, list);
    else openMenu(wrap, trigger, list);
  });

  trigger.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openMenu(wrap, trigger, list);
      const selected =
        list.querySelector(".menu__option.is-selected") || list.querySelector(".menu__option");
      selected?.focus();
    }
  });

  list.addEventListener("keydown", (e) => {
    const options = [...list.querySelectorAll(".menu__option")];
    const index = options.indexOf(/** @type {HTMLElement} */ (document.activeElement));
    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu(wrap, trigger, list);
      trigger.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      options[(index + 1) % options.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      options[(index - 1 + options.length) % options.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      options[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      options[options.length - 1]?.focus();
    }
  });
}

document.addEventListener("pointerdown", (e) => {
  if (!openWrap) return;
  const refs = menus.get(openWrap);
  if (!refs) return;
  const target = /** @type {Node} */ (e.target);
  if (openWrap.contains(target) || refs.list.contains(target)) return;
  closeMenu(openWrap, refs.trigger, refs.list);
});

window.addEventListener(
  "scroll",
  () => {
    if (!openWrap) return;
    const refs = menus.get(openWrap);
    if (refs) positionList(refs.trigger, refs.list);
  },
  true
);

window.addEventListener("resize", () => {
  if (!openWrap) return;
  const refs = menus.get(openWrap);
  if (refs) positionList(refs.trigger, refs.list);
});

/**
 * @param {HTMLOptionElement | undefined} option
 */
function optionHtml(option) {
  if (!option) return "";
  const icon = option.dataset.icon;
  const iconMarkup = icon
    ? `<img class="menu__icon" src="${icon}" alt="" width="18" height="18" />`
    : "";
  return `${iconMarkup}<span class="menu__text">${escapeHtml(option.textContent || "")}</span>`;
}

/**
 * @param {HTMLElement} wrap
 * @param {HTMLButtonElement} trigger
 * @param {HTMLElement} list
 */
function openMenu(wrap, trigger, list) {
  closeAllMenus();
  wrap.classList.add("is-open");
  trigger.setAttribute("aria-expanded", "true");
  positionList(trigger, list);
  openWrap = wrap;
}

/**
 * @param {HTMLElement} wrap
 * @param {HTMLButtonElement} trigger
 * @param {HTMLElement} list
 */
function closeMenu(wrap, trigger, list) {
  wrap.classList.remove("is-open");
  trigger.setAttribute("aria-expanded", "false");
  list.hidden = true;
  list.style.top = "";
  list.style.left = "";
  list.style.width = "";
  list.style.maxHeight = "";
  if (openWrap === wrap) openWrap = null;
}

/**
 * @param {HTMLButtonElement} trigger
 * @param {HTMLElement} list
 */
function positionList(trigger, list) {
  const rect = trigger.getBoundingClientRect();
  const gap = 8;
  const viewportPad = 12;
  const spaceBelow = window.innerHeight - rect.bottom - gap - viewportPad;
  const spaceAbove = rect.top - gap - viewportPad;
  const preferBelow = spaceBelow >= 160 || spaceBelow >= spaceAbove;
  const maxHeight = Math.max(120, Math.min(240, preferBelow ? spaceBelow : spaceAbove));

  list.style.position = "fixed";
  list.style.zIndex = "1000";
  list.style.left = `${Math.round(rect.left)}px`;
  list.style.width = `${Math.round(rect.width)}px`;
  list.style.maxHeight = `${Math.round(maxHeight)}px`;
  list.style.visibility = "hidden";
  list.hidden = false;

  const height = Math.min(list.scrollHeight, maxHeight);

  if (preferBelow) {
    list.style.top = `${Math.round(rect.bottom + gap)}px`;
    list.dataset.placement = "bottom";
  } else {
    list.style.top = `${Math.round(rect.top - gap - height)}px`;
    list.dataset.placement = "top";
  }

  list.style.visibility = "";
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
