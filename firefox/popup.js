const $ = id => document.getElementById(id);

async function render() {
  const s = await chrome.storage.sync.get({ enabled: true, focusUntil: 0, redirectCount: 0 });
  $("status").textContent = s.enabled ? "ON" : "OFF";
  $("status").style.color = s.enabled ? "#2e7d32" : "#c62828";
  $("toggle").textContent = s.enabled ? "Turn off" : "Turn on";
  $("count").textContent = s.redirectCount;
  if (s.enabled && s.focusUntil) {
    const mins = Math.max(0, Math.ceil((s.focusUntil - Date.now()) / 60000));
    $("timeLeft").textContent = `${mins} min left in this session`;
  } else {
    $("timeLeft").textContent = s.enabled ? "On until you turn it off" : "";
  }
}

$("toggle").onclick = async () => {
  const { enabled } = await chrome.storage.sync.get({ enabled: true });
  await chrome.storage.sync.set({ enabled: !enabled, focusUntil: 0 });
  chrome.alarms.clear("focusEnd");
  render();
};

document.querySelectorAll("[data-min]").forEach(btn => {
  btn.onclick = async () => {
    const min = Number(btn.dataset.min);
    await chrome.storage.sync.set({ enabled: true, focusUntil: Date.now() + min * 60000 });
    chrome.alarms.create("focusEnd", { delayInMinutes: min });
    render();
  };
});

async function currentHost() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try { return { tab, host: new URL(tab.url).hostname.replace(/^www\./, "") }; }
  catch { return { tab, host: null }; }
}

$("blockThis").onclick = async () => {
  const { host } = await currentHost();
  if (!host) return;
  const { blocked = [] } = await chrome.storage.sync.get("blocked");
  if (!blocked.includes(host)) blocked.push(host);
  await chrome.storage.sync.set({ blocked });
  $("blockThis").textContent = "Blocked ✓";
};

$("workThis").onclick = async () => {
  const { tab } = await currentHost();
  if (!tab?.url?.startsWith("http")) return;
  const { workPages = [] } = await chrome.storage.sync.get("workPages");
  const filtered = workPages.filter(u => u !== tab.url);
  filtered.unshift(tab.url); // newest becomes the main redirect target
  await chrome.storage.sync.set({ workPages: filtered });
  $("workThis").textContent = "Saved ✓";
};

$("settings").onclick = e => { e.preventDefault(); chrome.runtime.openOptionsPage(); };

render();
