const db = require('../database/db')

const getAllSales = (req, res) => {
    const sales = db.prepare(`
        SELECT
            s.id,
            s.date,
            s.time,
            s.payment_method,
            s.total
        FROM sales s
        ORDER BY s.date DESC, s.time DESC
    `).all()

    res.json(sales)
}

const getSaleById = (req, res) => {
    const { id } = req.params

    const sale = db.prepare(`
        SELECT
            s.id,
            s.date,
            s.time,
            s.payment_method,
            s.total
        FROM sales s
        WHERE s.id = ?
    `).get(id)

    if (!sale) {
        return res.status(404).json({ error: 'Sale not found' })
    }


    const details = db.prepare(`
        SELECT
            sd.id,
            sd.product_id,
            sd.variant_id,
            sd.quantity,
            sd.unit_price,
            sd.subtotal,
            p.name AS product_name,
            ps.name AS size_name,
            pv.has_liquor
        FROM sale_details sd
        JOIN products p ON sd.product_id = p.id
        LEFT JOIN product_variants pv ON sd.variant_id = pv.id
        LEFT JOIN product_sizes ps ON pv.size_id = ps.id
        WHERE sd.sale_id = ?
    `).all(id)

    res.json({ ...sale, items: details })
}

const createSale = (req, res) => {
    const { date, time, payment_method, items } = req.body

    if (!date) {
    return res.status(400).json({ error: 'Date is required' })
    }

    if (!time) {
    return res.status(400).json({ error: 'Time is required' })
    }

    if (!payment_method || payment_method.trim() === '') {
    return res.status(400).json({ error: 'Payment method is required' })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'At least one item is required' })
    }

    const resolvedItems = []

    for (const item of items) {
        if (!item.product_id || !item.quantity) {
            return res.status(400).json({ error: 'Each item must have product_id and quantity' })
        }   

        if (item.quantity <= 0) {
            return res.status(400).json({ error: 'Quantity must be greater than 0' })
        }

        const product = db.prepare(
            'SELECT * FROM products WHERE id = ?'
        ).get(item.product_id)

        if (!product) {
            return res.status(404).json({ error: `Product ${item.product_id} not found` })
        }

        let unit_price

        if (item.variant_id) {
            const variant = db.prepare(
                'SELECT * FROM product_variants WHERE id = ?'
            ).get(item.variant_id)

            if (!variant) {
                return res.status(404).json({ error: `Variant ${item.variant_id} not found` })
            }

            if (variant.product_id !== product.id) {
                return res.status(400).json({ error: `Variant ${item.variant_id} does not belong to product ${item.product_id}` })
            }

            unit_price = variant.price
        }   else {
            unit_price = product.base_price
        }

        resolvedItems.push({
            product_id: item.product_id,
            variant_id: item.variant_id || null,
            quantity: item.quantity,
            unit_price,
            subtotal: item.quantity * unit_price
        })
    }

    const total = resolvedItems.reduce((sum, item) => sum + item.subtotal, 0)

    const createSaleTransaction = db.transaction(() => {
        const saleResult = db.prepare(`
            INSERT INTO sales (date, time, payment_method, total)
            VALUES (?, ?, ?, ?)
        `).run(date, time, payment_method.trim(), total)

        const saleId = saleResult.lastInsertRowid

        for (const item of resolvedItems) {
            db.prepare(`
                INSERT INTO sale_details (sale_id, product_id, variant_id, quantity, unit_price, subtotal)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(
                saleId,
                item.product_id,
                item.variant_id,
                item.quantity,
                item.unit_price,
                item.subtotal
            )

            if (!item.variant_id) {
                db.prepare(`
                    UPDATE products SET current_stock = current_stock - ?
                    WHERE id = ?
                `).run(item.quantity, item.product_id)
            }
        }

        return saleId
    })

    const saleId = createSaleTransaction()

    const newSale = db.prepare(
        'SELECT * FROM sales WHERE id = ?'
    ).get(saleId)

    const details = db.prepare(`
        SELECT
            sd.id,
            sd.product_id,
            sd.variant_id,
            sd.quantity,
            sd.unit_price,
            sd.subtotal,
            p.name AS product_name,
            ps.name AS size_name,
            pv.has_liquor
        FROM sale_details sd
        JOIN products p ON sd.product_id = p.id
        LEFT JOIN product_variants pv ON sd.variant_id = pv.id
        LEFT JOIN product_sizes ps ON pv.size_id = ps.id
        WHERE sd.sale_id = ?
    `).all(saleId)

    res.status(201).json({ ...newSale, items: details})
}

const getSalesByDateRange = (req, res) => {
  const { start, end } = req.query

  if (!start || !end) {
    return res.status(400).json({ error: 'Start and end dates are required' })
  }

  const sales = db.prepare(`
    SELECT
      s.id,
      s.date,
      s.time,
      s.payment_method,
      s.total
    FROM sales s
    WHERE s.date BETWEEN ? AND ?
    ORDER BY s.date DESC, s.time DESC
  `).all(start, end)

  const salesWithDetails = sales.map(sale => {
    const details = db.prepare(`
      SELECT
        sd.id,
        sd.product_id,
        sd.variant_id,
        sd.quantity,
        sd.unit_price,
        sd.subtotal,
        p.name AS product_name,
        ps.name AS size_name,
        pv.has_liquor
      FROM sale_details sd
      JOIN products p ON sd.product_id = p.id
      LEFT JOIN product_variants pv ON sd.variant_id = pv.id
      LEFT JOIN product_sizes ps ON pv.size_id = ps.id
      WHERE sd.sale_id = ?
    `).all(sale.id)

    return { ...sale, items: details }
  })

  const summary = {
    total: sales.reduce((sum, s) => sum + s.total, 0),
    cash: sales.filter(s => s.payment_method === 'cash').reduce((sum, s) => sum + s.total, 0),
    transfer: sales.filter(s => s.payment_method === 'transfer').reduce((sum, s) => sum + s.total, 0),
    card: sales.filter(s => s.payment_method === 'card').reduce((sum, s) => sum + s.total, 0),
    count: sales.length
  }

  const slushSales = salesWithDetails.flatMap(s =>
    s.items.filter(i => i.variant_id !== null)
  )

  const slushBySize = slushSales.reduce((acc, item) => {
    const size = item.size_name
    acc[size] = (acc[size] || 0) + item.quantity
    return acc
  }, {})

  res.json({
    summary,
    sales: salesWithDetails,
    slushBySize
  })
}

module.exports = {
    getAllSales,
    getSaleById,
    createSale,
    getSalesByDateRange
}





