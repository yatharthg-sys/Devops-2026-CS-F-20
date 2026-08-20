const express = require('express');
const cors = require('cors');
const path = require('path');

const menuRoutes = require('./routes/menuRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve the frontend folder too, so images/CSS/JS work when accessed via the backend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use('/api/menu', menuRoutes);
app.use('/api/reservations', reservationRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`🍽️  Shekhawat Dhaba backend running at http://localhost:${PORT}`);
});