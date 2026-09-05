const db = require('../database/db')

const getAllSizes = (req, res) => {
  const sizes = db.prepare('SELECT * FROM product_sizes').all()
  res.json(sizes)
}

const createSize = (req, res) => {
  const { name } = req.body

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required' })
  }

  const result = db.prepare(
    'INSERT INTO product_sizes (name) VALUES (?)'
  ).run(name.trim())

  const newSize = db.prepare(
    'SELECT * FROM product_sizes WHERE id = ?'
  ).get(result.lastInsertRowid)

  res.status(201).json(newSize)
}

const updateSize = (req, res) => {
  const { id } = req.params
  const { name } = req.body

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required' })
  }

  const size = db.prepare(
    'SELECT * FROM product_sizes WHERE id = ?'
  ).get(id)

  if (!size) {
    return res.status(404).json({ error: 'Size not found' })
  }

  db.prepare(
    'UPDATE product_sizes SET name = ? WHERE id = ?'
  ).run(name.trim(), id)

  const updatedSize = db.prepare(
    'SELECT * FROM product_sizes WHERE id = ?'
  ).get(id)

  res.json(updatedSize)
}

const deleteSize = (req, res) => {
  const { id } = req.params

  const size = db.prepare(
    'SELECT * FROM product_sizes WHERE id = ?'
  ).get(id)

  if (!size) {
    return res.status(404).json({ error: 'Size not found' })
  }

  db.prepare(
    'DELETE FROM product_sizes WHERE id = ?'
  ).run(id)

  res.json({ message: `Size ${id} deleted successfully` })
}

module.exports = {
  getAllSizes,
  createSize,
  updateSize,
  deleteSize
}