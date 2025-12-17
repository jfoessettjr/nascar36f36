const { neon } = require("@neondatabase/serverless");

function json(statusCode, data) {
  return { statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(data) };
}

exports.handler = async (event) => {
  try {
    const conn = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
    if (!conn) return json(500, { error: "Missing DB connection env var" });

    const qs = event.queryStringParameters || {};
    const season = parseInt((qs.season || "").trim(), 10);
    const sql = neon(conn);

    const rows = Number.isFinite(season)
      ? await sql`
          select id, season_year, race_num, race_name, track, location, winner, team, manufacturer, image_url, image_alt
          from nascar_winners
          where season_year = ${season}
          order by race_num nulls last, id
        `
      : await sql`
          select id, season_year, race_num, race_name, track, location, winner, team, manufacturer, image_url, image_alt
          from nascar_winners
          order by season_year desc, race_num nulls last, id
        `;

    return json(200, rows);
  } catch (err) {
    return json(500, { error: String(err) });
  }
};
