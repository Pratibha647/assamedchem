require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    require: true
  }
});

pool.on('connect', () => {
  console.log('Connected to Neon PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Unexpected DB error', err);
  process.exit(-1);
});

const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
