const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/todos');
    res.render('auth/login', { title: 'Login', styles: ['/css/style.css'], scripts: [], error: null });
});

router.get('/signup', (req, res) => {
    if (req.session.user) return res.redirect('/todos');
    res.render('auth/signup', { title: 'Signup', styles: ['/css/style.css'], scripts: [], error: null });
});

router.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).render('auth/signup', { title: 'Signup', styles: ['/css/style.css'], scripts: [], error: 'Vui lòng nhập đủ' });
    }
    try {
        await pool.query(
            'INSERT INTO users(username,password) VALUES($1,$2)',
            [username, password]
        );
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).render('auth/signup', { title: 'Signup', styles: ['/css/style.css'], scripts: [], error: 'Username đã tồn tại' });
        }
        throw err;
    }
    const { rows } = await pool.query(
        'SELECT id FROM users WHERE username = $1',
        [username]
    );
    req.session.user = { id: rows[0].id, username };
    res.redirect('/todos');
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const { rows } = await pool.query(
        'SELECT id, password FROM users WHERE username = $1',
        [username]
    );
    if (rows.length === 0 || rows[0].password !== password) {
        return res.status(400).render('auth/login', { title: 'Login', styles: ['/css/style.css'], scripts: [], error: 'Sai thông tin đăng nhập' });
    }
    req.session.user = { id: rows[0].id, username };
    res.redirect('/todos');
});

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send('Logout thất bại');
        res.clearCookie('sid');
        res.redirect('/auth/login');
    });
});


module.exports = router;
