const $ = (sel) => document.querySelector(sel);

function escapeHtml(v) {
  const s = v == null ? "" : String(v);
  return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

function cloudinaryThumb(url, transform = "w_96,h_96,c_fill,f_auto,q_auto") {
  if (!url) return "";
  return url.includes("/image/upload/")
    ? url.replace("/image/upload/", `/image/upload/${transform}/`)
    : url;
}

function imgCell(url, alt) {
  if (!url) return "";
  const u = escapeHtml(cloudinaryThumb(url));
  const a = escapeHtml(alt || "");
  return `<img src="${u}" alt="${a}" style="height:48px;width:48px;border-radius:8px;object-fit:cover;" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none';">`;
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
      <td>${escapeHtml(r.artist)}</td>
      <td>${escapeHtml(r.album)}</td>
      <td>${escapeHtml(r.year_released)}</td>
      <td>${escapeHtml(r.genre)}</td>
      <td>${escapeHtml(r.label)}</td>
      <td>${escapeHtml(r.condition)}</td>
      <td>${escapeHtml(r.notes)}</td>
    </tr>
  `).join("");
  $("#count").textContent = `${rows.length} records`;
}

async function load() {
  try {
    $("#error").textContent = "";
    const rows = await fetchJson("/.netlify/functions/vinylRecords");
    render(rows);
  } catch (e) {
    $("#error").textContent = e.message || String(e);
  }
}

load();
