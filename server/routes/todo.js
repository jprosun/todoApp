const express = require('express');
const pool = require('../db');
const router = express.Router();

router.use((req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập' });
    }
    next();
});

router.get('/', async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { rows } = await pool.query(
            'SELECT id, text, checked FROM todos WHERE user_id = $1 ORDER BY id',
            [userId]
        );
        res.json({ success: true, todos: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách' });
    }
});

router.post('/', async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ success: false, message: 'Text is required' });
    }
    try {
        const userId = req.session.user.id;
        const { rows } = await pool.query(
            'INSERT INTO todos(user_id, text) VALUES($1, $2) RETURNING id, text, checked',
            [userId, text]
        );
        res.json({ success: true, todo: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server khi tạo task' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { text, checked } = req.body;
    if (text === undefined && checked === undefined) {
        return res.status(400).json({ success: false, message: 'No fields to update' });
    }
    try {
        const userId = req.session.user.id;
        const fields = [];
        const values = [];
        let idx = 1;
        if (text !== undefined) {
            fields.push(`text = $${idx}`);
            values.push(text);
            idx++;
        }
        if (checked !== undefined) {
            fields.push(`checked = $${idx}`);
            values.push(checked);
            idx++;
        }
        values.push(id, userId);
        const query = `UPDATE todos SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING id, text, checked`;
        const { rows } = await pool.query(query, values);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.json({ success: true, todo: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { rowCount } = await pool.query(
            'DELETE FROM todos WHERE id = $1 AND user_id = $2',
            [req.params.id, userId]
        );
        if (rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server khi xóa task' });
    }
});

module.exports = router;
