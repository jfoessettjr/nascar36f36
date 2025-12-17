const { neon } = require("@neondatabase/serverless");

function isAuthed(event) {
  const token = event.headers?.["x-admin-token"] || event.headers?.["X-Admin-Token"];
  return token && process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
}

function json(statusCode, data) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  };
}

exports.handler = async (event) => {
  try {
    if (!process.env.DATABASE_URL) return json(500, { error: "Missing DATABASE_URL" });
    if (!process.env.ADMIN_TOKEN) return json(500, { error: "Missing ADMIN_TOKEN" });
    if (!isAuthed(event)) return json(401, { error: "Unauthorized" });

    const sql = neon(process.env.DATABASE_URL);
    const method = event.httpMethod;

    if (method === "POST") {
      const b = JSON.parse(event.body || "{}");
      const rows = await sql`
        insert into nascar_winners (season_year, race_num, race_name, track, location, winner, team, manufacturer)
        values (
          ${b.season_year}, ${b.race_num}, ${b.race_name}, ${b.track}, ${b.location},
          ${b.winner}, ${b.team}, ${b.manufacturer}
        )
        returning *
      `;
      return json(200, rows[0]);
    }

    if (method === "PUT") {
      const b = JSON.parse(event.body || "{}");
      if (!b.id) return json(400, { error: "Missing id" });

      const rows = await sql`
        update nascar_winners
        set
          season_year = ${b.season_year},
          race_num = ${b.race_num},
          race_name = ${b.race_name},
          track = ${b.track},
          location = ${b.location},
          winner = ${b.winner},
          team = ${b.team},
          manufacturer = ${b.manufacturer}
        where id = ${b.id}
        returning *
      `;
      return json(200, rows[0] || null);
    }

    if (method === "DELETE") {
      const b = JSON.parse(event.body || "{}");
      if (!b.id) return json(400, { error: "Missing id" });

      const rows = await sql`delete from nascar_winners where id = ${b.id} returning id`;
      return json(200, { deleted: rows[0]?.id ?? null });
    }

    return json(405, { error: "Method not allowed" });
  } catch (err) {
    return json(500, { error: String(err) });
  }
};
