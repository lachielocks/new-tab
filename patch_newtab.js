const fs = require('fs');

let content = fs.readFileSync('src/newtab.js', 'utf8');

// Replace settingsRevert/settingsSave appropriately. We already renamed Save to Revert in newtab.js
// Let's add sessionSettingsBackup
content = content.replace('let previewPhoto = null;', `let previewPhoto = null;\nlet sessionSettingsBackup = null;`);

content = content.replace(
  'function openSettings() {',
  `function openSettings() {\n  sessionSettingsBackup = JSON.parse(JSON.stringify(settings));`
);

content = content.replace(
  'function schedulePreview() {\n  if (els.settings.hidden) return;\n  if (previewTimer) clearTimeout(previewTimer);\n  previewTimer = setTimeout(() => {\n    previewTimer = null;\n    applyPreviewFromForm();\n  }, 60);\n}',
  `function schedulePreview() {
  if (els.settings.hidden) return;
  if (previewTimer) clearTimeout(previewTimer);
  previewTimer = setTimeout(async () => {
    previewTimer = null;
    const draft = readFormDraft();
    settings = await saveSettings(draft);
    applyPreviewFromForm();
    if (settings.showWeather) {
      loadWeather();
    }
  }, 60);
}`
);

// We need to implement revertSettingsForSession
const saveSettingsRegex = /async function saveSettingsFromForm\(\) \{[\s\S]*?closeSettings\(\{ revert: false \}\);\n\}/;
content = content.replace(saveSettingsRegex, `async function saveSettingsFromForm() {
  if (sessionSettingsBackup) {
    settings = await saveSettings(sessionSettingsBackup);
    populateSettingsForm();
    applyPreviewFromForm();
    await applyBackground(true);
    updateWeatherVisibility();
    if (settings.showWeather) {
      loadWeather();
    }
    // Don't close so they can see the revert, or close? The prompt: "a revert button for each session". We'll keep it open.
  }
}`);

// Wait, the event listener is els.settingsRevert.addEventListener("click", saveSettingsFromForm);
// so replacing the function body of saveSettingsFromForm is enough.

// Remove the revert functionality on closeSettings since auto-save is enabled
const closeSettingsRegex = /function closeSettings\(\{ revert = true \} = \{\}\) \{[\s\S]*?if \(revert\) revertPreview\(\);/;
content = content.replace(closeSettingsRegex, `function closeSettings() {
  if (!document.body.classList.contains("settings-open")) {
    finishCloseSettings();
    return;
  }

  document.body.classList.remove("settings-open", "settings-tab-links");
  previewPhoto = null;
  closeAllMenus();`);

fs.writeFileSync('src/newtab.js', content);
