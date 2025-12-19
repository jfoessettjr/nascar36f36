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

function setOk(msg) { const el = $("#messages"); if (el) el.textContent = msg || ""; }
function setErr(msg) { const el = $("#error"); if (el) el.textContent = msg || ""; }

function getToken() { return sessionStorage.getItem("ADMIN_TOKEN") || ""; }
function setToken(t) { sessionStorage.setItem("ADMIN_TOKEN", t); }
function clearToken() { sessionStorage.removeItem("ADMIN_TOKEN"); }

async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

async function adminRequest(url, method, bodyObj) {
  const token = getToken();
  if (!token) throw new Error("No admin token saved.");

  const res = await fetch(url, {
    method,
    headers: {
      "content-type": "application/json",
      "x-admin-token": token,
      accept: "application/json",
    },
    body: JSON.stringify(bodyObj || {}),
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  if (!res.ok) throw new Error(`${method} failed (${res.status}): ${JSON.stringify(data)}`);
  return data;
}

/** Cloudinary widget config loaded from Netlify function */
let CLOUDINARY = null;
async function loadCloudinaryConfig() {
  if (CLOUDINARY) return CLOUDINARY;
  try {
    CLOUDINARY = await fetchJson("/.netlify/functions/cloudinaryConfig");
    return CLOUDINARY;
  } catch (e) {
    // Not fatal (admin can still paste URLs manually)
    CLOUDINARY = { error: e.message || String(e) };
    return CLOUDINARY;
  }
}

// --- Date helpers ---
function normalizeDateForInput(v) {
  // Accepts: "YYYY-MM-DD", ISO timestamp, Date-ish values
  if (v == null) return "";
  const s = String(v).trim();
  if (!s) return "";

  // If it already looks like YYYY-MM-DD, keep it
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // If ISO timestamp, take first 10 chars
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.slice(0, 10);

  // Last resort: try Date parse
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // If unparseable, don't force it
  return "";
}

const config = {
  nascar36: {
    read: (season) => `/.netlify/functions/nascar36?season=${encodeURIComponent(season || "")}`,
    write: "/.netlify/functions/nascar36Admin",
    columns: [
      ["id", "ID"], ["season_year", "Season"], ["race_num", "Race #"], ["race_name", "Race"],
      ["track", "Track"], ["location", "Location"], ["driver", "Driver"], ["finish_pos", "Finish"],
      ["points", "Points"], ["notes", "Notes"], ["image_url", "Image URL"], ["image_alt", "Image Alt"],
    ],
    formFields: [
      ["id", "ID (for edit)", "number", "span-3"],
      ["season_year", "Season", "number", "span-3"],
      ["race_num", "Race #", "number", "span-3"],
      ["finish_pos", "Finish", "number", "span-3"],
      ["race_name", "Race", "text", "span-6"],
      ["driver", "Driver", "text", "span-6"],
      ["track", "Track", "text", "span-6"],
      ["location", "Location", "text", "span-6"],
      ["points", "Points", "number", "span-3"],
      ["notes", "Notes", "textarea", "span-12"],
      ["image_url", "Image URL", "text", "span-6"],
      ["image_alt", "Image Alt Text", "text", "span-6"],
    ],
    seasonRequired: true,
  },

  nascarWinners: {
    read: (season) => `/.netlify/functions/nascarWinners?season=${encodeURIComponent(season || "")}`,
    write: "/.netlify/functions/nascarWinnersAdmin",
    columns: [
      ["id", "ID"],
      ["season_year", "Season"],
      ["event_date", "Event Date"],   // ✅ added
      ["race_num", "Race #"],
      ["race_name", "Race"],
      ["track", "Track"],
      ["location", "Location"],
      ["winner", "Winner"],
      ["team", "Team"],
      ["manufacturer", "Manufacturer"],
      ["image_url", "Image URL"],
      ["image_alt", "Image Alt"],
    ],
    formFields: [
      ["id", "ID (for edit)", "number", "span-3"],
      ["season_year", "Season", "number", "span-3"],
      ["event_date", "Event Date", "date", "span-3"], // ✅ added (date input)
      ["race_num", "Race #", "number", "span-3"],
      ["race_name", "Race", "text", "span-6"],
      ["winner", "Winner", "text", "span-6"],
      ["track", "Track", "text", "span-6"],
      ["location", "Location", "text", "span-6"],
      ["team", "Team", "text", "span-6"],
      ["manufacturer", "Manufacturer", "text", "span-6"],
      ["image_url", "Image URL", "text", "span-6"],
      ["image_alt", "Image Alt Text", "text", "span-6"],
    ],
    seasonRequired: true,
  },

  pgaWinners: {
    read: (season) => `/.netlify/functions/pgaWinners?season=${encodeURIComponent(season || "")}`,
    write: "/.netlify/functions/pgaWinnersAdmin",
    columns: [
      ["id", "ID"],
      ["season_year", "Season"],
      ["event_date", "Event Date"],   // ✅ added
      ["event_name", "Event"],
      ["course", "Course"],
      ["location", "Location"],
      ["winner", "Winner"],
      ["score", "Score"],
      ["image_url", "Image URL"],
      ["image_alt", "Image Alt"],
    ],
    formFields: [
      ["id", "ID (for edit)", "number", "span-3"],
      ["season_year", "Season", "number", "span-3"],
      ["event_date", "Event Date", "date", "span-3"], // ✅ added (date input)
      ["event_name", "Event", "text", "span-6"],
      ["winner", "Winner", "text", "span-6"],
      ["course", "Course", "text", "span-6"],
      ["location", "Location", "text", "span-6"],
      ["score", "Score", "text", "span-6"],
      ["image_url", "Image URL", "text", "span-6"],
      ["image_alt", "Image Alt Text", "text", "span-6"],
    ],
    seasonRequired: true,
  },

  books: {
    read: () => "/.netlify/functions/books",
    write: "/.netlify/functions/booksAdmin",
    columns: [
      ["id", "ID"], ["title", "Title"], ["author", "Author"], ["genre", "Genre"],
      ["year_published", "Year"], ["format", "Format"], ["notes", "Notes"],
      ["image_url", "Image URL"], ["image_alt", "Image Alt"],
    ],
    formFields: [
      ["id", "ID (for edit)", "number", "span-3"],
      ["title", "Title", "text", "span-6"],
      ["author", "Author", "text", "span-6"],
      ["genre", "Genre", "text", "span-6"],
      ["year_published", "Year", "number", "span-3"],
      ["format", "Format", "text", "span-6"],
      ["notes", "Notes", "textarea", "span-12"],
      ["image_url", "Image URL", "text", "span-6"],
      ["image_alt", "Image Alt Text", "text", "span-6"],
    ],
    seasonRequired: false,
  },

  videoGames: {
    read: () => "/.netlify/functions/videoGames",
    write: "/.netlify/functions/videoGamesAdmin",
    columns: [
      ["id","ID"],["title","Title"],["platform","Platform"],["status","Status"],
      ["hours_played","Hours"],["rating","Rating"],["year_released","Year"],["notes","Notes"],
      ["image_url","Image URL"],["image_alt","Image Alt"],
    ],
    formFields: [
      ["id","ID (for edit)","number","span-3"],
      ["title","Title","text","span-6"],
      ["platform","Platform","text","span-6"],
      ["status","Status","text","span-6"],
      ["hours_played","Hours Played","number","span-3"],
      ["rating","Rating","number","span-3"],
      ["year_released","Year Released","number","span-3"],
      ["notes","Notes","textarea","span-12"],
      ["image_url","Image URL","text","span-6"],
      ["image_alt","Image Alt Text","text","span-6"],
    ],
    seasonRequired: false,
  },

  vinylRecords: {
    read: () => "/.netlify/functions/vinylRecords",
    write: "/.netlify/functions/vinylRecordsAdmin",
    columns: [
      ["id","ID"],["artist","Artist"],["album","Album"],["year_released","Year"],
      ["genre","Genre"],["label","Label"],["condition","Condition"],["notes","Notes"],
      ["image_url","Image URL"],["image_alt","Image Alt"],
    ],
    formFields: [
      ["id","ID (for edit)","number","span-3"],
      ["artist","Artist","text","span-6"],
      ["album","Album","text","span-6"],
      ["year_released","Year Released","number","span-3"],
      ["genre","Genre","text","span-6"],
      ["label","Label","text","span-6"],
      ["condition","Condition","text","span-6"],
      ["notes","Notes","textarea","span-12"],
      ["image_url","Image URL","text","span-6"],
      ["image_alt","Image Alt Text","text","span-6"],
    ],
    seasonRequired: false,
  },
};

function getFormValue(key, type) {
  const el = $(`#f_${key}`);
  if (!el) return null;

  const raw = el.value;

  if (type === "number") {
    if (raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }

  if (type === "date") {
    // input[type=date] returns YYYY-MM-DD or ""
    return raw === "" ? null : raw;
  }

  return raw === "" ? null : raw;
}

function getPayload(datasetKey) {
  const cfg = config[datasetKey];
  const payload = {};
  for (const [key, _label, type] of cfg.formFields) payload[key] = getFormValue(key, type);
  return payload;
}

function fillFormFromRow(datasetKey, row) {
  const cfg = config[datasetKey];

  for (const [key, _label, type] of cfg.formFields) {
    const el = $(`#f_${key}`);
    if (!el) continue;

    if (type === "date") {
      el.value = normalizeDateForInput(row[key]);
      continue;
    }

    el.value = row[key] == null ? "" : String(row[key]);
  }

  refreshImagePreview();
}

function clearForm() {
  const datasetKey = $("#dataset").value;
  const cfg = config[datasetKey];

  for (const [key] of cfg.formFields) {
    const el = $(`#f_${key}`);
    if (el) el.value = "";
  }
  refreshImagePreview();
}

function refreshImagePreview() {
  const urlEl = $("#f_image_url");
  const prev = $("#imagePreview");
  if (!urlEl || !prev) return;

  const url = urlEl.value.trim();
  if (!url) {
    prev.innerHTML = `<div class="muted">No image selected.</div>`;
    return;
  }

  const safe = escapeHtml(url);
  prev.innerHTML = `
    <img src="${safe}" alt="" style="height:96px;width:96px;border-radius:10px;object-fit:cover;" loading="lazy"
      referrerpolicy="no-referrer" onerror="this.style.display='none';">
    <div class="muted mt-2" style="word-break:break-all;">${safe}</div>
  `;
}

async function openCloudinaryWidget() {
  const cfg = await loadCloudinaryConfig();

  if (!cfg || cfg.error) {
    throw new Error(cfg?.error || "Cloudinary config not available. Check Netlify env vars and cloudinaryConfig function.");
  }

  if (!window.cloudinary || !window.cloudinary.createUploadWidget) {
    throw new Error("Cloudinary widget script not loaded.");
  }

  const urlInput = $("#f_image_url");
  const altInput = $("#f_image_alt");

  if (!urlInput) throw new Error("image_url field not found on this form.");

  return new Promise((resolve, reject) => {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: cfg.cloudName,
        uploadPreset: cfg.uploadPreset,
        sources: ["local", "url", "camera"],
        multiple: false,
        maxFiles: 1,
        clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
        maxImageFileSize: 10 * 1024 * 1024,
        folder: "ytsejammer",
      },
      (error, result) => {
        if (error) return reject(error);

        if (result && result.event === "success") {
          const secureUrl = result.info.secure_url;
          urlInput.value = secureUrl;

          if (altInput && !altInput.value.trim()) {
            const original = result.info.original_filename || "image";
            altInput.value = original.replaceAll("-", " ").replaceAll("_", " ");
          }

          refreshImagePreview();
          resolve(secureUrl);
        }
      }
    );

    widget.open();
  });
}

function buildForm(datasetKey) {
  const cfg = config[datasetKey];

  const fieldsHtml = cfg.formFields.map(([key, label, type, spanClass]) => {
    if (type === "textarea") {
      return `
        <div class="${spanClass}">
          <label class="form-label" for="f_${escapeHtml(key)}">${escapeHtml(label)}</label>
          <textarea id="f_${escapeHtml(key)}" class="form-control"></textarea>
        </div>
      `;
    }
    return `
      <div class="${spanClass}">
        <label class="form-label" for="f_${escapeHtml(key)}">${escapeHtml(label)}</label>
        <input id="f_${escapeHtml(key)}" type="${escapeHtml(type)}" class="form-control" />
      </div>
    `;
  }).join("");

  const hasImageUrl = cfg.formFields.some(([k]) => k === "image_url");
  const uploadBlock = hasImageUrl ? `
    <div class="span-12">
      <div class="d-flex flex-wrap align-items-center gap-2">
        <button id="btnUploadImage" type="button" class="btn btn-outline-primary">
          Upload Image (Cloudinary)
        </button>
        <button id="btnPreviewImage" type="button" class="btn btn-outline-secondary">
          Preview
        </button>
        <div class="muted">Uploads go to Cloudinary and auto-fill Image URL.</div>
      </div>
      <div id="imagePreview" class="mt-3"></div>
    </div>
  ` : "";

  $("#formArea").innerHTML = `
    <div class="card-lite">
      <h3 class="h5 mb-3">Add / Edit</h3>

      <div class="form-grid">
        ${fieldsHtml}
        ${uploadBlock}
      </div>

      <div class="actions mt-3">
        <button id="btnCreate" class="btn btn-primary">Create</button>
        <button id="btnUpdate" class="btn btn-primary">Update</button>
        <button id="btnDelete" class="btn btn-outline-danger">Delete</button>
        <button id="btnClear" class="btn btn-outline-secondary">Clear</button>
      </div>

      <div class="muted mt-2">
        Create = POST, Update = PUT (requires ID), Delete = DELETE (requires ID).
      </div>
    </div>
  `;

  $("#btnCreate").addEventListener("click", async () => doWrite("POST"));
  $("#btnUpdate").addEventListener("click", async () => doWrite("PUT"));
  $("#btnDelete").addEventListener("click", async () => doWrite("DELETE"));
  $("#btnClear").addEventListener("click", clearForm);

  const uploadBtn = $("#btnUploadImage");
  if (uploadBtn) {
    uploadBtn.addEventListener("click", async () => {
      try {
        setErr("");
        await openCloudinaryWidget();
        setOk("Image uploaded and Image URL filled.");
      } catch (e) {
        setErr(e.message || String(e));
      }
    });
  }

  const previewBtn = $("#btnPreviewImage");
  if (previewBtn) previewBtn.addEventListener("click", refreshImagePreview);

  const urlInput = $("#f_image_url");
  if (urlInput) urlInput.addEventListener("input", refreshImagePreview);

  refreshImagePreview();
}

function renderTable(datasetKey, rows) {
  const cfg = config[datasetKey];
  const cols = cfg.columns;

  $("#thead").innerHTML = `
    <tr>
      ${cols.map(([, label]) => `<th>${escapeHtml(label)}</th>`).join("")}
      <th>Actions</th>
    </tr>
  `;

  $("#tbody").innerHTML = rows.map((r) => `
    <tr>
      ${cols.map(([k]) => `<td>${escapeHtml(r[k])}</td>`).join("")}
      <td>
        <div class="actions">
          <button class="btn btn-sm btn-outline-primary" data-edit="${r.id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger" data-del="${r.id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");

  $("#tbody").querySelectorAll("button[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-edit"));
      const row = rows.find((x) => x.id === id);
      if (row) fillFormFromRow(datasetKey, row);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  $("#tbody").querySelectorAll("button[data-del]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        const id = Number(btn.getAttribute("data-del"));
        if (!confirm(`Delete id ${id}?`)) return;
        await adminRequest(cfg.write, "DELETE", { id });
        setOk(`Deleted id ${id}`);
        setErr("");
        await loadRows();
      } catch (e) {
        setErr(e.message || String(e));
      }
    });
  });
}

async function doWrite(method) {
  try {
    setOk(""); setErr("");

    const datasetKey = $("#dataset").value;
    const cfg = config[datasetKey];
    const payload = getPayload(datasetKey);

    if (cfg.seasonRequired && (payload.season_year == null || payload.season_year === "")) {
      throw new Error("season_year is required for this dataset.");
    }
    if ((method === "PUT" || method === "DELETE") && !payload.id) {
      throw new Error("id is required for Update/Delete.");
    }

    const result = await adminRequest(cfg.write, method, payload);
    setOk(`${method} OK`);
    await loadRows();
    return result;
  } catch (e) {
    setErr(e.message || String(e));
  }
}

async function loadRows() {
  try {
    setOk(""); setErr("");

    const datasetKey = $("#dataset").value;
    const cfg = config[datasetKey];

    let season = $("#seasonFilter").value;
    if (cfg.seasonRequired && !season) {
      season = new Date().getFullYear();
      $("#seasonFilter").value = season;
    }

    const rows = await fetchJson(cfg.read(season));
    buildForm(datasetKey);
    renderTable(datasetKey, rows);
    setOk(`Loaded ${rows.length} row(s).`);
  } catch (e) {
    setErr(e.message || String(e));
  }
}

(async function init() {
  $("#token").value = getToken();

  $("#saveToken").addEventListener("click", () => {
    setToken($("#token").value.trim());
    setOk("Token saved to sessionStorage.");
    setErr("");
  });

  $("#clearToken").addEventListener("click", () => {
    clearToken();
    $("#token").value = "";
    setOk("Token cleared.");
    setErr("");
  });

  const clearTop = $("#clearFormTop");
  if (clearTop) clearTop.addEventListener("click", clearForm);

  $("#dataset").addEventListener("change", () => {
    buildForm($("#dataset").value);
    $("#tbody").innerHTML = "";
    $("#thead").innerHTML = "";
  });

  $("#load").addEventListener("click", loadRows);

  await loadCloudinaryConfig();

  buildForm($("#dataset").value);
})();
