const { neon } = require("@neondatabase/serverless");

function json(statusCode, data) {
  return { statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(data) };
}

exports.handler = async () => {
  try {
    const conn = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
    if (!conn) return json(500, { error: "Missing DB connection env var" });

    const sql = neon(conn);
    const rows = await sql`
      select id, artist, album, year_released, genre, label, condition, notes, image_url, image_alt
      from vinyl_records
      order by artist asc, album asc, id
    `;
    return json(200, rows);
  } catch (err) {
    return json(500, { error: String(err) });
  }
};
