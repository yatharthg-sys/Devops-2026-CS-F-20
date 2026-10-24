require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const { connectDB } = require('./config/db');
const { initSocket } = require('./utils/socket');
const { register, metricsMiddleware } = require('./utils/metrics');
const { requestLogger } = require('./middleware/logger');

const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const contactRoutes = require('./routes/contactRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// Initialize real-time WebSockets
initSocket(io);

// Connect to MongoDB (hybrid fallback enabled)
if (process.env.NODE_ENV !== 'test' || process.env.MONGODB_URI) {
  connectDB();
}

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(metricsMiddleware);

// Serve Frontend static assets
app.use(express.static(path.join(__dirname, '..', 'Frontend')));

// Prometheus Metrics Endpoint
app.get('/api/metrics', async (req, res) => {
  try {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Health check endpoint (for Docker / Kubernetes liveness & readiness)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'shekhawat-dhaba-backend'
  });
});

// RESTful API Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reports', reportRoutes);

// Centralized error-handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🍽️  Shekhawat Dhaba server running at http://localhost:${PORT}`);
    console.log(`📊 Prometheus Metrics available at http://localhost:${PORT}/api/metrics`);
  });
}

module.exports = { app, server };
