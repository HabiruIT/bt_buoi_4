var express = require('express');
var router = express.Router();
const productsData = require('../utils/productsData');
const { filterProducts } = require('../utils/productQueryHandler');

// GET /products - Lấy danh sách products với query filters
// Query params: title (includes), slug (equal), minPrice, maxPrice
// Example: /products?title=classic&minPrice=20&maxPrice=100
router.get('/', function(req, res, next) {
  try {
    const filteredProducts = filterProducts(productsData, req.query);
    
    res.json({
      success: true,
      count: filteredProducts.length,
      data: filteredProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách products',
      error: error.message
    });
  }
});

// GET /products/:id - Lấy product theo ID
router.get('/:id', function(req, res, next) {
  try {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
    }
    
    const product = productsData.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy product với ID ${productId}`
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy product',
      error: error.message
    });
  }
});

module.exports = router;
