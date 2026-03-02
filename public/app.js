// =========================================
// NNPTUD Management — app.js
// =========================================
const API_BASE = 'http://localhost:3000';

// ---- Utility ----
function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function showNotif(id, msg, type = 'info', dur = 3500) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.className = `notification ${type}`;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), dur);
}

// ---- Tab Switching ----
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`${tab}-tab`).classList.add('active');

        // Auto-load on first open
        if (tab === 'users') getAllUsers();
        if (tab === 'roles') getAllRoles();
        if (tab === 'categories') getAllCategories();
        if (tab === 'products') getAllProducts();
    });
});

// ============================================================
// USERS
// ============================================================
async function getAllUsers() {
    try {
        const res = await fetch(`${API_BASE}/users`);
        const data = await res.json();
        if (data.success) {
            displayUsers(data.data);
            document.getElementById('users-count').textContent = `${data.count} users`;
            document.getElementById('stat-users').textContent = `👤 ${data.count} Users`;
        }
    } catch (e) {
        showNotif('action-notification', '❌ Không thể kết nối server', 'error');
    }
}

async function getUserById() {
    const id = document.getElementById('user-id').value.trim();
    if (!id) { getAllUsers(); return; }
    try {
        const res = await fetch(`${API_BASE}/users/${id}`);
        const data = await res.json();
        if (data.success) {
            displayUsers([data.data]);
            document.getElementById('users-count').textContent = '1 user';
        } else {
            displayUsers([]);
            showNotif('action-notification', `❌ ${data.message}`, 'error');
        }
    } catch (e) {
        showNotif('action-notification', '❌ Lỗi kết nối', 'error');
    }
}

async function enableUser() {
    const email = document.getElementById('action-email').value.trim();
    const username = document.getElementById('action-username').value.trim();
    if (!email || !username) {
        showNotif('action-notification', '⚠️ Vui lòng nhập cả email và username', 'error'); return;
    }
    try {
        const res = await fetch(`${API_BASE}/users/enable`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username })
        });
        const data = await res.json();
        showNotif('action-notification', data.success ? `✅ ${data.message}` : `❌ ${data.message}`,
            data.success ? 'success' : 'error');
        if (data.success) getAllUsers();
    } catch (e) {
        showNotif('action-notification', '❌ Lỗi kết nối', 'error');
    }
}

async function disableUser() {
    const email = document.getElementById('action-email').value.trim();
    const username = document.getElementById('action-username').value.trim();
    if (!email || !username) {
        showNotif('action-notification', '⚠️ Vui lòng nhập cả email và username', 'error'); return;
    }
    try {
        const res = await fetch(`${API_BASE}/users/disable`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username })
        });
        const data = await res.json();
        showNotif('action-notification', data.success ? `✅ ${data.message}` : `❌ ${data.message}`,
            data.success ? 'success' : 'error');
        if (data.success) getAllUsers();
    } catch (e) {
        showNotif('action-notification', '❌ Lỗi kết nối', 'error');
    }
}

function displayUsers(users) {
    const el = document.getElementById('users-results');
    if (!users || users.length === 0) {
        el.innerHTML = `
          <div class="empty-state">
            <span class="empty-state-icon">👤</span>
            <div class="empty-state-text">Không tìm thấy user nào</div>
          </div>`;
        return;
    }

    el.innerHTML = users.map(u => {
        const roleName = u.role ? (u.role.name || u.role) : 'Chưa gán';
        const statusCls = u.status ? 'status-active' : 'status-inactive';
        const statusTxt = u.status ? '🟢 Active' : '🔴 Inactive';
        const avatar = u.avatarUrl || 'https://i.sstatic.net/l60Hf.png';
        return `
        <div class="user-card">
          <div class="user-header">
            <img src="${avatar}" class="user-avatar" onerror="this.src='https://i.sstatic.net/l60Hf.png'" alt="avatar">
            <div class="user-info">
              <div class="user-name">${u.fullName || u.username}</div>
              <div class="user-username">@${u.username}</div>
            </div>
          </div>
          <div class="user-email">📧 ${u.email}</div>
          <div class="user-meta">
            <span class="user-role-badge">🔑 ${roleName}</span>
            <span class="status-badge ${statusCls}">${statusTxt}</span>
            <span class="login-count">🔓 ${u.loginCount ?? 0} lần</span>
          </div>
        </div>`;
    }).join('');
}

