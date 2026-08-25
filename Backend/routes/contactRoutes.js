const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../utils/db');

// POST /api/contact
router.post('/', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required.' });
  }

  const contact = {
    id: Date.now().toString(36).toUpperCase(),
    name, email, message,
    createdAt: new Date().toISOString()
  };

  const contacts = readDB('contacts');
  contacts.push(contact);
  writeDB('contacts', contacts);

  res.status(201).json({ message: 'Message received', contact });
});

module.exports = router;