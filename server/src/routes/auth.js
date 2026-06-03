const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query } = require('../db/index');
const { verifyToken } = require('../middleware/auth');

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Query users table for email
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Sign JWT
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'aasa_medchem_super_secret_2024',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      token,
      user: payload
    });
  } catch (error) {
    console.error('Error in /login:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if email already exists
    const emailCheck = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const role = 'seller'; // Role is always 'seller'

    // Insert user into DB
    const insertResult = await query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, passwordHash, role]
    );

    const newUser = insertResult.rows[0];

    return res.status(201).json({
      message: 'Account created',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Error in /register:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /me
router.get('/me', verifyToken, async (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.error('Error in /me:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
