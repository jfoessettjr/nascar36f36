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
        insert into books (title, author, genre, year_published, format, notes)
        values (${b.title}, ${b.author}, ${b.genre}, ${b.year_published}, ${b.format}, ${b.notes})
        returning *
      `;
      return json(200, rows[0]);
    }

    if (method === "PUT") {
      const b = JSON.parse(event.body || "{}");
      if (!b.id) return json(400, { error: "Missing id" });

      const rows = await sql`
        update books
        set
          title = ${b.title},
          author = ${b.author},
          genre = ${b.genre},
          year_published = ${b.year_published},
          format = ${b.format},
          notes = ${b.notes}
        where id = ${b.id}
        returning *
      `;
      return json(200, rows[0] || null);
    }

    if (method === "DELETE") {
      const b = JSON.parse(event.body || "{}");
      if (!b.id) return json(400, { error: "Missing id" });

      const rows = await sql`delete from books where id = ${b.id} returning id`;
      return json(200, { deleted: rows[0]?.id ?? null });
    }

    return json(405, { error: "Method not allowed" });
  } catch (err) {
    return json(500, { error: String(err) });
  }
};
