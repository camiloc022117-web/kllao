const db = require ('../database/db');

const getAllProducts = (req, res) => {
    const products = db.prepare(`
    SELECT
        p.id,
        p.name,
        p.description,
        p.base_price,
        p.current_stock,
        p.category_id,
        c.name AS category_name
    FROM products p
    JOIN product_categories c ON p.category_id = c.id
    `).all()

    res.json(products);
}

const getProductById = (req, res) => {
    const { id } = req.params;

    const product = db.prepare(`
    SELECT
        p.id,
        p.name,
        p.description,
        p.base_price,
        p.current_stock,
        p.category_id,
        c.name AS category_name
    FROM products p
    JOIN product_categories c ON p.category_id = c.id
    WHERE p.id = ?
    `).get(id);

    if (!product) {
        return res.status(404).json({ error: 'Product not found'});
    }

    res.json(product);
}

const createProduct = (req, res ) => {
    const { name, description, category_id, base_price, current_stock } = req.body;

    if (!name || name.trim() === ''){
        return res.status(400).json({ error: 'Name is required'});
    } 

    if (!category_id) {
        return res.status(400).json({ error: 'Category is required'});
    } 

    if (base_price === undefined || base_price < 0) {
        return res.status(400).json({ error: 'Valid base price is required'});
    } 

    const category = db.prepare(
        'SELECT * FROM product_categories WHERE id = ?'
    ).get(category_id);

    if (!category){
        return res.status(404).json({ error: 'Category not found'});
    } 

    const result = db.prepare(`
        INSERT INTO products (name, description, category_id, base_price, current_stock)
        VALUES (?, ?, ?, ?, ?)
    `).run(
        name.trim(),
        description ? description.trim() : null,
        category_id,
        base_price,
        current_stock ?? 0
    ) 

    const newProduct = db.prepare(`
        SELECT
        p.id,
        p.name,
        p.description,
        p.base_price,
        p.current_stock,
        p.category_id,
        c.name AS category_name
    FROM products p
    JOIN product_categories c ON p.category_id = c.id
    WHERE p.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(newProduct);
} 

const updateProduct = (req, res) => {
    const { id } = req.params;
    const { name, description, category_id, base_price, current_stock} = req.body; 

    const product = db.prepare(
        `SELECT * FROM products WHERE id = ?`
    ).get(id);

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });      
    } 

    if (category_id) {
        const category = db.prepare(
            'SELECT * FROM product_categories WHERE id = ?'
        ).get(category_id);

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
    } 

db.prepare(`
    UPDATE products SET
        name = ?,
        description = ?,
        category_id = ?,
        base_price = ?,
        current_stock = ? 
    WHERE id = ? 
`).run(
    name ? name.trim() : product.name,
    description ? description.trim() : product.description,
    category_id ?? product.category_id,
    base_price !== undefined ? base_price : product.base_price,
    current_stock !== undefined ? current_stock : product.current_stock,
    id
) 

const updatedProduct = db.prepare(`
    SELECT
        p.id,
        p.name,
        p.description,
        p.base_price,
        p.current_stock,
        p.category_id,
        c.name AS category_name
    FROM products p
    JOIN product_categories c ON p.category_id = c.id
    WHERE p.id = ?
`).get(id);

res.json(updatedProduct);
}

const deleteProduct = (req, res) => {
    const { id } = req.params;

    const product = db.prepare(
        'SELECT * FROM products WHERE id = ?'
    ).get(id);

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    db.prepare('DELETE FROM products WHERE ID = ?').run(id);

    res.json({ message: `Product ${id} deleted successfully` });
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}