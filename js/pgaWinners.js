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

function formatDate(value) {
  if (!value) return "";

  const d = new Date(value);
  if (isNaN(d)) return "";

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}


function imgCell(url, alt) {
  if (!url) return "";
  const safeUrl = escapeHtml(url);
  const safeAlt = escapeHtml(alt || "");
  return `<img src="${safeUrl}" alt="${safeAlt}" style="height:48px;border-radius:8px;object-fit:cover;" loading="lazy">`;
}

function buildSeasonOptions(seasons, selected) {
  $("#season").innerHTML = seasons
    .map((y) => `<option value="${y}" ${String(y) === String(selected) ? "selected" : ""}>${y}</option>`)
    .join("");
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

function render(rows) {
  $("#rows").innerHTML = rows.map(r => `
    <tr>
      <td>${imgCell(r.image_url, r.image_alt)}</td>
      <td>${escapeHtml(r.event_name)}</td>
      <td>${escapeHtml(r.course)}</td>
      <td>${escapeHtml(r.location)}</td>
      <td>${escapeHtml(r.winner)}</td>
      <td>${escapeHtml(r.score)}</td>
      <td>${formatDate(r.event_date)}</td>
    </tr>
  `).join("");
}

async function load() {
  try {
    $("#error").textContent = "";
    const season = $("#season").value;
    const rows = await fetchJson(`/.netlify/functions/pgaWinners?season=${encodeURIComponent(season)}`);
    render(rows);
    $("#count").textContent = `${rows.length} rows`;
  } catch (e) {
    $("#error").textContent = e.message || String(e);
  }
}

(function init() {
  const seasons = [2026, 2025, 2024, 2023, 2022];
  buildSeasonOptions(seasons, seasons[0]);
  $("#season").addEventListener("change", load);
  load();
})();
