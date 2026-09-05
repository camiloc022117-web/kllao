const express = require('express')
const router = express.Router()
const {
    getAllStockEntries,
    getStockEntryById,
    createStockEntry
} = require('../controllers/stockEntries')

router.get('/', getAllStockEntries)
router.get('/:id', getStockEntryById)
router.post('/', createStockEntry)

module.exports = router