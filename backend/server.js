const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const client_prom = require('prom-client');

const PORT = process.env.PORT || 3000;
const MONGO_USER = process.env.MONGO_USER || 'admin';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || 'admin';
const MONGO_HOST = process.env.MONGO_HOST || 'localhost';
const MONGO_PORT = process.env.MONGO_PORT || '27017';
const MONGO_DB = process.env.MONGO_DB || 'ecommerce';

const MONGO_URI = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/?authSource=admin`;

// ---------- Metriques Prometheus (bonus observabilite) ----------
const register = new client_prom.Registry();
register.setDefaultLabels({ app: 'ecommerce-backend' });
client_prom.collectDefaultMetrics({ register });

const httpRequests = new client_prom.Counter({
  name: 'ecommerce_http_requests_total',
  help: 'Nombre total de requetes HTTP',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});
const httpDuration = new client_prom.Histogram({
  name: 'ecommerce_http_request_duration_seconds',
  help: 'Duree des requetes HTTP en secondes',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register]
});
const ordersTotal = new client_prom.Counter({
  name: 'ecommerce_orders_total',
  help: 'Nombre total de commandes passees',
  registers: [register]
});
const productsGauge = new client_prom.Gauge({
  name: 'ecommerce_products_count',
  help: 'Nombre de produits au catalogue',
  registers: [register]
});

const app = express();
app.use(cors());
app.use(express.json());

// Middleware de mesure des requetes
app.use((req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('finish', () => {
    const route = req.route ? req.baseUrl + req.route.path : req.path;
    const labels = { method: req.method, route, status: res.statusCode };
    httpRequests.inc(labels);
    end(labels);
  });
  next();
});

let db;
let productsCol;
let ordersCol;

const seedProducts = [
  { sku: 'P-001', name: 'Casque audio sans-fil',  price: 79.99,  stock: 25, image: 'https://picsum.photos/seed/headphones/300' },
  { sku: 'P-002', name: 'Clavier mecanique RGB',   price: 119.50, stock: 12, image: 'https://picsum.photos/seed/keyboard/300' },
  { sku: 'P-003', name: 'Souris ergonomique',      price: 39.90,  stock: 40, image: 'https://picsum.photos/seed/mouse/300' },
  { sku: 'P-004', name: 'Ecran 27 pouces 144Hz',   price: 299.00, stock: 8,  image: 'https://picsum.photos/seed/monitor/300' },
  { sku: 'P-005', name: 'Webcam Full HD',          price: 59.00,  stock: 18, image: 'https://picsum.photos/seed/webcam/300' },
  { sku: 'P-006', name: 'Chaise gaming',           price: 219.00, stock: 5,  image: 'https://picsum.photos/seed/chair/300' }
];

async function connectWithRetry() {
  const maxAttempts = 30;
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
      await client.connect();
      db = client.db(MONGO_DB);
      productsCol = db.collection('products');
      ordersCol = db.collection('orders');
      console.log(`[backend] Connecte a MongoDB (${MONGO_HOST}:${MONGO_PORT})`);
      return;
    } catch (err) {
      console.log(`[backend] Tentative ${i}/${maxAttempts} echouee: ${err.message}`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error('Impossible de joindre MongoDB');
}

async function seedIfEmpty() {
  const count = await productsCol.countDocuments();
  if (count === 0) {
    await productsCol.insertMany(seedProducts);
    console.log(`[backend] ${seedProducts.length} produits inseres (seed initial)`);
  } else {
    console.log(`[backend] ${count} produits deja presents, pas de seed`);
  }
  productsGauge.set(await productsCol.countDocuments());
}

// ---------- Endpoints ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: db ? 'connected' : 'down', timestamp: new Date().toISOString() });
});

// Endpoint scrape par Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await productsCol.find({}).toArray();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { items, customer } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items requis' });
    }
    const total = items.reduce((s, it) => s + (it.price * it.qty), 0);
    const order = {
      items,
      customer: customer || 'anonyme',
      total: Math.round(total * 100) / 100,
      createdAt: new Date()
    };
    const result = await ordersCol.insertOne(order);
    ordersTotal.inc();
    res.status(201).json({ id: result.insertedId, ...order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await ordersCol.find({}).sort({ createdAt: -1 }).limit(50).toArray();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

(async () => {
  await connectWithRetry();
  await seedIfEmpty();
  app.listen(PORT, () => console.log(`[backend] API ecoute sur le port ${PORT}`));
})();
