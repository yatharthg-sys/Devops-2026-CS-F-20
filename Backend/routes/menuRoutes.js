const express = require('express');
const router = express.Router();
const { readDB } = require('../utils/db');

// GET /api/menu
router.get('/', (req, res) => {
  const menu = readDB('menu');
  res.json(menu);
});

module.exports = router;