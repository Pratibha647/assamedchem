const fs = require('fs');
const path = require('path');
const { pool } = require('./index');
require('dotenv').config();

async function initDB() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Initializing database schema...');
    await pool.query(sql);
    console.log('Database initialized successfully');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error during database initialization:', error);
    process.exit(1);
  }
}

initDB();
