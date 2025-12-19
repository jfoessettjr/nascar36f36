const $ = (sel) => document.querySelector(sel);

function escapeHtml(value) {
  const s = value == null ? "" : String(value);
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function imgCell(url, alt) {
  if (!url) return "";
  const safeUrl = escapeHtml(url);
  const safeAlt = escapeHtml(alt || "");
  return `<img src="${safeUrl}" alt="${safeAlt}" style="height:48px;border-radius:8px;object-fit:cover;" loading="lazy">`;
}

function buildSeasonOptions(seasons, selected) {
  const seasonEl = $("#season");
  if (!seasonEl) return;

  seasonEl.innerHTML = seasons
    .map((y) => `<option value="${y}" ${String(y) === String(selected) ? "selected" : ""}>${y}</option>`)
    .join("");
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

function render(rows) {
  const rowsEl = $("#rows");
  if (!rowsEl) return;

  rowsEl.innerHTML = rows.map(r => `
    <tr>
      <td>${imgCell(r.image_url, r.image_alt)}</td>
      <td>${escapeHtml(r.race_num)}</td>
      <td>${escapeHtml(r.race_name)}</td>
      <td>${escapeHtml(r.track)}</td>
      <td>${escapeHtml(r.location)}</td>
      <td>${escapeHtml(r.winner)}</td>
      <td>${escapeHtml(r.team)}</td>
      <td>${escapeHtml(r.manufacturer)}</td>
      <td>${escapeHtml(r.event_date)}</td>
    </tr>
  `).join("");
}

async function load() {
  const errorEl = $("#error");
  const seasonEl = $("#season");

  try {
    if (errorEl) errorEl.textContent = "";
    if (!seasonEl) return;

    const season = seasonEl.value;
    const rows = await fetchJson(`/.netlify/functions/nascarWinners?season=${encodeURIComponent(season)}`);
    render(rows);

    // Row count removed on purpose. If you ever re-add it, this won't crash:
    const countEl = $("#count");
    if (countEl) countEl.textContent = `${rows.length} rows`;
  } catch (e) {
    if (errorEl) errorEl.textContent = e.message || String(e);
  }
}

(function init() {
  const seasons = [2026, 2025, 2024, 2023, 2022];
  buildSeasonOptions(seasons, seasons[0]);

  const seasonEl = $("#season");
  if (seasonEl) seasonEl.addEventListener("change", load);

  load();
})();
