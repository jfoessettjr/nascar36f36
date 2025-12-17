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

function buildSeasonOptions(seasons, selected) {
  $("#season").innerHTML = seasons
    .map((y) => `<option value="${y}" ${String(y) === String(selected) ? "selected" : ""}>${y}</option>`)
    .join("");
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "accept": "application/json" } });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

function renderRows(rows) {
  const tbody = $("#rows");
  tbody.innerHTML = rows
    .map(
      (r) => `
      <tr>
        <td>${escapeHtml(r.event_name)}</td>
        <td>${escapeHtml(r.course)}</td>
        <td>${escapeHtml(r.location)}</td>
        <td>${escapeHtml(r.winner)}</td>
        <td>${escapeHtml(r.score)}</td>
      </tr>
    `
    )
    .join("");
}

async function load() {
  try {
    $("#error").textContent = "";

    const season = $("#season").value;
    const data = await fetchJson(`/.netlify/functions/pgaWinners?season=${encodeURIComponent(season)}`);

    renderRows(data);
    $("#count").textContent = `${data.length} rows`;
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
