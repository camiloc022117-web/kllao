const sizeService = require('./services/SizeService');
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
          const size = await sizeService.getById(id);
          return res.status(200).json(size);
        }
        const sizes = await sizeService.getAll();
        return res.status(200).json(sizes);

      case 'POST':
        const created = await sizeService.create(req.body);
        return res.status(201).json(created);

      case 'PUT':
        const updated = await sizeService.update(id, req.body);
        return res.status(200).json(updated);

      case 'DELETE':
        await sizeService.delete(id);
        return res.status(200).json({ message: `Tamaño ${id} eliminado` });

      default:
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (err) {
    errorHandler(err, req, res);
  }
};
