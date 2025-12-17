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
          select id, season_year, race_num, race_name, track, location, driver, finish_pos, points, notes
          from nascar_36
          where season_year = ${season}
          order by race_num nulls last, id
        `
      : await sql`
          select id, season_year, race_num, race_name, track, location, driver, finish_pos, points, notes
          from nascar_36
          order by season_year desc, race_num nulls last, id
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
