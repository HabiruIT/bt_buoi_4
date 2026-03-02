// Product Query Handler - Xử lý các query parameters cho products

/**
 * Lọc products dựa trên query parameters
 * @param {Array} products - Mảng products cần lọc
 * @param {Object} query - Query parameters từ request
 * @returns {Array} - Mảng products đã được lọc
 */
function filterProducts(products, query) {
  let filtered = [...products];

  // Filter by title (includes - không phân biệt hoa thường)
  if (query.title) {
    const searchTitle = query.title.toLowerCase();
    filtered = filtered.filter(product => 
      product.title.toLowerCase().includes(searchTitle)
    );
  }

  // Filter by slug (equal - chính xác)
  if (query.slug) {
    filtered = filtered.filter(product => 
      product.slug === query.slug
    );
  }

  // Filter by minPrice
  if (query.minPrice) {
    const minPrice = parseFloat(query.minPrice);
    if (!isNaN(minPrice)) {
      filtered = filtered.filter(product => product.price >= minPrice);
    }
  }

  // Filter by maxPrice
  if (query.maxPrice) {
    const maxPrice = parseFloat(query.maxPrice);
    if (!isNaN(maxPrice)) {
      filtered = filtered.filter(product => product.price <= maxPrice);
    }
  }

  return filtered;
}

module.exports = {
  filterProducts
};
