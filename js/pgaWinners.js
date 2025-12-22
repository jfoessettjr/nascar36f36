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
 * Safely format dates without timezone shifting
 * Supports:
 *  - YYYY-MM-DD
 *  - ISO timestamps
 */
function formatDate(value) {
  if (!value) return "";

  // Handle YYYY-MM-DD explicitly (NO timezone shift)
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

/* -----------------------------------------------------------
   Data loading
----------------------------------------------------------- */
async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

function buildSeasonOptions(seasons, selected) {
  $("#season").innerHTML = seasons
    .map(
      (y) =>
        `<option value="${y}" ${
          String(y) === String(selected) ? "selected" : ""
        }>${y}</option>`
    )
    .join("");
}

/* -----------------------------------------------------------
   Rendering
----------------------------------------------------------- */
function render(rows) {
  $("#rows").innerHTML = rows
    .map(
      (r) => `
      <tr>
        <td>${imgCell(r.image_url, r.image_alt)}</td>
        <td>${escapeHtml(r.event_name)}</td>
        <td>${escapeHtml(r.course)}</td>
        <td>${escapeHtml(r.location)}</td>
        <td>${escapeHtml(r.winner)}</td>
        <td>${escapeHtml(r.score)}</td>
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
  try {
    $("#error").textContent = "";
    $("#count").textContent = "";

    const season = $("#season").value;
    const rows = await fetchJson(
      `/.netlify/functions/pgaWinners?season=${encodeURICompo
