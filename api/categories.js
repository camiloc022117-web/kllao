const categoryService = require('./services/CategoryService');
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
          const category = await categoryService.getById(id);
          return res.status(200).json(category);
        }
        const categories = await categoryService.getAll();
        return res.status(200).json(categories);

      case 'POST':
        const created = await categoryService.create(req.body);
        return res.status(201).json(created);

      case 'PUT':
        const updated = await categoryService.update(id, req.body);
        return res.status(200).json(updated);

      case 'DELETE':
        await categoryService.delete(id);
        return res.status(200).json({ message: `Categoría ${id} eliminada` });

      default:
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (err) {
    errorHandler(err, req, res);
  }
};
