// Focus Redirect - background service worker

const DEFAULTS = {
  enabled: true,
  blocked: ["youtube.com", "reddit.com", "twitter.com", "x.com", "facebook.com", "instagram.com", "tiktok.com", "netflix.com"],
  workPages: ["https://docs.google.com/"],
  focusUntil: 0,        // timestamp; 0 = no timer (focus stays on while enabled)
  redirectCount: 0
};

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.sync.get(null);
  await chrome.storage.sync.set({ ...DEFAULTS, ...current });
  updateBadge();
});

chrome.runtime.onStartup.addListener(updateBadge);

function hostMatches(url, patterns) {
  let host;
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return false;
    host = u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return false;
  }
  return patterns.some(p => {
    p = p.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
    return p && (host === p || host.endsWith("." + p));
  });
}

async function isFocusActive(settings) {
  if (!settings.enabled) return false;
  if (settings.focusUntil && Date.now() > settings.focusUntil) {
    // Timed session finished
    await chrome.storage.sync.set({ enabled: false, focusUntil: 0 });
    updateBadge();
    return false;
  }
  return true;
}

async function maybeRedirect(tabId, url) {
  const s = await chrome.storage.sync.get(DEFAULTS);
  if (!(await isFocusActive(s))) return;
  if (!hostMatches(url, s.blocked)) return;

  const workPages = s.workPages.filter(Boolean);
  if (workPages.length === 0) return;

  // If one of your work pages is already open, jump to it and close the distraction.
  const tabs = await chrome.tabs.query({});
  const existing = tabs.find(t => t.id !== tabId && t.url && workPages.some(w => sameSite(t.url, w)));

  if (existing) {
    await chrome.tabs.update(existing.id, { active: true });
    await chrome.windows.update(existing.windowId, { focused: true });
    chrome.tabs.remove(tabId).catch(() => {});
  } else {
    chrome.tabs.update(tabId, { url: workPages[0] });
  }

  await chrome.storage.sync.set({ redirectCount: (s.redirectCount || 0) + 1 });
}

function sameSite(a, b) {
  try {
    return new URL(a).hostname.replace(/^www\./, "") === new URL(b).hostname.replace(/^www\./, "");
  } catch {
    return false;
  }
}

// Catch normal navigations
chrome.webNavigation.onBeforeNavigate.addListener(d => {
  if (d.frameId === 0) maybeRedirect(d.tabId, d.url);
});

// Catch single-page-app navigations (e.g. clicking around YouTube)
chrome.webNavigation.onHistoryStateUpdated.addListener(d => {
  if (d.frameId === 0) maybeRedirect(d.tabId, d.url);
});

// Timer end
chrome.alarms.onAlarm.addListener(async a => {
  if (a.name === "focusEnd") {
    await chrome.storage.sync.set({ enabled: false, focusUntil: 0 });
    updateBadge();
  }
});

chrome.storage.onChanged.addListener(changes => {
  if (changes.enabled || changes.focusUntil) updateBadge();
});

async function updateBadge() {
  const { enabled } = await chrome.storage.sync.get({ enabled: true });
  chrome.action.setBadgeText({ text: enabled ? "ON" : "" });
  chrome.action.setBadgeBackgroundColor({ color: "#2e7d32" });
}
