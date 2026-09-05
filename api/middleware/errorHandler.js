const errorHandler = (err, req, res) => {
  console.error('[API Error]', err.message);

  if (err.code === '23505') {
    return res.status(409).json({ error: 'Registro duplicado' });
  }

  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referencia no válida' });
  }

  if (err.code === '23514') {
    return res.status(400).json({ error: 'Datos no válidos' });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Error interno del servidor' });
};

module.exports = errorHandler;
