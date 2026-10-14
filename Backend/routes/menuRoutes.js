const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const { isMongoConnected } = require('../config/db');
const { readDB, writeDB } = require('../utils/db');
const { menuItemsGauge } = require('../utils/metrics');

// GET /api/menu - Retrieve all menu items (optional ?category=...)
router.get('/', async (req, res) => {
  const { category } = req.query;
  try {
    if (isMongoConnected()) {
      const query = category ? { category } : {};
      const items = await MenuItem.find(query).sort({ createdAt: -1 });
      if (!category) menuItemsGauge.set(items.length);
      return res.json(items);
    }

    const items = readDB('menu');
    if (!category) menuItemsGauge.set(items.length);
    if (category) {
      const filtered = items.filter(i => (i.category || 'thalis').toLowerCase() === category.toLowerCase());
      return res.json(filtered);
    }
    return res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menu items', details: err.message });
  }
});

// GET /api/menu/:id - Retrieve item by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isMongoConnected()) {
      const item = await MenuItem.findOne({ id });
      if (!item) return res.status(404).json({ error: 'Menu item not found' });
      return res.json(item);
    }

    const items = readDB('menu');
    const item = items.find(i => i.id === id);
    if (!item) return res.status(404).json({ error: 'Menu item not found' });
    return res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch item', details: err.message });
  }
});

// POST /api/menu - Create a new menu item
router.post('/', async (req, res) => {
  const { name, description, category, price, image } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Name and price are required.' });
  }

  const newItem = {
    id: 'm' + Date.now().toString(36),
    name,
    description: description || '',
    category: category || 'thalis',
    price: Number(price),
    image: image || '/assets/img/plate1.png',
    isAvailable: true
  };

  try {
    if (isMongoConnected()) {
      const created = await MenuItem.create(newItem);
      return res.status(201).json(created);
    }

    const items = readDB('menu');
    items.push(newItem);
    writeDB('menu', items);
    return res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create menu item', details: err.message });
  }
});

// PUT /api/menu/:id - Update an existing menu item
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    if (isMongoConnected()) {
      const updated = await MenuItem.findOneAndUpdate({ id }, { $set: updates }, { new: true });
      if (!updated) return res.status(404).json({ error: 'Menu item not found' });
      return res.json(updated);
    }

    const items = readDB('menu');
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return res.status(404).json({ error: 'Menu item not found' });

    items[index] = { ...items[index], ...updates };
    writeDB('menu', items);
    return res.json(items[index]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item', details: err.message });
  }
});

// DELETE /api/menu/:id - Remove a menu item
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isMongoConnected()) {
      const deleted = await MenuItem.findOneAndDelete({ id });
      if (!deleted) return res.status(404).json({ error: 'Menu item not found' });
      return res.json({ message: 'Menu item deleted successfully' });
    }

    const items = readDB('menu');
    const filtered = items.filter(i => i.id !== id);
    if (filtered.length === items.length) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    writeDB('menu', filtered);
    return res.json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item', details: err.message });
  }
});

module.exports = router;
