// API Base URL - Thay đổi theo cấu hình server của bạn
const API_BASE_URL = 'http://localhost:3000';

// Debounce function - Trì hoãn việc gọi hàm cho đến khi người dùng ngừng nhập
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// DOM Elements
const loading = document.getElementById('loading');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const searchNotification = document.getElementById('search-notification');

// Products Elements
const searchTitle = document.getElementById('search-title');
const searchSlug = document.getElementById('search-slug');
const searchMinPrice = document.getElementById('search-minPrice');
const searchMaxPrice = document.getElementById('search-maxPrice');
const btnResetSearch = document.getElementById('btn-reset-search');
const productId = document.getElementById('product-id');
const productsResults = document.getElementById('products-results');
const productsCount = document.getElementById('products-count');

// Categories Elements
const categoryId = document.getElementById('category-id');
const categoriesResults = document.getElementById('categories-results');
const categoriesCount = document.getElementById('categories-count');

// Users Elements
const userId = document.getElementById('user-id');
const usersResults = document.getElementById('users-results');
const usersCount = document.getElementById('users-count');

// Utility Functions
function showLoading() {
    // Không dùng nữa - để trống
}

function hideLoading() {
    // Không dùng nữa - để trống
}

let notificationTimeout;
function showNotification(message, type = 'info', duration = 3000) {
    // Clear previous timeout
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
    }
    
    // Set notification content and type
    searchNotification.textContent = message;
    searchNotification.className = `notification ${type}`;
    
    // Show notification after 1 second
    setTimeout(() => {
        searchNotification.classList.remove('hidden');
        
        // Auto hide after duration
        notificationTimeout = setTimeout(() => {
            searchNotification.classList.add('hidden');
        }, duration);
    }, 1000);
}

function hideNotification() {
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
    }
    searchNotification.classList.add('hidden');
}

function showError(message) {
    console.error('Error:', message);
    // Không hiển thị alert nữa, chỉ log
}

function showSuccess(message) {
    console.log('Success:', message);
}

function showSuccess(message) {
    alert('✅ ' + message);
}

// Tab Switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Remove active class from all tabs
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab
        btn.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    });
});

// Products Functions
let isSearching = false;

async function searchProducts() {
    // Tránh gọi nhiều lần cùng lúc
    if (isSearching) return;
    isSearching = true;
    
    // Ẩn notification cũ khi bắt đầu tìm kiếm mới
    hideNotification();
    
    // Hiển thị loader cho các input có giá trị
    const loaders = {
        'search-title': document.getElementById('title-loader'),
        'search-slug': document.getElementById('slug-loader'),
        'search-minPrice': document.getElementById('minPrice-loader'),
        'search-maxPrice': document.getElementById('maxPrice-loader')
    };
    
    Object.keys(loaders).forEach(id => {
        const input = document.getElementById(id);
        if (input && input.value) {
            loaders[id].classList.add('active');
        }
    });
    
    const params = new URLSearchParams();
    
    if (searchTitle.value) params.append('title', searchTitle.value);
    if (searchSlug.value) params.append('slug', searchSlug.value);
    if (searchMinPrice.value) params.append('minPrice', searchMinPrice.value);
    if (searchMaxPrice.value) params.append('maxPrice', searchMaxPrice.value);
    
    try {
        const response = await fetch(`${API_BASE_URL}/products?${params}`);
        const data = await response.json();
        
        if (data.success) {
            displayProducts(data.data);
            productsCount.textContent = `${data.count} products`;
        } else {
            showError(data.message);
        }
    } catch (error) {
        showError('Không thể kết nối đến server: ' + error.message);
        showNotification('❌ Không thể kết nối đến server', 'error', 3000);
    } finally {
        // Ẩn tất cả loaders
        Object.values(loaders).forEach(loader => {
            loader.classList.remove('active');
        });
        isSearching = false;
    }
}

async function getAllProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const data = await response.json();
        
        if (data.success) {
            displayProducts(data.data);
            productsCount.textContent = `${data.count} products`;
        } else {
            showError(data.message);
        }
    } catch (error) {
        showError('Không thể kết nối đến server: ' + error.message);
    }
}

