const { neon } = require("@neondatabase/serverless");

function json(statusCode, data) {
  return { statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(data) };
}

function isAuthed(event) {
  const h = event.headers || {};
  const token = (h["x-admin-token"] || h["X-Admin-Token"] || "").trim();
  const expected = (process.env.ADMIN_TOKEN || "").trim();
  return token && expected && token === expected;
}

exports.handler = async (event) => {
  try {
    const conn = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
    if (!conn) return json(500, { error: "Missing DB connection env var" });
    if (!process.env.ADMIN_TOKEN) return json(500, { error: "Missing ADMIN_TOKEN" });
    if (!isAuthed(event)) return json(401, { error: "Unauthorized" });

    const sql = neon(conn);
    const method = event.httpMethod;

    if (method === "POST") {
      const b = JSON.parse(event.body || "{}");
      const rows = await sql`
        insert into vinyl_records (artist, album, year_released, genre, label, condition, notes, image_url, image_alt)
        values (${b.artist}, ${b.album}, ${b.year_released}, ${b.genre}, ${b.label}, ${b.condition}, ${b.notes}, ${b.image_url}, ${b.image_alt})
        returning *
      `;
      return json(200, rows[0]);
    }

    if (method === "PUT") {
      const b = JSON.parse(event.body || "{}");
      if (!b.id) return json(400, { error: "Missing id" });

      const rows = await sql`
        update vinyl_records
        set
          artist = ${b.artist},
          album = ${b.album},
          year_released = ${b.year_released},
          genre = ${b.genre},
          label = ${b.label},
          condition = ${b.condition},
          notes = ${b.notes},
          image_url = ${b.image_url},
          image_alt = ${b.image_alt}
        where id = ${b.id}
        returning *
      `;
      return json(200, rows[0] || null);
    }

    if (method === "DELETE") {
      const b = JSON.parse(event.body || "{}");
      if (!b.id) return json(400, { error: "Missing id" });

      const rows = await sql`delete from vinyl_records where id = ${b.id} returning id`;
      return json(200, { deleted: rows[0]?.id ?? null });
    }

    return json(405, { error: "Method not allowed" });
  } catch (err) {
    return json(500, { error: String(err) });
  }
};
