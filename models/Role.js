const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Tên role là bắt buộc'],
            unique: true,
            trim: true
        },
        description: {
            type: String,
            default: ''
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true // tự động thêm createdAt, updatedAt
    }
);

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
