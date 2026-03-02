const express = require('express');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware - cho phép frontend gọi API
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// Serve static files từ thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const indexRouter = require('./routes/index');
const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const usersRouter = require('./routes/users');
const rolesRouter = require('./routes/roles');

// Use routes
app.use('/', indexRouter);
app.use('/products', productsRouter);
app.use('/categories', categoriesRouter);
app.use('/users', usersRouter);
app.use('/roles', rolesRouter);

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Route không tồn tại'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra trên server',
        error: err.message
    });
});

// Kết nối MongoDB trước, sau đó mới start server
(async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🚀 Server đang chạy tại:                                  ║
║   📍 http://localhost:${PORT}                                  ║
║   🍃 MongoDB: NNPTUD-C2 (localhost:27017)                    ║
║                                                              ║
║   👤 USER Endpoints:                                        ║
║   • GET    /users              - Lấy tất cả users           ║
║   • GET    /users/:id          - Lấy user theo ID           ║
║   • POST   /users              - Tạo user mới               ║
║   • PUT    /users/:id          - Cập nhật user              ║
║   • DELETE /users/:id          - Xoá mềm user               ║
║   • POST   /users/enable       - Kích hoạt user             ║
║   • POST   /users/disable      - Vô hiệu hoá user           ║
║                                                              ║
║   🔑 ROLE Endpoints:                                        ║
║   • GET    /roles              - Lấy tất cả roles           ║
║   • GET    /roles/:id          - Lấy role theo ID           ║
║   • POST   /roles              - Tạo role mới               ║
║   • PUT    /roles/:id          - Cập nhật role              ║
║   • DELETE /roles/:id          - Xoá mềm role               ║
║                                                              ║
║   💡 Seed dữ liệu mẫu: node seed.js                        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
        `);
    });
})();

module.exports = app;
