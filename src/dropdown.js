/**
 * Enhance native <select> elements into custom dropdown menus.
 * Optional data-icon on <option> shows an image beside the label.
 */

const CHEVRON = `<svg class="menu__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`;

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
  const trigger = wrap.querySelector(".menu__trigger");
  const label = wrap.querySelector(".menu__label");
  if (!trigger || !label) return;
  const option = select.selectedOptions[0];
  label.innerHTML = optionHtml(option);
  wrap.querySelectorAll(".menu__option").forEach((btn) => {
    btn.classList.toggle("is-selected", btn.dataset.value === select.value);
    btn.setAttribute("aria-selected", btn.dataset.value === select.value ? "true" : "false");
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
  wrap.appendChild(list);

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
      const selected = list.querySelector(".menu__option.is-selected") || list.querySelector(".menu__option");
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

  document.addEventListener("pointerdown", (e) => {
    if (!wrap.contains(/** @type {Node} */ (e.target))) {
      closeMenu(wrap, trigger, list);
    }
  });
}

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
  document.querySelectorAll(".menu.is-open").forEach((other) => {
    if (other === wrap) return;
    const t = other.querySelector(".menu__trigger");
    const l = other.querySelector(".menu__list");
    if (t && l) closeMenu(/** @type {HTMLElement} */ (other), /** @type {HTMLButtonElement} */ (t), /** @type {HTMLElement} */ (l));
  });
  wrap.classList.add("is-open");
  trigger.setAttribute("aria-expanded", "true");
  list.hidden = false;
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