// ============================================================
// ROLES
// ============================================================
async function getAllRoles() {
    try {
        const res = await fetch(`${API_BASE}/roles`);
        const data = await res.json();
        if (data.success) {
            displayRoles(data.data);
            document.getElementById('roles-count').textContent = `${data.count} roles`;
            document.getElementById('stat-roles').textContent = `🔑 ${data.count} Roles`;
        }
    } catch (e) { console.error(e); }
}

async function getRoleById() {
    const id = document.getElementById('role-id').value.trim();
    if (!id) { getAllRoles(); return; }
    try {
        const res = await fetch(`${API_BASE}/roles/${id}`);
        const data = await res.json();
        if (data.success) {
            displayRoles([data.data]);
            document.getElementById('roles-count').textContent = '1 role';
        } else {
            displayRoles([]);
        }
    } catch (e) { console.error(e); }
}

function displayRoles(roles) {
    const el = document.getElementById('roles-results');
    if (!roles || roles.length === 0) {
        el.innerHTML = `
          <div class="empty-state">
            <span class="empty-state-icon">🔑</span>
            <div class="empty-state-text">Không tìm thấy role nào</div>
          </div>`;
        return;
    }
    const icons = { admin: '👑', user: '👤', moderator: '🛡️' };
    el.innerHTML = roles.map(r => `
      <div class="role-card">
        <span class="role-icon">${icons[r.name] || '🔑'}</span>
        <div class="role-name">${r.name}</div>
        <div class="role-description">${r.description || 'Không có mô tả'}</div>
        <div class="role-id">${r._id}</div>
      </div>`).join('');
}

// ============================================================
// PRODUCTS
// ============================================================
let isSearching = false;
const searchNotif = document.getElementById('search-notification');

function showSearchNotif(msg, type, dur = 3000) {
    searchNotif.textContent = msg;
    searchNotif.className = `notification ${type}`;
    searchNotif.classList.remove('hidden');
    setTimeout(() => searchNotif.classList.add('hidden'), dur);
}

async function searchProducts() {
    if (isSearching) return;
    isSearching = true;
    const searchTitle = document.getElementById('search-title');
    const searchSlug = document.getElementById('search-slug');
    const searchMinPrice = document.getElementById('search-minPrice');
    const searchMaxPrice = document.getElementById('search-maxPrice');

    const loaders = {
        'search-title': document.getElementById('title-loader'),
        'search-slug': document.getElementById('slug-loader'),
        'search-minPrice': document.getElementById('minPrice-loader'),
        'search-maxPrice': document.getElementById('maxPrice-loader'),
    };
    Object.entries(loaders).forEach(([id, l]) => {
        if (document.getElementById(id)?.value) l.classList.add('active');
    });

    const params = new URLSearchParams();
    if (searchTitle.value) params.append('title', searchTitle.value);
    if (searchSlug.value) params.append('slug', searchSlug.value);
    if (searchMinPrice.value) params.append('minPrice', searchMinPrice.value);
    if (searchMaxPrice.value) params.append('maxPrice', searchMaxPrice.value);

    try {
        const res = await fetch(`${API_BASE}/products?${params}`);
        const data = await res.json();
        if (data.success) {
            displayProducts(data.data);
            document.getElementById('products-count').textContent = `${data.count} products`;
        }
    } catch (e) {
        showSearchNotif('❌ Không thể kết nối server', 'error');
    } finally {
        Object.values(loaders).forEach(l => l.classList.remove('active'));
        isSearching = false;
    }
}

async function getAllProducts() {
    try {
        const res = await fetch(`${API_BASE}/products`);
        const data = await res.json();
        if (data.success) {
            displayProducts(data.data);
            document.getElementById('products-count').textContent = `${data.count} products`;
            document.getElementById('stat-products').textContent = `📦 ${data.count} Products`;
        }
    } catch (e) { console.error(e); }
}

