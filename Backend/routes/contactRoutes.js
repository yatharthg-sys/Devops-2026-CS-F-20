const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { isMongoConnected } = require('../config/db');
const { readDB, writeDB } = require('../utils/db');

// GET /api/contact - List contact messages
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const contacts = await Contact.find().sort({ createdAt: -1 });
      return res.json(contacts);
    }
    const contacts = readDB('contacts');
    return res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contacts', details: err.message });
  }
});

// POST /api/contact - Submit contact form
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required.' });
  }

  const contactData = {
    id: Date.now().toString(36).toUpperCase(),
    name,
    email,
    message,
    createdAt: new Date().toISOString()
  };

  try {
    let savedContact = contactData;
    if (isMongoConnected()) {
      const created = await Contact.create(contactData);
      savedContact = created.toObject();
    } else {
      const contacts = readDB('contacts');
      contacts.unshift(contactData);
      writeDB('contacts', contacts);
    }

    res.status(201).json({ message: 'Message received', contact: savedContact });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save message', details: err.message });
  }
});

module.exports = router;
