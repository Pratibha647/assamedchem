const express = require('express');
const router = express.Router();
const { pool, query } = require('../db/index');
const { verifyToken, requireRole } = require('../middleware/auth');
const { calculateLineTotal, getCompatibleUnits } = require('../lib/units');

// ROUTE 1: POST /
// Protected: verifyToken + requireRole('seller')
router.post('/', verifyToken, requireRole('seller'), async (req, res) => {
  const { notes, items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'items array must exist and not be empty' });
  }

  const client = await pool.connect();

  try {
    const processedItems = [];
    let total_amount_inr = 0;

    // First validate all products and quantities
    for (const item of items) {
      const { product_id, ordered_unit, ordered_quantity } = item;

      if (!product_id || !ordered_unit || ordered_quantity === undefined || Number(ordered_quantity) <= 0) {
        await client.release(); // release client before return
        return res.status(400).json({ message: 'Invalid item parameters. product_id, ordered_unit, and positive ordered_quantity are required.' });
      }

      // Query product using transaction client
      const prodResult = await client.query('SELECT * FROM products WHERE id = $1', [product_id]);
      const product = prodResult.rows[0];

      if (!product) {
        await client.release();
        return res.status(400).json({ message: `Product not found: ${product_id}` });
      }

      // Validate compatibility
      const compatibleUnits = getCompatibleUnits(product.base_unit);
      if (!compatibleUnits.includes(ordered_unit)) {
        await client.release();
        return res.status(400).json({ message: `Unit ${ordered_unit} not compatible with product ${product.name}` });
      }

      // Calculate line total
      const { baseQuantity, unitPrice, lineTotal } = calculateLineTotal(
        Number(ordered_quantity),
        ordered_unit,
        Number(product.base_price_per_unit)
      );

      total_amount_inr += lineTotal;

      processedItems.push({
        product_id,
        product_name: product.name,
        ordered_unit,
        ordered_quantity: Number(ordered_quantity),
        base_quantity: baseQuantity,
        unit_price_inr: unitPrice,
        line_total_inr: lineTotal
      });
    }

    // Begin database transaction
    await client.query('BEGIN');

    // 1. Insert order
    const orderInsertResult = await client.query(
      `INSERT INTO orders (seller_id, total_amount_inr, notes, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
      [req.user.id, total_amount_inr, notes || null]
    );
    const newOrder = orderInsertResult.rows[0];

    // 2. Insert order items
    for (const item of processedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, ordered_unit, ordered_quantity, base_quantity, unit_price_inr, line_total_inr)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          newOrder.id,
          item.product_id,
          item.ordered_unit,
          item.ordered_quantity,
          item.base_quantity,
          item.unit_price_inr,
          item.line_total_inr
        ]
      );
    }

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Order placed successfully',
      order: {
        id: newOrder.id,
        seller_id: newOrder.seller_id,
        status: newOrder.status,
        total_amount_inr: newOrder.total_amount_inr,
        notes: newOrder.notes,
        created_at: newOrder.created_at,
        items: processedItems
      }
    });

  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rbError) {
      console.error('Rollback failed:', rbError);
    }
    console.error('Error in POST /orders:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ROUTE 2: GET /mine
// Protected: verifyToken + requireRole('seller')
router.get('/mine', verifyToken, requireRole('seller'), async (req, res) => {
  try {
    const ordersResult = await query(
      'SELECT * FROM orders WHERE seller_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    const orders = ordersResult.rows;

    for (const order of orders) {
      const itemsResult = await query(
        `SELECT oi.*, p.name as product_name, p.base_unit
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = $1`,
        [order.id]
      );
      order.items = itemsResult.rows;
    }

    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error in GET /orders/mine:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ROUTE 3: GET /all
// Protected: verifyToken + requireRole('admin')
router.get('/all', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const ordersResult = await query(
      `SELECT o.*, u.name as seller_name, u.email as seller_email
       FROM orders o
       JOIN users u ON o.seller_id = u.id
       ORDER BY o.created_at DESC`
    );
    const orders = ordersResult.rows;

    for (const order of orders) {
      const itemsResult = await query(
        `SELECT oi.*, p.name as product_name, p.base_unit
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = $1`,
        [order.id]
      );
      order.items = itemsResult.rows;
    }

    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error in GET /orders/all:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ROUTE 4: PUT /:id/status
// Protected: verifyToken + requireRole('admin')
router.put('/:id/status', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'confirmed' or 'rejected'" });
    }

    // Check if order exists
    const checkOrder = await query('SELECT * FROM orders WHERE id = $1', [id]);
    if (checkOrder.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const result = await query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error in PUT /orders/:id/status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
