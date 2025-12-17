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
  return `<img src="${safeUrl}" alt="${safeAlt}" style="height:64px;border-radius:8px;object-fit:cover;" loading="lazy">`;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

function render(rows) {
  $("#rows").innerHTML = rows.map(b => `
    <tr>
      <td>${imgCell(b.image_url, b.image_alt)}</td>
      <td>${escapeHtml(b.title)}</td>
      <td>${escapeHtml(b.author)}</td>
      <td>${escapeHtml(b.genre)}</td>
      <td>${escapeHtml(b.year_published)}</td>
      <td>${escapeHtml(b.format)}</td>
      <td>${escapeHtml(b.notes)}</td>
    </tr>
  `).join("");
}

async function load() {
  try {
    $("#error").textContent = "";
    const rows = await fetchJson("/.netlify/functions/books");
    render(rows);
    $("#count").textContent = `${rows.length} rows`;
  } catch (e) {
    $("#error").textContent = e.message || String(e);
  }
}

load();
