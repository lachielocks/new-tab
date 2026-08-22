const NEWTAB_URL = chrome.runtime.getURL("src/newtab.html");

chrome.action.onClicked.addListener(async () => {
  const pattern = `${NEWTAB_URL}*`;
  const tabs = await chrome.tabs.query({ url: pattern });
  const existing = tabs[0];

  if (existing?.id) {
    if (existing.windowId) {
      await chrome.windows.update(existing.windowId, { focused: true });
    }
    await chrome.tabs.update(existing.id, { active: true });
    try {
      await chrome.tabs.sendMessage(existing.id, { type: "OPEN_SETTINGS" });
      return;
    } catch {
      await chrome.tabs.update(existing.id, { url: `${NEWTAB_URL}?settings=1` });
      return;
    }
  }

  await chrome.tabs.create({ url: `${NEWTAB_URL}?settings=1` });
});
