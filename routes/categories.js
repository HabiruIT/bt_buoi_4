var express = require('express');
var router = express.Router();
const categoriesData = require('../utils/categoriesData');

// GET /categories - Lấy danh sách categories
router.get('/', function(req, res, next) {
  try {
    res.json({
      success: true,
      count: categoriesData.length,
      data: categoriesData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách categories',
      error: error.message
    });
  }
});

// GET /categories/:id - Lấy category theo ID
router.get('/:id', function(req, res, next) {
  try {
    const categoryId = parseInt(req.params.id);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
    }
    
    const category = categoriesData.find(c => c.id === categoryId);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy category với ID ${categoryId}`
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy category',
      error: error.message
    });
  }
});

module.exports = router;
