const stockEntryService = require('../services/StockEntryService');
const errorHandler = require('../middleware/errorHandler');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { id } = req.query || {};

    switch (req.method) {
      case 'GET':
        if (id) {
          const entry = await stockEntryService.getById(id);
          return res.status(200).json(entry);
        }
        const entries = await stockEntryService.getAll();
        return res.status(200).json(entries);

      case 'POST':
        const created = await stockEntryService.create(req.body);
        return res.status(201).json(created);

      default:
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (err) {
    errorHandler(err, req, res);
  }
};
