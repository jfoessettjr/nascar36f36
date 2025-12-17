const { neon } = require("@neondatabase/serverless");

function json(statusCode, data) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  };
}

function isAuthed(event) {
  const token =
    event.headers?.["x-admin-token"] ||
    event.headers?.["X-Admin-Token"] ||
    event.headers?.["x-admin-token".toLowerCase()];

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
        insert into pga_winners (season_year, event_name, course, location, winner, score)
        values (${b.season_year}, ${b.event_name}, ${b.course}, ${b.location}, ${b.winner}, ${b.score})
        returning *
      `;
      return json(200, rows[0]);
    }

    if (method === "PUT") {
      const b = JSON.parse(event.body || "{}");
      if (!b.id) return json(400, { error: "Missing id" });

      const rows = await sql`
        update pga_winners
        set
          season_year = ${b.season_year},
          event_name = ${b.event_name},
          course = ${b.course},
          location = ${b.location},
          winner = ${b.winner},
          score = ${b.score}
        where id = ${b.id}
        returning *
      `;
      return json(200, rows[0] || null);
    }

    if (method === "DELETE") {
      const b = JSON.parse(event.body || "{}");
      if (!b.id) return json(400, { error: "Missing id" });

      const rows = await sql`delete from pga_winners where id = ${b.id} returning id`;
      return json(200, { deleted: rows[0]?.id ?? null });
    }

    return json(405, { error: "Method not allowed" });
  } catch (err) {
    return json(500, { error: String(err) });
  }
};
