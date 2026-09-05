const express = require('express')
const cors = require('cors')
const db = require('./database/db')
const categoriesRouter = require('./routes/categories')
const sizesRouter = require('./routes/sizes')
const productsRouter = require('./routes/products')
const variantsRouter = require('./routes/variants')
const stockEntriesRouter = require('./routes/stockEntries')
const salesRouter = require('./routes/sales')

const app = express()
const PORT = 3000

app.use(cors({
    origin: 'http://localhost:5173'
}))
app.use(express.json())

app.use('/categories', categoriesRouter)
app.use('/sizes', sizesRouter)
app.use('/products', productsRouter)
app.use('/variants', variantsRouter)
app.use('/stock-entries', stockEntriesRouter)
app.use('/sales', salesRouter)

app.get('/', (req, res) => {
    res.json({ message: "K'lliao server running" })
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})