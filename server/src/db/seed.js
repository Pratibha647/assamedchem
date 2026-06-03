require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./index');

async function seed() {
  try {
    console.log('Clearing existing data...');
    // Delete existing data in dependency order
    await pool.query('DELETE FROM order_items');
    await pool.query('DELETE FROM orders');
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM users');

    console.log('Inserting seed users...');
    const adminHash = await bcrypt.hash('admin123', 10);
    const sellerHash = await bcrypt.hash('seller123', 10);

    await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
      ['Admin User', 'admin@aasa.com', adminHash, 'admin']
    );
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
      ['Seller One', 'seller@aasa.com', sellerHash, 'seller']
    );

    console.log('Inserting seed products...');
    const products = [
      { name: "Sodium Chloride", sku: "NACL001", description: "Lab grade NaCl", category: "Chemicals", base_unit: "g", base_price_per_unit: 0.05, stock_quantity: 10000 },
      { name: "Activated Carbon", sku: "ACTC001", description: "Activated carbon powder", category: "Chemicals", base_unit: "g", base_price_per_unit: 0.12, stock_quantity: 5000 },
      { name: "Ethanol 99%", sku: "ETH001", description: "High purity ethanol", category: "Solvents", base_unit: "mL", base_price_per_unit: 0.08, stock_quantity: 20000 },
      { name: "Hydrochloric Acid", sku: "HCL001", description: "Dilute HCl solution", category: "Acids", base_unit: "mL", base_price_per_unit: 0.15, stock_quantity: 10000 },
      { name: "Glass Beaker 250mL", sku: "BEK001", description: "Borosilicate glass beaker", category: "Glassware", base_unit: "item", base_price_per_unit: 180.00, stock_quantity: 50 },
      { name: "Petri Dish Set", sku: "PDH001", description: "Pack of 10 petri dishes", category: "Glassware", base_unit: "item", base_price_per_unit: 95.00, stock_quantity: 100 }
    ];

    for (const p of products) {
      await pool.query(
        'INSERT INTO products (name, sku, description, category, base_unit, base_price_per_unit, stock_quantity) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [p.name, p.sku, p.description, p.category, p.base_unit, p.base_price_per_unit, p.stock_quantity]
      );
    }

    console.log('Seeded successfully');
  } catch (error) {
    console.error('Error during database seeding:', error);
  } finally {
    await pool.end();
  }
}

seed();
