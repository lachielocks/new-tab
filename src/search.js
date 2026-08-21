const SEARCH_ENGINES = {
  google: {
    name: "Google",
    url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
    icon: () => iconImg("google.png"),
  },
  duckduckgo: {
    name: "DuckDuckGo",
    url: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
    icon: () => iconImg("duckduckgo.png"),
  },
  bing: {
    name: "Bing",
    url: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
    icon: () => iconImg("bing.png"),
  },
  brave: {
    name: "Brave",
    url: (q) => `https://search.brave.com/search?q=${encodeURIComponent(q)}`,
    icon: () => iconImg("brave.png"),
  },
  ecosia: {
    name: "Ecosia",
    url: (q) => `https://www.ecosia.org/search?q=${encodeURIComponent(q)}`,
    icon: () => iconImg("ecosia.png"),
  },
  yahoo: {
    name: "Yahoo",
    url: (q) => `https://search.yahoo.com/search?p=${encodeURIComponent(q)}`,
    icon: () => iconImg("yahoo.png"),
  },
  startpage: {
    name: "Startpage",
    url: (q) => `https://www.startpage.com/sp/search?query=${encodeURIComponent(q)}`,
    icon: () => iconImg("startpage.png"),
  },
};

const AI_PROVIDERS = {
  acosta: {
    name: "Acosta",
    url: (q) =>
      `https://platform.acosta-ai.com/?prompt=${encodeURIComponent(q)}&send=true`,
    icon: () => iconImg("acosta.png"),
  },
  chatgpt: {
    name: "ChatGPT",
    url: (q) => `https://chatgpt.com/?q=${encodeURIComponent(q)}`,
    icon: () => iconImg("gpt-white.png"),
  },
  claude: {
    name: "Claude",
    url: (q) => `https://claude.ai/new?q=${encodeURIComponent(q)}`,
    icon: () => iconImg("claude.png"),
  },
  perplexity: {
    name: "Perplexity",
    url: (q) => `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`,
    icon: () => iconImg("perplexity.png"),
  },
  gemini: {
    name: "Gemini",
    url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}&udm=50`,
    icon: () => iconImg("gemini.png"),
  },
};

/**
 * @param {string} file
 */
function iconImg(file) {
  return `<img src="../icons/${file}" alt="" width="18" height="18" />`;
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
