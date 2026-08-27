const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../utils/db');

// POST /api/orders
router.post('/', (req, res) => {
  const { customer, items } = req.body;

  if (!customer || !customer.name || !customer.phone || !customer.address) {
    return res.status(400).json({ error: 'Customer name, phone and address are required.' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty.' });
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const order = {
    id: Date.now().toString(36).toUpperCase(),
    customer,
    items,
    total,
    status: 'received',
    createdAt: new Date().toISOString()
  };

  const orders = readDB('orders');
  orders.push(order);
  writeDB('orders', orders);

  res.status(201).json({ message: 'Order placed successfully', order });
});

// GET /api/orders/:id
router.get('/:id', (req, res) => {
  const orders = readDB('orders');
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

module.exports = router;