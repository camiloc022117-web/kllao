const express = require('express')
const router = express.Router()
const {
    getAllVariants,
    getVariantById,
    createVariant,
    updateVariant,
    deleteVariant
} = require('../controllers/variants')

router.get('/', getAllVariants)
router.get('/:id', getVariantById)
router.post('/', createVariant)
router.put('/:id', updateVariant)
router.delete('/:id', deleteVariant)

module.exports = router