async function getProductById() {
    if (!productId.value) {
        getAllProducts();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId.value}`);
        const data = await response.json();
        
        if (data.success) {
            displayProducts([data.data]);
            productsCount.textContent = '1 product';
        } else {
            displayProducts([]);
            productsCount.textContent = '0 products';
        }
    } catch (error) {
        showError('Không thể kết nối đến server: ' + error.message);
    }
}

function displayProducts(products) {
    if (products.length === 0) {
        productsResults.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <div class="empty-state-text">Không tìm thấy sản phẩm nào</div>
            </div>
        `;
        // Hiển thị notification sau 1 giây
        showNotification('❌ Không tìm thấy sản phẩm nào phù hợp với tiêu chí tìm kiếm', 'error', 3000);
        return;
    }
    
    // Ẩn notification nếu có kết quả
    hideNotification();
    
    productsResults.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.images[0]}" alt="${product.title}" class="product-image" onerror="this.src='https://via.placeholder.com/280x200?text=No+Image'">
            <div class="product-title">${product.title}</div>
            <div class="product-price">$${product.price}</div>
            <div class="product-category">${product.category.name}</div>
            <div class="product-slug">${product.slug}</div>
        </div>
    `).join('');
}

function resetSearch() {
    searchTitle.value = '';
    searchSlug.value = '';
    searchMinPrice.value = '';
    searchMaxPrice.value = '';
    productId.value = '';
    hideNotification();
    getAllProducts();
}

// Categories Functions
async function getAllCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const data = await response.json();
        
        if (data.success) {
            displayCategories(data.data);
            categoriesCount.textContent = `${data.count} categories`;
        } else {
            showError(data.message);
        }
    } catch (error) {
        showError('Không thể kết nối đến server: ' + error.message);
    }
}

async function getCategoryById() {
    if (!categoryId.value) {
        getAllCategories();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/categories/${categoryId.value}`);
        const data = await response.json();
        
        if (data.success) {
            displayCategories([data.data]);
            categoriesCount.textContent = '1 category';
        } else {
            displayCategories([]);
            categoriesCount.textContent = '0 categories';
        }
    } catch (error) {
        showError('Không thể kết nối đến server: ' + error.message);
    }
}

function displayCategories(categories) {
    if (categories.length === 0) {
        categoriesResults.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📂</div>
                <div class="empty-state-text">Không tìm thấy danh mục nào</div>
            </div>
        `;
        return;
    }
    
    categoriesResults.innerHTML = categories.map(category => `
        <div class="category-card">
            <img src="${category.image}" alt="${category.name}" class="category-image" onerror="this.src='https://via.placeholder.com/100?text=${category.name}'">
            <div class="category-name">${category.name}</div>
            <div class="category-slug">${category.slug}</div>
        </div>
    `).join('');
}

// Users Functions
async function getAllUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`);
        const data = await response.json();
        
        if (data.success) {
            displayUsers(data.data);
            usersCount.textContent = `${data.count} users`;
        } else {
            showError(data.message);
        }
    } catch (error) {
        showError('Không thể kết nối đến server: ' + error.message);
    }
}

async function getUserById() {
    if (!userId.value) {
        getAllUsers();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId.value}`);
        const data = await response.json();
        
        if (data.success) {
            displayUsers([data.data]);
            usersCount.textContent = '1 user';
        } else {
            displayUsers([]);
            usersCount.textContent = '0 users';
        }
    } catch (error) {
        showError('Không thể kết nối đến server: ' + error.message);
    }
}

function displayUsers(users) {
    if (users.length === 0) {
        usersResults.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👥</div>
                <div class="empty-state-text">Không tìm thấy người dùng nào</div>
            </div>
        `;
        return;
    }
    
    usersResults.innerHTML = users.map(user => `
        <div class="user-card">
            <div class="user-name">${user.name}</div>
            <div class="user-email">📧 ${user.email}</div>
            <div class="user-role">${user.role}</div>
        </div>
    `).join('');
}

// Auto-search với debounce (tự động tìm kiếm khi người dùng nhập)
const debouncedSearch = debounce(searchProducts, 500);
const debouncedGetProductById = debounce(getProductById, 500);
const debouncedGetCategoryById = debounce(getCategoryById, 500);
const debouncedGetUserById = debounce(getUserById, 500);

// Event Listeners
btnResetSearch.addEventListener('click', resetSearch);

// Auto-search khi người dùng nhập vào các ô tìm kiếm products
searchTitle.addEventListener('input', debouncedSearch);
searchSlug.addEventListener('input', debouncedSearch);
searchMinPrice.addEventListener('input', debouncedSearch);
searchMaxPrice.addEventListener('input', debouncedSearch);

// Auto-search khi nhập ID
productId.addEventListener('input', debouncedGetProductById);
categoryId.addEventListener('input', debouncedGetCategoryById);
userId.addEventListener('input', debouncedGetUserById);

// Enter key support (vẫn giữ để người dùng có thể bấm Enter)
searchTitle.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchProducts();
});

searchSlug.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchProducts();
});

productId.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getProductById();
});

categoryId.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getCategoryById();
});

userId.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getUserById();
});

// Load all products on page load
window.addEventListener('DOMContentLoaded', () => {
    getAllProducts();
});

// Load all categories when switching to categories tab
tabBtns.forEach(btn => {
    const originalClickHandler = btn.onclick;
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        if (tabName === 'categories' && categoriesResults.innerHTML === '') {
            getAllCategories();
        } else if (tabName === 'users' && usersResults.innerHTML === '') {
            getAllUsers();
        }
    });
});
