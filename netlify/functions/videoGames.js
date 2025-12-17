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
      select id, title, platform, status, hours_played, rating, year_released, notes, image_url, image_alt
      from video_games
      order by title asc, id
    `;
    return json(200, rows);
  } catch (err) {
    return json(500, { error: String(err) });
  }
};
