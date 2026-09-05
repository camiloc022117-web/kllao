const db = require('../database/db');

const getAllStockEntries = (req, res) => {
    const entries = db.prepare(`
        SELECT
            se.id,
            se.date,
            se.payment_method,
            se.total
        FROM stock_entries se
        ORDER BY se.date DESC
    `).all();

    res.json(entries);
}

const getStockEntryById = (req, res) => {
    const { id } = req.params

    const entry = db.prepare(`
        SELECT
            se.id,
            se.date,
            se.payment_method,
            se.total
        FROM stock_entries se
        WHERE se.id = ?
    `).get(id)

    if (!entry) {
        return res.status(404).json({ error: 'Stock entry not found '});
    }

    const details = db.prepare(`
        SELECT
            sed.id,
            sed.product_id,
            sed.quantity,
            sed.cost_price,
            sed.subtotal,
            p.name AS product_name
        FROM stock_entry_details sed
        JOIN products p ON sed.product_id = p.id
        WHERE sed.stock_entry_id = ?
    `).all(id)

    res.json({ ...entry, items: details })
}

const createStockEntry = (req, res) => {
    const { date, payment_method, items } = req.body

    if (!date) {
        return res.status(400).json({ error: 'Date is required'})
    }

    if (!payment_method || payment_method.trim() === '') { 
        return res.status(400).json({ error: 'Payment method is required' })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'At least one item is required' })
    }

    for (const item of items) {
        if (!item.product_id || !item.quantity || !item.cost_price) {
            return res.status(400).json({ error: 'Each item must have product_id, quantity and cost_price'})
        }

        if (item.quantity <= 0 || item.cost_price < 0) {
            return res.status(400).json({ error: 'Quantity must be greater than 0 and cost price must be positive' })
        }

        const product = db.prepare(
            'SELECT * FROM products WHERE id = ?'
        ).get(item.product_id)

        if (!product) {
            return res.status(404).json({ error: `Product ${item.product_id} not found` })
        }
    }

    const total = items.reduce((sum, item) => {
        return sum + (item.quantity * item.cost_price)
    }, 0)

    const createEntry = db.transaction(() => {
        const entryResult = db.prepare(`
            INSERT INTO stock_entries (date, payment_method, total)
            VALUES (?, ?, ?)
        `).run(date, payment_method.trim(), total)

        const entryId = entryResult.lastInsertRowid

        for ( const item of items) {
            const subtotal = item.quantity * item.cost_price

            db.prepare(`
                INSERT INTO stock_entry_details (stock_entry_id, product_id, quantity, cost_price, subtotal)
                VALUES (?, ?, ?, ?, ?)
            `).run(entryId, item.product_id, item.quantity, item.cost_price, subtotal)

            db.prepare(`
                UPDATE products SET current_stock = current_stock + ?
                WHERE id = ?
            `).run(item.quantity, item.product_id)
        }

        return entryId
    })

    const entryId = createEntry()

    const newEntry = db.prepare(`
        SELECT * FROM stock_entries WHERE id = ?
    `).get(entryId)

    const details = db.prepare(`
        SELECT
            sed.id,
            sed.product_id,
            sed.quantity,
            sed.cost_price,
            sed.subtotal,
            p.name AS product_name
        FROM stock_entry_details sed
        JOIN products p on sed.product_id = p.id
        WHERE sed.stock_entry_id = ? 
    `).all(entryId)

    res.status(201).json({ ...newEntry, items: details })
}

module.exports = {
    getAllStockEntries,
    getStockEntryById,
    createStockEntry
}