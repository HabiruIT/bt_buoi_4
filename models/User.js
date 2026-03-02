const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username là bắt buộc'],
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, 'Password là bắt buộc']
        },
        email: {
            type: String,
            required: [true, 'Email là bắt buộc'],
            unique: true,
            trim: true,
            lowercase: true
        },
        fullName: {
            type: String,
            default: ''
        },
        avatarUrl: {
            type: String,
            default: 'https://i.sstatic.net/l60Hf.png'
        },
        status: {
            type: Boolean,
            default: false
        },
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role',
            default: null
        },
        loginCount: {
            type: Number,
            default: 0,
            min: [0, 'loginCount không được âm']
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

const User = mongoose.model('User', userSchema);

module.exports = User;
