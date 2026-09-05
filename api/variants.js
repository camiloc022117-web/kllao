const variantService = require('./services/VariantService');
const errorHandler = require('./middleware/errorHandler');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { id } = req.query || {};

    switch (req.method) {
      case 'GET':
        if (id) {
          const variant = await variantService.getById(id);
          return res.status(200).json(variant);
        }
        const variants = await variantService.getAll();
        return res.status(200).json(variants);

      case 'POST':
        const created = await variantService.create(req.body);
        return res.status(201).json(created);

      case 'PUT':
        const updated = await variantService.update(id, req.body);
        return res.status(200).json(updated);

      case 'DELETE':
        await variantService.delete(id);
        return res.status(200).json({ message: 'Variante eliminada' });

      default:
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (err) {
    errorHandler(err, req, res);
  }
};
