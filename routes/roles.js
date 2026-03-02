var express = require('express');
var router = express.Router();
const Role = require('../models/Role');

// =============================================================
// GET /roles - Lấy tất cả roles (chưa bị xoá mềm)
// =============================================================
router.get('/', async function (req, res, next) {
    try {
        const roles = await Role.find({ isDeleted: { $ne: true } });
        res.json({
            success: true,
            count: roles.length,
            data: roles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách roles',
            error: error.message
        });
    }
});

// =============================================================
// GET /roles/:id - Lấy role theo ID
// =============================================================
router.get('/:id', async function (req, res, next) {
    try {
        const role = await Role.findOne({ _id: req.params.id, isDeleted: { $ne: true } });

        if (!role) {
            return res.status(404).json({
                success: false,
                message: `Không tìm thấy role với ID: ${req.params.id}`
            });
        }

        res.json({ success: true, data: role });
    } catch (error) {
        // Xử lý lỗi ID không đúng định dạng ObjectId
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy role',
            error: error.message
        });
    }
});

// =============================================================
// POST /roles - Tạo role mới
// =============================================================
router.post('/', async function (req, res, next) {
    try {
        const { name, description } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, message: 'Trường "name" là bắt buộc' });
        }

        // Kiểm tra unique (kể cả đã bị xoá mềm không cho tạo trùng tên)
        const existing = await Role.findOne({ name: name.trim(), isDeleted: { $ne: true } });
        if (existing) {
            return res.status(409).json({ success: false, message: `Role "${name}" đã tồn tại` });
        }

        const newRole = await Role.create({
            name: name.trim(),
            description: description !== undefined ? description : ''
        });

        res.status(201).json({
            success: true,
            message: 'Tạo role thành công',
            data: newRole
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Tên role đã tồn tại' });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo role',
            error: error.message
        });
    }
});

// =============================================================
// PUT /roles/:id - Cập nhật role
// =============================================================
router.put('/:id', async function (req, res, next) {
    try {
        const { name, description } = req.body;
        const updateData = {};

        if (name !== undefined) {
            if (name.trim() === '') {
                return res.status(400).json({ success: false, message: '"name" không được để trống' });
            }
            // Kiểm tra duplicate tên (bỏ qua chính nó)
            const duplicate = await Role.findOne({
                name: name.trim(),
                isDeleted: { $ne: true },
                _id: { $ne: req.params.id }
            });
            if (duplicate) {
                return res.status(409).json({ success: false, message: `Role "${name}" đã tồn tại` });
            }
            updateData.name = name.trim();
        }

        if (description !== undefined) updateData.description = description;

        const updated = await Role.findOneAndUpdate(
            { _id: req.params.id, isDeleted: { $ne: true } },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: `Không tìm thấy role với ID: ${req.params.id}`
            });
        }

        res.json({ success: true, message: 'Cập nhật role thành công', data: updated });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
        }
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Tên role đã tồn tại' });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật role',
            error: error.message
        });
    }
});

// =============================================================
// DELETE /roles/:id - Xoá mềm (soft delete)
// =============================================================
router.delete('/:id', async function (req, res, next) {
    try {
        const deleted = await Role.findOneAndUpdate(
            { _id: req.params.id, isDeleted: { $ne: true } },
            { $set: { isDeleted: true } },
            { new: true }
        );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: `Không tìm thấy role với ID: ${req.params.id}`
            });
        }

        res.json({
            success: true,
            message: 'Xoá role thành công (xoá mềm)',
            data: { _id: deleted._id, name: deleted.name, isDeleted: deleted.isDeleted }
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xoá role',
            error: error.message
        });
    }
});

module.exports = router;