async function getProductById() {
    const id = document.getElementById('product-id').value;
    if (!id) { getAllProducts(); return; }
    try {
        const res = await fetch(`${API_BASE}/products/${id}`);
        const data = await res.json();
        if (data.success) {
            displayProducts([data.data]);
            document.getElementById('products-count').textContent = '1 product';
        } else { displayProducts([]); }
    } catch (e) { console.error(e); }
}

function displayProducts(products) {
    const el = document.getElementById('products-results');
    if (!products || products.length === 0) {
        el.innerHTML = `
          <div class="empty-state">
            <span class="empty-state-icon">📦</span>
            <div class="empty-state-text">Không tìm thấy sản phẩm nào</div>
          </div>`;
        showSearchNotif('❌ Không tìm thấy sản phẩm phù hợp', 'error');
        return;
    }
    el.innerHTML = products.map(p => `
      <div class="product-card">
        <img src="${p.images?.[0] || ''}" alt="${p.title}" class="product-image"
             onerror="this.src='https://via.placeholder.com/280x180?text=No+Image'">
        <div class="product-title">${p.title}</div>
        <div class="product-price">$${p.price}</div>
        <div class="product-category">${p.category?.name || ''}</div>
        <div class="product-slug">${p.slug}</div>
      </div>`).join('');
}

function resetSearch() {
    ['search-title', 'search-slug', 'search-minPrice', 'search-maxPrice', 'product-id']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    searchNotif.classList.add('hidden');
    getAllProducts();
}

// ============================================================
// CATEGORIES
// ============================================================
async function getAllCategories() {
    try {
        const res = await fetch(`${API_BASE}/categories`);
        const data = await res.json();
        if (data.success) {
            displayCategories(data.data);
            document.getElementById('categories-count').textContent = `${data.count} categories`;
        }
    } catch (e) { console.error(e); }
}

async function getCategoryById() {
    const id = document.getElementById('category-id').value;
    if (!id) { getAllCategories(); return; }
    try {
        const res = await fetch(`${API_BASE}/categories/${id}`);
        const data = await res.json();
        if (data.success) {
            displayCategories([data.data]);
            document.getElementById('categories-count').textContent = '1 category';
        } else { displayCategories([]); }
    } catch (e) { console.error(e); }
}

function displayCategories(cats) {
    const el = document.getElementById('categories-results');
    if (!cats || cats.length === 0) {
        el.innerHTML = `
          <div class="empty-state">
            <span class="empty-state-icon">📂</span>
            <div class="empty-state-text">Không tìm thấy danh mục nào</div>
          </div>`;
        return;
    }
    el.innerHTML = cats.map(c => `
      <div class="category-card">
        <img src="${c.image || ''}" alt="${c.name}" class="category-image"
             onerror="this.src='https://via.placeholder.com/80?text=${c.name}'">
        <div class="category-name">${c.name}</div>
        <div class="category-slug">${c.slug}</div>
      </div>`).join('');
}

// ============================================================
// Event Listeners
// ============================================================
const debouncedSearch = debounce(searchProducts, 500);
const debouncedProductId = debounce(getProductById, 500);
const debouncedCategoryId = debounce(getCategoryById, 500);
const debouncedUserId = debounce(getUserById, 500);
const debouncedRoleId = debounce(getRoleById, 500);

document.getElementById('btn-reset-search')?.addEventListener('click', resetSearch);
document.getElementById('search-title')?.addEventListener('input', debouncedSearch);
document.getElementById('search-slug')?.addEventListener('input', debouncedSearch);
document.getElementById('search-minPrice')?.addEventListener('input', debouncedSearch);
document.getElementById('search-maxPrice')?.addEventListener('input', debouncedSearch);
document.getElementById('product-id')?.addEventListener('input', debouncedProductId);
document.getElementById('category-id')?.addEventListener('input', debouncedCategoryId);
document.getElementById('user-id')?.addEventListener('input', debouncedUserId);
document.getElementById('role-id')?.addEventListener('input', debouncedRoleId);

// ============================================================
// Initial Load
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
    getAllUsers();
    getAllRoles();
});
