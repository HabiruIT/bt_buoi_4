/**
 * seed.js - Chạy 1 lần để insert dữ liệu mẫu vào MongoDB
 * Cách dùng: node seed.js
 */
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Role = require('./models/Role');
const User = require('./models/User');

const seedRoles = [
    { name: 'admin', description: 'Quản trị viên hệ thống' },
    { name: 'user', description: 'Người dùng thông thường' }
];

const run = async () => {
    await connectDB();

    // Xoá dữ liệu cũ
    await Role.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Đã xoá dữ liệu cũ');

    // Tạo roles
    const [adminRole, userRole] = await Role.insertMany(seedRoles);
    console.log('✅ Đã tạo roles:', adminRole.name, userRole.name);

    // Tạo users
    const seedUsers = [
        {
            username: 'admin',
            password: 'hashed_password_admin',
            email: 'admin@example.com',
            fullName: 'Admin User',
            status: true,
            role: adminRole._id,
            loginCount: 5
        },
        {
            username: 'john_doe',
            password: 'hashed_password_john',
            email: 'john@example.com',
            fullName: 'John Doe',
            status: false,
            role: userRole._id,
            loginCount: 2
        },
        {
            username: 'jane_smith',
            password: 'hashed_password_jane',
            email: 'jane@example.com',
            fullName: 'Jane Smith',
            status: false,
            role: userRole._id,
            loginCount: 0
        }
    ];

    await User.insertMany(seedUsers);
    console.log('✅ Đã tạo', seedUsers.length, 'users');

    console.log('\n🎉 Seed thành công!');
    process.exit(0);
};

run().catch(err => {
    console.error('❌ Seed lỗi:', err.message);
    process.exit(1);
});
