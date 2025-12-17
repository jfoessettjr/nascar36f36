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

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "accept": "application/json" } });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

function renderRows(rows) {
  const tbody = $("#rows");
  tbody.innerHTML = rows
    .map(
      (b) => `
      <tr>
        <td>${escapeHtml(b.title)}</td>
        <td>${escapeHtml(b.author)}</td>
        <td>${escapeHtml(b.genre)}</td>
        <td>${escapeHtml(b.year_published)}</td>
        <td>${escapeHtml(b.format)}</td>
        <td>${escapeHtml(b.notes)}</td>
      </tr>
    `
    )
    .join("");
}

async function load() {
  try {
    $("#error").textContent = "";
    const data = await fetchJson(`/.netlify/functions/books`);
    renderRows(data);
    $("#count").textContent = `${data.length} rows`;
  } catch (e) {
    $("#error").textContent = e.message || String(e);
  }
}

load();
