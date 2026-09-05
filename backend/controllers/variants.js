const db = require ('../database/db');

const getAllVariants = (req, res) => {
    const variants = db.prepare(`
        SELECT 
            v.id,
            v.product_id,
            v.size_id,
            v.has_liquor,
            v.price,
            p.name AS product_name,
            s.name AS size_name
        FROM product_variants v
        JOIN products p ON v.product_id = p.id
        JOIN product_sizes s ON v.size_id = s.id
        `).all();

    res.json(variants);
}

const getVariantById = (req, res) => {
    const { id } = req.params;

    const variant = db.prepare(`
        SELECT
            v.id, 
            v.product_id,
            v.size_id,
            v.has_liquor,
            v.price,
            p.name AS product_name,
            s.name AS size_name
        FROM product_variants v
        JOIN products p ON v.product_id = p.id
        JOIN product_sizes s ON v.size_id = s.id
        WHERE v.id = ? 
        `).get(id);

    if (!variant) {
        return res.status(404).json({ error: 'Variant not found'});
    }

    res.json(variant);
}

const createVariant = (req, res) => {
    const { product_id, size_id, has_liquor, price } = req.body;

    if (!product_id) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    if (!size_id) {
        return res.status(400).json({ error: 'Size is required' });
    }

    if (price === undefined || price < 0) {
        return res.status(400).json({ error: 'Valid price is required' });
    }

    const product = db.prepare(`
        SELECT * FROM products WHERE id = ?
    `).get(product_id);

    if(!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const size = db.prepare(
        'SELECT * FROM product_sizes WHERE id = ?'
    ).get(size_id);

    if(!size) {
        return res.status(404).json({ error: 'Size not found' });
    }

    const existingVariant = db.prepare(`
        SELECT * FROM product_variants
        WHERE product_id = ? AND size_id = ? AND has_liquor = ?
    `).get(product_id, size_id, has_liquor ? 1 : 0);

    if (existingVariant) {
        return res.status(409).json({ error: 'Variant already exists' });
    }

    const result = db.prepare(`
        INSERT INTO product_variants (product_id, size_id, has_liquor, price)
        VALUES (?, ?, ?, ?)
    `).run(product_id, size_id, has_liquor ? 1 : 0, price);

    const newVariant = db.prepare(`
        SELECT
            v.id,
            v.product_id,
            v.size_id,
            v.has_liquor,
            v.price,
            p.name AS product_name,
            s.name AS size_name
        FROM product_variants v
        JOIN products p ON v.product_id = p.id
        JOIN product_sizes s ON v.size_id = s.id
        WHERE v.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(newVariant);
}

const updateVariant = (req, res) => {
    const { id } = req.params;
    const { has_liquor, price } = req.body;

    const variant = db.prepare(`
        SELECT * FROM product_variants WHERE id = ?    
    `).get(id);

    if (!variant) {
        return res.status(404).json({ error: 'Variant not found' });
    }

    db.prepare(`
        UPDATE product_variants SET
            has_liquor = ?,
            price = ?
        WHERE id = ?
    `).run(
        has_liquor !== undefined ? (has_liquor ? 1 : 0) : variant.has_liquor,
        price !== undefined ? price : variant.price,
        id
    );

    const updatedVariant = db.prepare(`
        SELECT
            v.id,
            v.product_id,
            v.size_id,
            v.has_liquor,
            v.price,
            p.name AS product_name,
            s.name AS size_name
        FROM product_variants v
        JOIN products p ON v.product_id = p.id
        JOIN product_sizes s ON v.size_id = s.id
        WHERE v.id = ?
    `).get(id);

    res.json(updatedVariant);
}

const deleteVariant = (req, res) => {
    const { id } = req.params;

    const variant = db.prepare(`
        SELECT * FROM product_variants WHERE id = ?'
    `).get(id);

    if (!variant) {
        return res.status(404).json({ error: 'Variant not found' });
    }

    db.prepare(`
        DELETE FROM product_variants WHERE id = ?
    `).run(id);

    res.json({ message: 'Variant deleted successfully' });
}

module.exports = {
    getAllVariants,
    getVariantById,
    createVariant,
    updateVariant,
    deleteVariant
};  