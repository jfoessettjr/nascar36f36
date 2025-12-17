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
  $("#rows").innerHTML = rows.map(g => `
    <tr>
      <td>${imgCell(g.image_url, g.image_alt)}</td>
      <td>${escapeHtml(g.title)}</td>
      <td>${escapeHtml(g.platform)}</td>
      <td>${escapeHtml(g.status)}</td>
      <td>${escapeHtml(g.hours_played)}</td>
      <td>${escapeHtml(g.rating)}</td>
      <td>${escapeHtml(g.year_released)}</td>
      <td>${escapeHtml(g.notes)}</td>
    </tr>
  `).join("");
  $("#count").textContent = `${rows.length} games`;
}

async function load() {
  try {
    $("#error").textContent = "";
    const rows = await fetchJson("/.netlify/functions/videoGames");
    render(rows);
  } catch (e) {
    $("#error").textContent = e.message || String(e);
  }
}

load();
