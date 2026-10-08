const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const { isMongoConnected } = require('../config/db');
const { readDB, writeDB } = require('../utils/db');
const { emitNewReservation } = require('../utils/socket');
const { reservationsCreatedTotal } = require('../utils/metrics');

// GET /api/reservations - Retrieve all table reservations
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const reservations = await Reservation.find().sort({ createdAt: -1 });
      return res.json(reservations);
    }
    const reservations = readDB('reservations');
    return res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reservations', details: err.message });
  }
});

// GET /api/reservations/:id - Retrieve reservation by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isMongoConnected()) {
      const resv = await Reservation.findOne({ id });
      if (!resv) return res.status(404).json({ error: 'Reservation not found' });
      return res.json(resv);
    }
    const reservations = readDB('reservations');
    const resv = reservations.find(r => r.id === id);
    if (!resv) return res.status(404).json({ error: 'Reservation not found' });
    return res.json(resv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reservation', details: err.message });
  }
});

// POST /api/reservations - Create a new table reservation
router.post('/', async (req, res) => {
  const { name, email, phone, guests, date, time, message } = req.body;
  if (!name || !email || !phone || !guests || !date || !time) {
    return res.status(400).json({ error: 'Name, email, phone, guests, date and time are required.' });
  }

  const reservationData = {
    id: Date.now().toString(36).toUpperCase(),
    name,
    email,
    phone,
    guests: Number(guests),
    date,
    time,
    message: message || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  try {
    let savedReservation = reservationData;
    if (isMongoConnected()) {
      const created = await Reservation.create(reservationData);
      savedReservation = created.toObject();
    } else {
      const reservations = readDB('reservations');
      reservations.unshift(reservationData);
      writeDB('reservations', reservations);
    }

    // Prometheus metric increment
    reservationsCreatedTotal.inc({ status: 'pending' });

    // Real-time WebSocket emission
    emitNewReservation(savedReservation);

    res.status(201).json({ message: 'Reservation confirmed', reservation: savedReservation });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create reservation', details: err.message });
  }
});

// PATCH /api/reservations/:id/status - Update reservation status
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'seated', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    let updated = null;
    if (isMongoConnected()) {
      updated = await Reservation.findOneAndUpdate({ id }, { $set: { status } }, { new: true });
      if (!updated) return res.status(404).json({ error: 'Reservation not found' });
      updated = updated.toObject();
    } else {
      const reservations = readDB('reservations');
      const idx = reservations.findIndex(r => r.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Reservation not found' });
      reservations[idx].status = status;
      writeDB('reservations', reservations);
      updated = reservations[idx];
    }

    res.json({ message: 'Reservation status updated', reservation: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update reservation', details: err.message });
  }
});

// DELETE /api/reservations/:id - Remove reservation
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isMongoConnected()) {
      const deleted = await Reservation.findOneAndDelete({ id });
      if (!deleted) return res.status(404).json({ error: 'Reservation not found' });
      return res.json({ message: 'Reservation deleted successfully' });
    }

    const reservations = readDB('reservations');
    const filtered = reservations.filter(r => r.id !== id);
    if (filtered.length === reservations.length) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    writeDB('reservations', filtered);
    return res.json({ message: 'Reservation deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete reservation', details: err.message });
  }
});

module.exports = router;
