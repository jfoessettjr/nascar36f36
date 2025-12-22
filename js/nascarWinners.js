const $ = (sel) => document.querySelector(sel);

/* -----------------------------------------------------------
   Utilities
----------------------------------------------------------- */
function escapeHtml(value) {
  const s = value == null ? "" : String(value);
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Safely format dates without timezone shifting.
 * Supports:
 *  - "YYYY-MM-DD"
 *  - ISO timestamps like "2025-03-09T00:00:00.000Z"
 */
function formatDate(value) {
  if (!value) return "";

  // Handle YYYY-MM-DD explicitly (no timezone shift)
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Handle ISO timestamps safely
  const dt = new Date(value);
  if (isNaN(dt)) return "";

  return dt.toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function imgCell(url, alt) {
  if (!url) return "";
  const safeUrl = escapeHtml(url);
  const safeAlt = escapeHtml(alt || "");
  return `
    <img
      src="${safeUrl}"
      alt="${safeAlt}"
      style="height:48px;width:48px;border-radius:8px;object-fit:cover;"
      loading="lazy"
    >
  `;
}

function buildSeasonOptions(seasons, selected) {
  const seasonEl = $("#season");
  if (!seasonEl) return;

  seasonEl.innerHTML = seasons
    .map(
      (y) =>
        `<option value="${y}" ${
          String(y) === String(selected) ? "selected" : ""
        }>${y}</option>`
    )
    .join("");
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

/* -----------------------------------------------------------
   Rendering
----------------------------------------------------------- */
function render(rows) {
  const rowsEl = $("#rows");
  if (!rowsEl) return;

  rowsEl.innerHTML = rows
    .map(
      (r) => `
      <tr>
        <td>${imgCell(r.image_url, r.image_alt)}</td>
        <td>${escapeHtml(r.race_num)}</td>
        <td>${escapeHtml(r.race_name)}</td>
        <td>${escapeHtml(r.track)}</td>
        <td>${escapeHtml(r.location)}</td>
        <td>${escapeHtml(r.winner)}</td>
        <td>${escapeHtml(r.team)}</td>
        <td>${escapeHtml(r.manufacturer)}</td>
        <td>${formatDate(r.event_date)}</td>
      </tr>
    `
    )
    .join("");
}

/* -----------------------------------------------------------
   Main loader
----------------------------------------------------------- */
async function load() {
  const errorEl = $("#error");
  const seasonEl = $("#season");

  try {
    if (errorEl) errorEl.textContent = "";
    if (!seasonEl) return;

    const season = seasonEl.value;
    const rows = await fetchJson(
      `/.netlify/functions/nascarWinners?season=${encodeURIComponent(season)}`
    );

    render(rows);

    // If #count exists, update it; otherwise do nothing (won't crash).
    const countEl = $("#count");
    if (countEl) countEl.textContent = `${rows.length} row${rows.length === 1 ? "" : "s"}`;
  } catch (e) {
    if (errorEl) errorEl.textContent = e.message || String(e);
  }
}

/* -----------------------------------------------------------
   Init
----------------------------------------------------------- */
(function init() {
  const seasons = [2026, 2025, 2024, 2023, 2022];

  buildSeasonOptions(seasons, seasons[0]);

  const seasonEl = $("#season");
  if (seasonEl) seasonEl.addEventListener("change", load);

  load();
})();

