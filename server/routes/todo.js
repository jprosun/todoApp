const express = require('express');
const pool = require('../db');
const router = express.Router();

router.use((req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
});

router.get('/', async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { rows: tasks } = await pool.query(
            'SELECT id, text, checked FROM todos WHERE user_id = $1 ORDER BY id',
            [userId]
        );
        res.render('todos/todo', {
            title: 'Your Tasks',
            username: req.session.user.username,
            tasks,
            styles: ['/css/inputTask.css'],
            scripts: [{ src: '/js/index.js', type: 'module' }]
        });
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).send('Lỗi server, không thể tải tasks.');
    }
});

router.post('/add', async (req, res) => {
    const { text } = req.body;
    if (!text || !text.trim()) {
        return res.redirect('/todos');
    }
    try {
        await pool.query(
            'INSERT INTO todos(user_id, text) VALUES($1, $2)',
            [req.session.user.id, text.trim()]
        );
        res.redirect('/todos');
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).send('Lỗi server khi tạo task');
    }
});

router.post('/:id/toggle', async (req, res) => {
    const id = req.params.id;
    try {
        await pool.query(
            'UPDATE todos SET checked = NOT checked WHERE id = $1 AND user_id = $2',
            [id, req.session.user.id]
        );
        res.redirect('/todos');
    } catch (err) {
        console.error('Error toggling task:', err);
        res.status(500).send('Lỗi server khi cập nhật task');
    }
});

router.post('/:id/delete', async (req, res) => {
    const id = req.params.id;
    try {
        await pool.query(
            'DELETE FROM todos WHERE id = $1 AND user_id = $2',
            [id, req.session.user.id]
        );
        res.redirect('/todos');
    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).send('Lỗi server khi xóa task');
    }
});

router.get('/:id/edit', async (req, res) => {
    const id = req.params.id;
    try {
        const { rows } = await pool.query(
            'SELECT id, text FROM todos WHERE id = $1 AND user_id = $2',
            [id, req.session.user.id]
        );
        if (!rows.length) return res.redirect('/todos');
        res.render('todos/edit', {
            title: 'Edit Task',
            task: rows[0],
            styles: ['/css/inputTask.css'],
            scripts: []
        });
    } catch (err) {
        console.error('Error loading edit page:', err);
        res.status(500).send('Lỗi server khi tải trang chỉnh sửa');
    }
});

router.post('/:id/edit', async (req, res) => {
    const id = req.params.id;
    const { text } = req.body;
    if (!text || !text.trim()) {
        return res.redirect(`/todos/${id}/edit`);
    }
    try {
        await pool.query(
            'UPDATE todos SET text = $1 WHERE id = $2 AND user_id = $3',
            [text.trim(), id, req.session.user.id]
        );
        res.redirect('/todos');
    } catch (err) {
        console.error('Error saving edit:', err);
        res.status(500).send('Lỗi server khi lưu chỉnh sửa');
    }
});

module.exports = router;
