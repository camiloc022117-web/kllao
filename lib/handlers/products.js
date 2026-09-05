const productService = require('../services/ProductService');
const errorHandler = require('../middleware/errorHandler');

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
          const product = await productService.getById(id);
          return res.status(200).json(product);
        }
        const products = await productService.getAll();
        return res.status(200).json(products);

      case 'POST':
        const created = await productService.create(req.body);
        return res.status(201).json(created);

      case 'PUT':
        const updated = await productService.update(id, req.body);
        return res.status(200).json(updated);

      case 'DELETE':
        await productService.delete(id);
        return res.status(200).json({ message: `Producto ${id} eliminado` });

      default:
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (err) {
    errorHandler(err, req, res);
  }
};
