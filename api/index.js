require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const auth = require('../lib/middleware/auth');
const errorHandler = require('../lib/middleware/errorHandler');

const authHandler = require('../lib/handlers/auth');
const productsHandler = require('../lib/handlers/products');
const categoriesHandler = require('../lib/handlers/categories');
const sizesHandler = require('../lib/handlers/sizes');
const variantsHandler = require('../lib/handlers/variants');
const salesHandler = require('../lib/handlers/sales');
const stockEntriesHandler = require('../lib/handlers/stock-entries');

const app = express();

app.use(cors());
app.use(express.json());

const wrap = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
};

app.all('/api/auth', wrap(authHandler));

app.all('/api/products', auth, wrap(productsHandler));
app.all('/api/categories', auth, wrap(categoriesHandler));
app.all('/api/sizes', auth, wrap(sizesHandler));
app.all('/api/variants', auth, wrap(variantsHandler));
app.all('/api/sales', auth, wrap(salesHandler));
app.all('/api/stock-entries', auth, wrap(stockEntriesHandler));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(express.static(path.join(__dirname, '../public')));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint no encontrado' });
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use(errorHandler);

module.exports = app;
