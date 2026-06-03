const express = require('express');
const router = express.Router();
const { query } = require('../db/index');
const { verifyToken, requireRole } = require('../middleware/auth');
const { getCompatibleUnits, getPricePerUnit } = require('../lib/units');

// ROUTE 1: GET /
// Protected: verifyToken (both roles can access)
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM products ORDER BY name ASC');
    const products = result.rows.map(product => ({
      ...product,
      compatible_units: getCompatibleUnits(product.base_unit)
    }));
    return res.status(200).json(products);
  } catch (error) {
    console.error('Error in GET /products:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ROUTE 2: GET /search
// Protected: verifyToken
router.get('/search', verifyToken, async (req, res) => {
  try {
    const { q, category } = req.query;
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (q) {
      params.push(`%${q}%`);
      sql += ` AND (name ILIKE $${params.length} OR sku ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }

    if (category) {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    sql += ' ORDER BY name ASC';

    const result = await query(sql, params);
    const products = result.rows.map(product => ({
      ...product,
      compatible_units: getCompatibleUnits(product.base_unit)
    }));

    return res.status(200).json(products);
  } catch (error) {
    console.error('Error in GET /products/search:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ROUTE 3: GET /:id
// Protected: verifyToken
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM products WHERE id = $1', [id]);
    const product = result.rows[0];

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const compatible_units = getCompatibleUnits(product.base_unit);
    const prices_by_unit = {};

    compatible_units.forEach(unit => {
      prices_by_unit[unit] = getPricePerUnit(Number(product.base_price_per_unit), unit);
    });

    return res.status(200).json({
      ...product,
      compatible_units,
      prices_by_unit
    });
  } catch (error) {
    console.error('Error in GET /products/:id:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ROUTE 4: POST /
// Protected: verifyToken + requireRole('admin')
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, sku, description, category, base_unit, base_price_per_unit, stock_quantity } = req.body;

    // Validate required fields
    if (!name || !base_unit || base_price_per_unit === undefined) {
      return res.status(400).json({ message: 'name, base_unit, and base_price_per_unit are required' });
    }

    // Validate base_unit
    if (!['g', 'mL', 'item'].includes(base_unit)) {
      return res.status(400).json({ message: "Invalid base_unit. Must be one of: 'g', 'mL', 'item'" });
    }

    // Validate price
    if (Number(base_price_per_unit) <= 0) {
      return res.status(400).json({ message: 'base_price_per_unit must be greater than 0' });
    }

    const result = await query(
      `INSERT INTO products (name, sku, description, category, base_unit, base_price_per_unit, stock_quantity)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        name,
        sku || null,
        description || null,
        category || null,
        base_unit,
        base_price_per_unit,
        stock_quantity || 0
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error in POST /products:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ROUTE 5: PUT /:id
// Protected: verifyToken + requireRole('admin')
router.put('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, description, category, base_unit, base_price_per_unit, stock_quantity } = req.body;

    // Validate base_unit if provided
    if (base_unit !== undefined && !['g', 'mL', 'item'].includes(base_unit)) {
      return res.status(400).json({ message: "Invalid base_unit. Must be one of: 'g', 'mL', 'item'" });
    }

    // Validate price if provided
    if (base_price_per_unit !== undefined && Number(base_price_per_unit) <= 0) {
      return res.status(400).json({ message: 'base_price_per_unit must be greater than 0' });
    }

    // Check if product exists first
    const checkProduct = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (checkProduct.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updates = [];
    const params = [];

    const addUpdate = (field, value) => {
      if (value !== undefined) {
        params.push(value);
        updates.push(`${field} = $${params.length}`);
      }
    };

    addUpdate('name', name);
    addUpdate('sku', sku);
    addUpdate('description', description);
    addUpdate('category', category);
    addUpdate('base_unit', base_unit);
    addUpdate('base_price_per_unit', base_price_per_unit);
    addUpdate('stock_quantity', stock_quantity);

    if (updates.length === 0) {
      return res.status(200).json(checkProduct.rows[0]);
    }

    params.push(id);
    const sql = `UPDATE products SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`;
    const result = await query(sql, params);

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error in PUT /products/:id:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ROUTE 6: DELETE /:id
// Protected: verifyToken + requireRole('admin')
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const checkProduct = await query('SELECT id FROM products WHERE id = $1', [id]);
    if (checkProduct.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await query('DELETE FROM products WHERE id = $1', [id]);
    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /products/:id:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
