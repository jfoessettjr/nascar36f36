const { neon } = require("@neondatabase/serverless");

function json(statusCode, data) {
  return { statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(data) };
}

function isAuthed(event) {
  const h = event.headers || {};
  const token = h["x-admin-token"] || h["X-Admin-Token"];
  return token && process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
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
        insert into nascar_36
          (season_year, race_num, race_name, track, location, driver, finish_pos, points, notes, image_url, image_alt)
        values
          (${b.season_year}, ${b.race_num}, ${b.race_name}, ${b.track}, ${b.location}, ${b.driver},
           ${b.finish_pos}, ${b.points}, ${b.notes}, ${b.image_url}, ${b.image_alt})
        returning *
      `;
      return json(200, rows[0]);
    }

    if (method === "PUT") {
      const b = JSON.parse(event.body || "{}");
      if (!b.id) return json(400, { error: "Missing id" });

      const rows = await sql`
        update nascar_36
        set
          season_year = ${b.season_year},
          race_num = ${b.race_num},
          race_name = ${b.race_name},
          track = ${b.track},
          location = ${b.location},
          driver = ${b.driver},
          finish_pos = ${b.finish_pos},
          points = ${b.points},
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

      const rows = await sql`delete from nascar_36 where id = ${b.id} returning id`;
      return json(200, { deleted: rows[0]?.id ?? null });
    }

    return json(405, { error: "Method not allowed" });
  } catch (err) {
    return json(500, { error: String(err) });
  }
};
