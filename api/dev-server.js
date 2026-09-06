require('dotenv').config();
const express = require('express');
const cors = require('cors');
const auth = require('../lib/middleware/auth');
const authHandler = require('../lib/handlers/auth');
const categoriesHandler = require('../lib/handlers/categories');
const sizesHandler = require('../lib/handlers/sizes');
const productsHandler = require('../lib/handlers/products');
const variantsHandler = require('../lib/handlers/variants');
const salesHandler = require('../lib/handlers/sales');
const stockEntriesHandler = require('../lib/handlers/stock-entries');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const wrapHandler = (handler) => async (req, res) => {
  await handler(req, res);
};

app.use('/api/auth', wrapHandler(authHandler));

app.use('/api/categories', auth, wrapHandler(categoriesHandler));
app.use('/api/sizes', auth, wrapHandler(sizesHandler));
app.use('/api/products', auth, wrapHandler(productsHandler));
app.use('/api/variants', auth, wrapHandler(variantsHandler));
app.use('/api/sales', auth, wrapHandler(salesHandler));
app.use('/api/stock-entries', auth, wrapHandler(stockEntriesHandler));

app.get('/', (req, res) => {
  res.json({ message: "K'llao API running" });
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
