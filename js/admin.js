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

function setOk(msg) { $("#messages").textContent = msg || ""; }
function setErr(msg) { $("#error").textContent = msg || ""; }

function getToken() { return sessionStorage.getItem("ADMIN_TOKEN") || ""; }
function setToken(t) { sessionStorage.setItem("ADMIN_TOKEN", t); }
function clearToken() { sessionStorage.removeItem("ADMIN_TOKEN"); }

async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`GET failed (${res.status})`);
  return res.json();
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

const config = {
  nascar36: {
    read: (season) => `/.netlify/functions/nascar36?season=${encodeURIComponent(season || "")}`,
    write: "/.netlify/functions/nascar36Admin",
    columns: [
      ["id", "ID"],
      ["season_year", "Season"],
      ["race_num", "Race #"],
      ["race_name", "Race"],
      ["track", "Track"],
      ["location", "Location"],
      ["driver", "Driver"],
      ["finish_pos", "Finish"],
      ["points", "Points"],
      ["notes", "Notes"],
      ["image_url", "Image URL"],
      ["image_alt", "Image Alt"],
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
      ["id", "ID"],
      ["title", "Title"],
      ["author", "Author"],
      ["genre", "Genre"],
      ["year_published", "Year"],
      ["format", "Format"],
      ["notes", "Notes"],
      ["image_url", "Image URL"],
      ["image_alt", "Image Alt"],
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
};

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

  $("#formArea").innerHTML = `
    <div class="card-lite">
      <h3 class="h5 mb-3">Add / Edit</h3>

      <div class="form-grid">
        ${fieldsHtml}
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
}

function getFormValue(key, type) {
  const el = $(`#f_${key}`);
  if (!el) return null;
  const raw = el.value;

  if (type === "number") {
    if (raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
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
  for (const [key] of cfg.formFields) {
    const el = $(`#f_${key}`);
    if (!el) continue;
    el.value = row[key] == null ? "" : String(row[key]);
  }
}

function clearForm() {
  const datasetKey = $("#dataset").value;
  const cfg = config[datasetKey];
  for (const [key] of cfg.formFields) {
    const el = $(`#f_${key}`);
    if (el) el.value = "";
  }
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
    setOk(`${method} OK: ${JSON.stringify(result)}`);
    await loadRows();
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

(function init() {
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
  buildForm($("#dataset").value);
})();
