const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/NNPTUD-C2';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log(`✅ Kết nối MongoDB thành công: ${MONGO_URI}`);
    } catch (error) {
        console.error('❌ Kết nối MongoDB thất bại:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
