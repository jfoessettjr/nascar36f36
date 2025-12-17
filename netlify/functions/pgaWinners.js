const { neon } = require("@neondatabase/serverless");

exports.handler = async (event) => {
  try {
    if (!process.env.DATABASE_URL) {
      return { statusCode: 500, body: "Missing DATABASE_URL" };
    }

    const qs = event.queryStringParameters || {};
    const season = parseInt((qs.season || "").trim(), 10);

    const sql = neon(process.env.DATABASE_URL);

    const rows = Number.isFinite(season)
      ? await sql`
          select id, season_year, event_name, course, location, winner, score
          from pga_winners
          where season_year = ${season}
          order by event_name asc, id
        `
      : await sql`
          select id, season_year, event_name, course, location, winner, score
          from pga_winners
          order by season_year desc, event_name asc, id
        `;

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(rows),
    };
  } catch (err) {
    return { statusCode: 500, body: String(err) };
  }
};
