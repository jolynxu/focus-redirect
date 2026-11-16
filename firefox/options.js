const lines = el => el.value.split("\n").map(s => s.trim()).filter(Boolean);

async function load() {
  const s = await chrome.storage.sync.get({ blocked: [], workPages: [] });
  document.getElementById("blocked").value = s.blocked.join("\n");
  document.getElementById("work").value = s.workPages.join("\n");
}

document.getElementById("save").onclick = async () => {
  const workPages = lines(document.getElementById("work")).map(u =>
    /^https?:\/\//i.test(u) ? u : "https://" + u
  );
  await chrome.storage.sync.set({
    blocked: lines(document.getElementById("blocked")),
    workPages
  });
  const saved = document.getElementById("saved");
  saved.textContent = "Saved ✓";
  setTimeout(() => (saved.textContent = ""), 1500);
  load();
};

load();
