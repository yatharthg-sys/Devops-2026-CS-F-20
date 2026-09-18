const request = require('supertest');
const { app } = require('../server');

describe('Shekhawat Dhaba API & Health Endpoints', () => {
  it('GET /api/health should return status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('ok');
    expect(res.body.service).toEqual('shekhawat-dhaba-backend');
  });

  it('GET /api/metrics should return Prometheus metrics exposition format', async () => {
    const res = await request(app).get('/api/metrics');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('nodejs_');
    expect(res.text).toContain('shekhawat_http_requests_total');
  });

  it('GET /api/menu should return a non-empty list of menu items', async () => {
    const res = await request(app).get('/api/menu');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('POST /api/orders should reject request with missing customer fields', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        items: [{ id: 'm1', name: 'Dal Baati', price: 280, qty: 1 }]
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBeDefined();
  });

  it('POST /api/orders should create a new food order successfully', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        customer: {
          name: 'CI/CD Automated Test User',
          phone: '+91 9876543210',
          address: 'Lab 20, Department of Computer Science'
        },
        items: [
          { id: 'm1', name: 'Special Rajasthani Dal Baati Churma', price: 280, qty: 2 }
        ]
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.order).toBeDefined();
    expect(res.body.order.total).toEqual(560);
    expect(res.body.order.status).toEqual('received');
  });

  it('POST /api/reservations should successfully reserve a table', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .send({
        name: 'Test Guest',
        email: 'guest@dhaba.test',
        phone: '9876543210',
        guests: 4,
        date: '2026-11-01',
        time: '19:30',
        message: 'Window seat preferred'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.reservation).toBeDefined();
    expect(res.body.reservation.name).toEqual('Test Guest');
  });

  it('GET /api/reports/orders/export-csv should stream CSV data', async () => {
    const res = await request(app).get('/api/reports/orders/export-csv');
    expect(res.statusCode).toEqual(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('Order ID,Customer Name');
  });
});
