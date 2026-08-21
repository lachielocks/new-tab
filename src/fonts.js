const PRESET_WEIGHTS = "400;500;600;700";

/**
 * @param {import('./types.js').Settings} settings
 */
export function applyFont(settings) {
  const link = document.getElementById("google-font-link");
  const styleId = "custom-font-face";
  let existing = document.getElementById(styleId);
  if (existing) existing.remove();

  const preset = settings.fontPreset;

  if (preset === "custom-file" && settings.customFontDataUrl) {
    const format = settings.customFontFormat || "truetype";
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @font-face {
        font-family: "CustomUpload";
        src: url("${settings.customFontDataUrl}") format("${format}");
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
    document.documentElement.style.setProperty("--font", `"CustomUpload", system-ui, sans-serif`);
    return;
  }

  let family = "Bricolage Grotesque";
  if (preset === "custom-google" && settings.googleFontName.trim()) {
    family = settings.googleFontName.trim();
  } else if (preset !== "custom-google" && preset !== "custom-file") {
    family = preset;
  }

  if (link) {
    const query = family.replace(/ /g, "+");
    link.href = `https://fonts.googleapis.com/css2?family=${query}:wght@${PRESET_WEIGHTS}&display=swap`;
  }

  document.documentElement.style.setProperty("--font", `"${family}", system-ui, sans-serif`);
}

/**
 * @param {File} file
 * @returns {Promise<{dataUrl: string, format: string}>}
 */
export function readFontFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const name = file.name.toLowerCase();
      let format = "truetype";
      if (name.endsWith(".woff2")) format = "woff2";
      else if (name.endsWith(".woff")) format = "woff";
      else if (name.endsWith(".otf")) format = "opentype";
      resolve({ dataUrl: String(reader.result), format });
    };
    reader.readAsDataURL(file);
  });
}
