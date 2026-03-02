var express = require('express');
var router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');

// =============================================================
// POST /users/enable  — PHẢI đặt trước /:id để tránh xung đột route
// Kích hoạt user: chuyển status → true
// Body: { email, username }
// =============================================================
router.post('/enable', async function (req, res, next) {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp cả "email" và "username"'
      });
    }

    const emailNorm = email.trim().toLowerCase();
    const usernameNorm = username.trim();

    // Debug: log ra để kiểm tra
    console.log('[enable] Tìm user với email:', emailNorm, '| username:', usernameNorm);

    // Tìm bằng email trước để cho biết lỗi cụ thể hơn
    const userByEmail = await User.findOne({ email: emailNorm });
    console.log('[enable] Tìm theo email:', userByEmail ? `Tìm thấy (username: ${userByEmail.username}, isDeleted: ${userByEmail.isDeleted})` : 'Không tìm thấy');

    if (!userByEmail) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy user với email: ${emailNorm}`
      });
    }

    if (userByEmail.username !== usernameNorm) {
      return res.status(404).json({
        success: false,
        message: 'Username không khớp với email đã cung cấp'
      });
    }

    if (userByEmail.isDeleted === true) {
      return res.status(410).json({
        success: false,
        message: 'User này đã bị xoá khỏi hệ thống'
      });
    }

    userByEmail.status = true;
    await userByEmail.save();

    res.json({
      success: true,
      message: `Kích hoạt user "${userByEmail.username}" thành công`,
      data: { _id: userByEmail._id, username: userByEmail.username, email: userByEmail.email, status: userByEmail.status }
    });
  } catch (error) {
    console.error('[enable] Lỗi:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kích hoạt user',
      error: error.message
    });
  }
});

// =============================================================
// POST /users/disable  — PHẢI đặt trước /:id để tránh xung đột route
// Vô hiệu hoá user: chuyển status → false
// Body: { email, username }
// =============================================================
router.post('/disable', async function (req, res, next) {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp cả "email" và "username"'
      });
    }

    const emailNorm = email.trim().toLowerCase();
    const usernameNorm = username.trim();

    // Debug: log ra để kiểm tra
    console.log('[disable] Tìm user với email:', emailNorm, '| username:', usernameNorm);

    const userByEmail = await User.findOne({ email: emailNorm });
    console.log('[disable] Tìm theo email:', userByEmail ? `Tìm thấy (username: ${userByEmail.username}, isDeleted: ${userByEmail.isDeleted})` : 'Không tìm thấy');

    if (!userByEmail) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy user với email: ${emailNorm}`
      });
    }

    if (userByEmail.username !== usernameNorm) {
      return res.status(404).json({
        success: false,
        message: 'Username không khớp với email đã cung cấp'
      });
    }

    if (userByEmail.isDeleted === true) {
      return res.status(410).json({
        success: false,
        message: 'User này đã bị xoá khỏi hệ thống'
      });
    }

    userByEmail.status = false;
    await userByEmail.save();

    res.json({
      success: true,
      message: `Vô hiệu hoá user "${userByEmail.username}" thành công`,
      data: { _id: userByEmail._id, username: userByEmail.username, email: userByEmail.email, status: userByEmail.status }
    });
  } catch (error) {
    console.error('[disable] Lỗi:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi vô hiệu hoá user',
      error: error.message
    });
  }
});

// =============================================================
// GET /users - Lấy tất cả users (chưa bị xoá mềm)
// =============================================================
router.get('/', async function (req, res, next) {
  try {
    const users = await User.find({ isDeleted: { $ne: true } }).populate('role', 'name description');
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách users',
      error: error.message
    });
  }
});

// =============================================================
// GET /users/:id - Lấy user theo ID
// =============================================================
router.get('/:id', async function (req, res, next) {
  try {
    const user = await User.findOne({ _id: req.params.id, isDeleted: { $ne: true } }).populate('role', 'name description');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy user với ID: ${req.params.id}`
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy user',
      error: error.message
    });
  }
});

// =============================================================
// POST /users - Tạo user mới
// =============================================================
router.post('/', async function (req, res, next) {
  try {
    const { username, password, email, fullName, avatarUrl, role, loginCount } = req.body;

    // Validate required
    if (!username || username.trim() === '') {
      return res.status(400).json({ success: false, message: 'Trường "username" là bắt buộc' });
    }
    if (!password || password.trim() === '') {
      return res.status(400).json({ success: false, message: 'Trường "password" là bắt buộc' });
    }
    if (!email || email.trim() === '') {
      return res.status(400).json({ success: false, message: 'Trường "email" là bắt buộc' });
    }

    // Validate loginCount
    if (loginCount !== undefined) {
      const parsed = Number(loginCount);
      if (isNaN(parsed) || parsed < 0) {
        return res.status(400).json({ success: false, message: '"loginCount" phải là số nguyên >= 0' });
      }
    }

    // Validate role tồn tại
    if (role) {
      const roleExists = await Role.findOne({ _id: role, isDeleted: false });
      if (!roleExists) {
        return res.status(400).json({ success: false, message: `Role với ID "${role}" không tồn tại` });
      }
    }

    const newUser = await User.create({
      username: username.trim(),
      password,
      email: email.trim().toLowerCase(),
      fullName: fullName !== undefined ? fullName : '',
      avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
      role: role || null,
      loginCount: loginCount !== undefined ? Number(loginCount) : 0
    });

    res.status(201).json({
      success: true,
      message: 'Tạo user thành công',
      data: newUser
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({ success: false, message: `${field} đã tồn tại` });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo user',
      error: error.message
    });
  }
});

// =============================================================
// PUT /users/:id - Cập nhật user
// =============================================================
router.put('/:id', async function (req, res, next) {
  try {
    const { username, password, email, fullName, avatarUrl, role, loginCount } = req.body;
    const updateData = {};

    if (username !== undefined) updateData.username = username.trim();
    if (password !== undefined) updateData.password = password;
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (fullName !== undefined) updateData.fullName = fullName;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    if (loginCount !== undefined) {
      const parsed = Number(loginCount);
      if (isNaN(parsed) || parsed < 0) {
        return res.status(400).json({ success: false, message: '"loginCount" phải là số nguyên >= 0' });
      }
      updateData.loginCount = parsed;
    }

    if (role !== undefined) {
      if (role !== null) {
        const roleExists = await Role.findOne({ _id: role, isDeleted: false });
        if (!roleExists) {
          return res.status(400).json({ success: false, message: `Role với ID "${role}" không tồn tại` });
        }
      }
      updateData.role = role;
    }

    const updated = await User.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('role', 'name description');

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy user với ID: ${req.params.id}`
      });
    }

    res.json({ success: true, message: 'Cập nhật user thành công', data: updated });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({ success: false, message: `${field} đã tồn tại` });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật user',
      error: error.message
    });
  }
});

// =============================================================
// DELETE /users/:id - Xoá mềm (soft delete)
// =============================================================
router.delete('/:id', async function (req, res, next) {
  try {
    const deleted = await User.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy user với ID: ${req.params.id}`
      });
    }

    res.json({
      success: true,
      message: 'Xoá user thành công (xoá mềm)',
      data: { _id: deleted._id, username: deleted.username, isDeleted: deleted.isDeleted }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xoá user',
      error: error.message
    });
  }
});

module.exports = router;
