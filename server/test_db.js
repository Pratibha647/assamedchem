const { Client } = require('pg');
require('dotenv').config();

async function main() {
  console.log('Testing connection from server directory...');
  
  // Try default client connection
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Successfully connected!');
    const res = await client.query('SELECT NOW()');
    console.log('Query result:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

main();
