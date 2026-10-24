const client = require('prom-client');

const register = new client.Registry();

// Enable default system metrics collection (CPU, Memory, Event Loop, GC)
client.collectDefaultMetrics({
  register,
  prefix: 'nodejs_'
});

/*=============================================================================
 * METRIC TYPES ACCORDING TO PROMETHEUS SPECIFICATION:
 * 1. Counter: Cumulative metric that only increases or resets to zero on restart
 * 2. Gauge: Metric that represents a single numerical value that can go up & down
 * 3. Histogram: Samples observations into configurable buckets
 * 4. Summary: Calculates configurable quantiles over a sliding time window
 *============================================================================*/

// 1. COUNTER: HTTP Requests
const httpRequestsTotal = new client.Counter({
  name: 'shekhawat_http_requests_total',
  help: 'Total number of HTTP requests processed by endpoint and status',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

// 1. COUNTER: Business Orders
const ordersPlacedTotal = new client.Counter({
  name: 'shekhawat_orders_total',
  help: 'Total number of customer food orders placed',
  labelNames: ['status'],
  registers: [register]
});

// 1. COUNTER: Business Table Reservations
const reservationsCreatedTotal = new client.Counter({
  name: 'shekhawat_reservations_total',
  help: 'Total number of table reservations submitted',
  labelNames: ['status'],
  registers: [register]
});

// 1. COUNTER: Cumulative Revenue (INR)
const orderRevenueTotal = new client.Counter({
  name: 'shekhawat_order_revenue_inr_total',
  help: 'Total cumulative revenue processed in INR',
  registers: [register]
});

// 2. GAUGE: Active WebSocket Connections
const activeSocketsGauge = new client.Gauge({
  name: 'shekhawat_active_ws_connections',
  help: 'Current number of active WebSocket / Socket.io clients connected',
  registers: [register]
});

// 2. GAUGE: Database Connection Status (1 = Connected to MongoDB, 0 = Local JSON Fallback)
const dbConnectionGauge = new client.Gauge({
  name: 'shekhawat_database_connected',
  help: 'Database connectivity status: 1 if connected to MongoDB, 0 if in local JSON fallback mode',
  registers: [register]
});

// 2. GAUGE: Catalog Menu Items Count
const menuItemsGauge = new client.Gauge({
  name: 'shekhawat_menu_items_count',
  help: 'Total active menu items in catalog',
  registers: [register]
});

// 3. HISTOGRAM: Request Latency in Seconds
const httpRequestDurationSeconds = new client.Histogram({
  name: 'shekhawat_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds for latency analysis',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register]
});

// 4. SUMMARY: Order Value Distribution (Quantiles: 50th, 90th, 99th percentile)
const orderValueSummary = new client.Summary({
  name: 'shekhawat_order_value_summary',
  help: 'Summary of customer order values (₹) with quantiles',
  percentiles: [0.5, 0.9, 0.99],
  registers: [register]
});

// Initialize zero-state so metrics are immediately present on boot
ordersPlacedTotal.inc({ status: 'received' }, 0);
ordersPlacedTotal.inc({ status: 'delivered' }, 0);
reservationsCreatedTotal.inc({ status: 'pending' }, 0);
reservationsCreatedTotal.inc({ status: 'confirmed' }, 0);
orderRevenueTotal.inc(0);
activeSocketsGauge.set(0);
dbConnectionGauge.set(0);
menuItemsGauge.set(7);

// Middleware to measure HTTP request rate and latency
function metricsMiddleware(req, res, next) {
  if (req.path === '/api/metrics' || req.path === '/api/health') {
    return next();
  }

  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / 1e9;
    const route = req.baseUrl + (req.route ? req.route.path : req.path) || req.path;
    const status = res.statusCode.toString();

    httpRequestsTotal.inc({ method: req.method, route, status });
    httpRequestDurationSeconds.observe({ method: req.method, route, status }, duration);
  });

  next();
}

module.exports = {
  register,
  metricsMiddleware,
  httpRequestsTotal,
  httpRequestDurationSeconds,
  ordersPlacedTotal,
  reservationsCreatedTotal,
  orderRevenueTotal,
  activeSocketsGauge,
  dbConnectionGauge,
  menuItemsGauge,
  orderValueSummary
};
