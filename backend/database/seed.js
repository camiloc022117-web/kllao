const db = require('./db')

console.log('Starting seed...')

const seedCategories = db.transaction(() => {
  const insert = db.prepare('INSERT INTO product_categories (name) VALUES (?)')

  insert.run('slushies')
  insert.run('drinks')
  insert.run('snacks')
  insert.run('extras')

  console.log('Categories seeded')
})

const seedSizes = db.transaction(() => {
  const insert = db.prepare('INSERT INTO product_sizes (name) VALUES (?)')

  insert.run('12oz')
  insert.run('16oz')
  insert.run('18oz')
  insert.run('22oz')
  insert.run('32oz')

  console.log('Sizes seeded')
})

const seedProducts = db.transaction(() => {
  const insert = db.prepare(`
    INSERT INTO products (name, category_id, base_price, current_stock)
    VALUES (?, ?, ?, ?)
  `)

  insert.run('Slush', 1, 0, 0)
  insert.run('DeTodito', 3, 4000, 0)
  insert.run('Doritos', 3, 3000, 0)
  insert.run('Choclitos', 3, 3000, 0)
  insert.run('Aguila Light', 2, 6000, 0)
  insert.run('Pilsen', 2, 6000, 0)
  insert.run('Water bottle', 2, 3000, 0)
  insert.run('Syringe', 4, 2500, 0)
  insert.run('Watermelon tape', 4, 500, 0)
  insert.run('Gummy', 4, 250, 0)
  insert.run('Red Lips', 4, 500, 0)

  console.log('Products seeded')
})

const seedVariants = db.transaction(() => {
  const insert = db.prepare(`
    INSERT INTO product_variants (product_id, size_id, has_liquor, price)
    VALUES (?, ?, ?, ?)
  `)

  insert.run(1, 1, 1, 12000)
  insert.run(1, 1, 0, 10000)
  insert.run(1, 2, 1, 16000)
  insert.run(1, 2, 0, 13000)
  insert.run(1, 3, 1, 18000)
  insert.run(1, 3, 0, 15000)
  insert.run(1, 4, 1, 22000)
  insert.run(1, 4, 0, 19000)
  insert.run(1, 5, 1, 32000)
  insert.run(1, 5, 0, 29000)

  console.log('Variants seeded')
})

try {
  seedCategories()
  seedSizes()
  seedProducts()
  seedVariants()
  console.log('Seed completed successfully')
} catch (error) {
  console.error('Seed failed:', error.message)
  process.exit(1)
}