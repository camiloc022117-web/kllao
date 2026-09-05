const express = require('express')
const router = express.Router()
const {
  getAllSales,
  getSaleById,
  createSale,
  getSalesByDateRange
} = require('../controllers/sales')

router.get('/by-date', getSalesByDateRange)
router.get('/', getAllSales)
router.get('/:id', getSaleById)
router.post('/', createSale)

module.exports = router