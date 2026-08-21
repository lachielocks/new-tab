const SEARCH_ENGINES = {
  google: {
    name: "Google",
    url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
    icon: googleIcon,
  },
  duckduckgo: {
    name: "DuckDuckGo",
    url: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
    icon: duckIcon,
  },
  bing: {
    name: "Bing",
    url: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
    icon: bingIcon,
  },
  brave: {
    name: "Brave",
    url: (q) => `https://search.brave.com/search?q=${encodeURIComponent(q)}`,
    icon: braveIcon,
  },
  ecosia: {
    name: "Ecosia",
    url: (q) => `https://www.ecosia.org/search?q=${encodeURIComponent(q)}`,
    icon: ecosiaIcon,
  },
};

const AI_PROVIDERS = {
  acosta: {
    name: "Acosta",
    url: (q) =>
      `https://platform.acosta-ai.com/?prompt=${encodeURIComponent(q)}&send=true`,
    icon: acostaIcon,
  },
  chatgpt: {
    name: "ChatGPT",
    url: (q) => `https://chatgpt.com/?q=${encodeURIComponent(q)}`,
    icon: openaiIcon,
  },
  claude: {
    name: "Claude",
    url: (q) => `https://claude.ai/new?q=${encodeURIComponent(q)}`,
    icon: claudeIcon,
  },
  perplexity: {
    name: "Perplexity",
    url: (q) => `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`,
    icon: perplexityIcon,
  },
  gemini: {
    name: "Gemini",
    url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}&udm=50`,
    icon: geminiIcon,
  },
};

function googleIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`;
}

function duckIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#DE5833" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.5 14.5h-3v-1.2c0-.66.54-1.2 1.2-1.2h.6c.66 0 1.2.54 1.2 1.2v1.2zm1.84-5.34-.9.9c-.5.5-1.1.8-1.74.9v.54h-1.4v-.7c0-.9.35-1.76.98-2.4l1.02-1.04c.34-.34.54-.8.54-1.3 0-1.02-.83-1.85-1.85-1.85S8.24 6.98 8.24 8h-1.4c0-1.8 1.46-3.25 3.25-3.25S13.34 6.2 13.34 8c0 .86-.34 1.68-.95 2.29l-.05-.13z"/></svg>`;
}

function bingIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#00809D" d="M5 3v16.5l3.5 1.75 8.25-4.75v-4.25L10 14.5V7.75L5 3zm10.75 9.25 2.5 1.25-5.25 3 2.75-4.25z"/></svg>`;
}

function braveIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#FB542B" d="M12 2 8.5 4.2 5.2 3.5 4 6.8 2 8.5v3.2L4.5 15 6 21.5 12 22l6-0.5L19.5 15 22 11.7V8.5L20 6.8 18.8 3.5 15.5 4.2 12 2zm0 3.2 2.4 1.5 2.3-.5.7 2 1.3 1.1v1.6l-1.5 1.8-.9 4.1L12 19.2l-4.3-1.4-.9-4.1L5.3 11.9V10.3l1.3-1.1.7-2 2.3.5L12 5.2z"/></svg>`;
}

function ecosiaIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#36B37E"/><path fill="#fff" d="M12 6.5c-2.4 1.8-3.8 4.2-3.8 6.6 0 2.1 1.7 3.8 3.8 3.8s3.8-1.7 3.8-3.8c0-2.4-1.4-4.8-3.8-6.6z"/></svg>`;
}

function acostaIcon() {
  return `<img src="../icons/acosta.png" alt="" width="18" height="18" />`;
}

function openaiIcon() {
  return `<img src="../icons/gpt-white.png" alt="" width="18" height="18" />`;
}

function claudeIcon() {
  return `<img src="../icons/claude.png" alt="" width="18" height="18" />`;
}

function perplexityIcon() {
  return `<img src="../icons/perplexity.png" alt="" width="18" height="18" />`;
}

function geminiIcon() {
  return `<img src="../icons/gemini.png" alt="" width="18" height="18" />`;
}

/**
 * @param {'web'|'ai'} mode
 * @param {string} engineKey
 * @param {string} aiKey
 * @param {string} query
 */
export function buildDestination(mode, engineKey, aiKey, query) {
  const q = query.trim();
  if (!q) return null;
  if (mode === "ai") {
    const provider = AI_PROVIDERS[aiKey] || AI_PROVIDERS.acosta;
    return provider.url(q);
  }
  const engine = SEARCH_ENGINES[engineKey] || SEARCH_ENGINES.google;
  return engine.url(q);
}

/**
 * @param {'web'|'ai'} mode
 * @param {string} engineKey
 * @param {string} aiKey
 */
export function leadingIconHtml(mode, engineKey, aiKey) {
  if (mode === "ai") {
    const provider = AI_PROVIDERS[aiKey] || AI_PROVIDERS.acosta;
    return provider.icon();
  }
  const engine = SEARCH_ENGINES[engineKey] || SEARCH_ENGINES.google;
  return engine.icon();
}

/**
 * @param {'web'|'ai'} mode
 * @param {string} engineKey
 * @param {string} aiKey
 */
export function placeholderFor(mode, engineKey, aiKey) {
  if (mode === "ai") {
    const provider = AI_PROVIDERS[aiKey] || AI_PROVIDERS.acosta;
    return `Ask ${provider.name}…`;
  }
  const engine = SEARCH_ENGINES[engineKey] || SEARCH_ENGINES.google;
  return `Search ${engine.name}`;
}

export { SEARCH_ENGINES, AI_PROVIDERS };
