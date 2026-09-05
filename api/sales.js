const saleService = require('./services/SaleService');
const errorHandler = require('./middleware/errorHandler');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        const { id, start, end } = req.query || {};

        if (start && end) {
          const data = await saleService.getByDateRange(start, end);
          return res.status(200).json(data);
        }

        if (id) {
          const sale = await saleService.getById(id);
          return res.status(200).json(sale);
        }

        const sales = await saleService.getAll();
        return res.status(200).json(sales);

      case 'POST':
        const created = await saleService.create(req.body);
        return res.status(201).json(created);

      default:
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (err) {
    errorHandler(err, req, res);
  }
};
