const express = require('express');
const router = express.Router();
const {
    getAllSizes,
    createSize,
    updateSize,
    deleteSize
} = require('../controllers/sizes');

router.get('/', getAllSizes);
router.post('/', createSize);
router.put('/:id', updateSize);
router.delete('/:id', deleteSize);

module.exports = router;