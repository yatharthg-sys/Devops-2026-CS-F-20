let ioInstance = null;
const { activeSocketsGauge } = require('./metrics');

function initSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    activeSocketsGauge.inc();
    console.log(`⚡ WebSocket client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      activeSocketsGauge.dec();
      console.log(`🔌 WebSocket client disconnected: ${socket.id}`);
    });

    // Handle real-time table reservation ping or order tracking subscriptions
    socket.on('join:order', (orderId) => {
      socket.join(`order:${orderId}`);
    });
  });
}

function getIO() {
  return ioInstance;
}

function emitNewOrder(order) {
  if (ioInstance) {
    ioInstance.emit('order:created', order);
  }
}

function emitOrderStatusUpdated(order) {
  if (ioInstance) {
    ioInstance.emit('order:updated', order);
    ioInstance.to(`order:${order.id}`).emit('order:status_changed', order);
  }
}

function emitNewReservation(reservation) {
  if (ioInstance) {
    ioInstance.emit('reservation:created', reservation);
  }
}

module.exports = {
  initSocket,
  getIO,
  emitNewOrder,
  emitOrderStatusUpdated,
  emitNewReservation
};
