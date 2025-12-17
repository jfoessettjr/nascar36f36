const { neon } = require("@neondatabase/serverless");

exports.handler = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      return { statusCode: 500, body: "Missing DATABASE_URL" };
    }

    const sql = neon(process.env.DATABASE_URL);

    const rows = await sql`
      select id, title, author, genre, year_published, format, notes
      from books
      order by title asc, id
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
