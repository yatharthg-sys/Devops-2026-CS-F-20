const express = require('express');
const { Readable } = require('stream');
const router = express.Router();
const { readDB } = require('../utils/db');
const Order = require('../models/Order');
const { isMongoConnected } = require('../config/db');

// GET /api/reports/orders/export-csv - Streams order data as CSV
router.get('/orders/export-csv', async (req, res) => {
  try {
    let orders = [];
    if (isMongoConnected()) {
      orders = await Order.find().lean();
    } else {
      orders = readDB('orders');
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="orders-report.csv"');

    // Create a readable stream from orders array
    const csvHeader = 'Order ID,Customer Name,Phone,Address,Total,Status,Created At\n';
    
    function* generateCSVLines() {
      yield csvHeader;
      for (const order of orders) {
        const name = (order.customer && order.customer.name) || '';
        const phone = (order.customer && order.customer.phone) || '';
        const address = ((order.customer && order.customer.address) || '').replace(/"/g, '""');
        yield `"${order.id}","${name}","${phone}","${address}",${order.total},"${order.status}","${order.createdAt}"\n`;
      }
    }

    const orderStream = Readable.from(generateCSVLines());
    orderStream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: 'Failed to stream orders report', details: err.message });
  }
});

module.exports = router;
