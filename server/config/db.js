const { Pool, types } = require('pg');
require('dotenv').config();

// Return DATE columns as plain 'YYYY-MM-DD' strings, not JS Date objects.
// This prevents timezone-induced date shifts (e.g. April 9 becoming April 8 for UTC+ users).
// SQL date arithmetic and filtering still work perfectly on the database side.
types.setTypeParser(1082, val => val);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

module.exports = pool;