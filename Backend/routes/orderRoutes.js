const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { isMongoConnected } = require('../config/db');
const { readDB, writeDB } = require('../utils/db');
const { emitNewOrder, emitOrderStatusUpdated } = require('../utils/socket');
const { ordersPlacedTotal, orderRevenueTotal, orderValueSummary } = require('../utils/metrics');

// GET /api/orders - List all orders
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const orders = await Order.find().sort({ createdAt: -1 });
      return res.json(orders);
    }
    const orders = readDB('orders');
    return res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
});

// GET /api/orders/:id - Retrieve order by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isMongoConnected()) {
      const order = await Order.findOne({ id });
      if (!order) return res.status(404).json({ error: 'Order not found' });
      return res.json(order);
    }
    const orders = readDB('orders');
    const order = orders.find(o => o.id === id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order', details: err.message });
  }
});

// POST /api/orders - Place a new order
router.post('/', async (req, res) => {
  const { customer, items } = req.body;

  if (!customer || !customer.name || !customer.phone || !customer.address) {
    return res.status(400).json({ error: 'Customer name, phone and address are required.' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty.' });
  }

  const total = items.reduce((sum, i) => sum + Number(i.price) * Number(i.qty), 0);

  const orderData = {
    id: Date.now().toString(36).toUpperCase(),
    customer,
    items,
    total,
    status: 'received',
    createdAt: new Date().toISOString()
  };

  try {
    let savedOrder = orderData;
    if (isMongoConnected()) {
      const created = await Order.create(orderData);
      savedOrder = created.toObject();
    } else {
      const orders = readDB('orders');
      orders.unshift(orderData);
      writeDB('orders', orders);
    }

    // Prometheus metric updates (Counter, Summary)
    ordersPlacedTotal.inc({ status: 'received' });
    orderRevenueTotal.inc(total);
    orderValueSummary.observe(total);

    // Real-time WebSocket event emission
    emitNewOrder(savedOrder);

    res.status(201).json({ message: 'Order placed successfully', order: savedOrder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order', details: err.message });
  }
});

// PATCH /api/orders/:id/status - Update order fulfillment status
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['received', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    let updatedOrder = null;
    if (isMongoConnected()) {
      updatedOrder = await Order.findOneAndUpdate({ id }, { $set: { status } }, { new: true });
      if (!updatedOrder) return res.status(404).json({ error: 'Order not found' });
      updatedOrder = updatedOrder.toObject();
    } else {
      const orders = readDB('orders');
      const index = orders.findIndex(o => o.id === id);
      if (index === -1) return res.status(404).json({ error: 'Order not found' });
      orders[index].status = status;
      writeDB('orders', orders);
      updatedOrder = orders[index];
    }

    // Broadcast real-time update
    emitOrderStatusUpdated(updatedOrder);

    res.json({ message: 'Order status updated', order: updatedOrder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status', details: err.message });
  }
});

// DELETE /api/orders/:id - Cancel or delete order
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isMongoConnected()) {
      const deleted = await Order.findOneAndDelete({ id });
      if (!deleted) return res.status(404).json({ error: 'Order not found' });
      return res.json({ message: 'Order deleted successfully' });
    }

    const orders = readDB('orders');
    const filtered = orders.filter(o => o.id !== id);
    if (filtered.length === orders.length) {
      return res.status(404).json({ error: 'Order not found' });
    }
    writeDB('orders', filtered);
    return res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order', details: err.message });
  }
});

module.exports = router;
