const db = require('../database/db')

const getAllCategories = (req, res) => {
  const categories = db.prepare('SELECT * FROM product_categories').all()
    res.json(categories)
}

const createCategory = (req, res) => {
  const { name } = req.body

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required' })
  }

  const result = db.prepare(
    'INSERT INTO product_categories (name) VALUES (?)'
  ).run(name.trim())

  const newCategory = db.prepare(
    'SELECT * FROM product_categories WHERE id = ?'
  ).get(result.lastInsertRowid)

  res.status(201).json(newCategory)

}

const updateCategory = (req, res) => {
  const { id } = req.params
  const { name } = req.body

  if (!name || name.trim() === ''){
    return res.status(400).json({ error: 'Name is required' })
  }

  const category = db.prepare(
    'SELECT * FROM product_categories WHERE id = ?'
  ).get(id)

  if (!category){
    return res.status(404).json({ error: 'Category not found' })
  }

  db.prepare(
    'UPDATE product_categories SET name = ? WHERE id = ?'
  ).run(name.trim(), id)

  const updatedCategory = db.prepare(
    'SELECT * FROM product_categories WHERE id = ?'
  ).get(id)

  res.json(updatedCategory)
}

const deleteCategory = (req, res) => {
  const { id } = req.params

  const category = db.prepare(
    'SELECT * FROM product_categories WHERE id = ?'
  ).get(id)

  if (!category){
    return res.status(404).json({ error: 'Category not found'})
  }

  db.prepare(
    'DELETE FROM product_categories WHERE id = ?'
  ).run(id)

  res.json({ message: `Category ${id} deleted successfully` })
}

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
}
