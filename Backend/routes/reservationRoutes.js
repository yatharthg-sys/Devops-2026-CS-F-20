const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../utils/db');

// POST /api/reservations
router.post('/', (req, res) => {
  const { name, email, phone, guests, date, time, message } = req.body;
  if (!name || !email || !phone || !guests || !date || !time) {
    return res.status(400).json({ error: 'Name, email, phone, guests, date and time are required.' });
  }

  const reservation = {
    id: Date.now().toString(36).toUpperCase(),
    name, email, phone, guests, date, time, message: message || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const reservations = readDB('reservations');
  reservations.push(reservation);
  writeDB('reservations', reservations);

  res.status(201).json({ message: 'Reservation confirmed', reservation });
});

module.exports = router;