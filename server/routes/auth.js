const express = require('express');
const pool = require('../db');
const bcrypt = require('bcrypt');
const router = express.Router();

router.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/todos');
    res.render('auth/login', {
        title: 'Login',
        styles: ['/css/style.css'],
        scripts: [],
        error: null
    });
});

router.get('/signup', (req, res) => {
    if (req.session.user) return res.redirect('/todos');
    res.render('auth/signup', {
        title: 'Signup',
        styles: ['/css/style.css'],
        scripts: [],
        error: null
    });
});
router.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).render('auth/signup', {
            title: 'Signup',
            styles: ['/css/style.css'],
            scripts: [],
            error: 'Vui lòng nhập đầy đủ username và password'
        });
    }
    try {
        const hash = await bcrypt.hash(password, 10);
        const { rows } = await pool.query(
            'INSERT INTO users(username, password) VALUES($1, $2) RETURNING id',
            [username, hash]
        );
        req.session.user = { id: rows[0].id, username };
        res.redirect('/todos');
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).render('auth/signup', {
                title: 'Signup',
                styles: ['/css/style.css'],
                scripts: [],
                error: 'Username đã tồn tại'
            });
        }
        res.status(500).render('auth/signup', {
            title: 'Signup',
            styles: ['/css/style.css'],
            scripts: [],
            error: 'Lỗi server, vui lòng thử lại'
        });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).render('auth/login', {
            title: 'Login',
            styles: ['/css/style.css'],
            scripts: [],
            error: 'Vui lòng nhập đầy đủ username và password'
        });
    }
    try {
        const { rows } = await pool.query(
            'SELECT id, password FROM users WHERE username = $1',
            [username]
        );
        if (rows.length === 0) {
            return res.status(400).render('auth/login', {
                title: 'Login',
                styles: ['/css/style.css'],
                scripts: [],
                error: 'Không tìm thấy user'
            });
        }
        const user = rows[0];
        let match = false;
        if (user.password.startsWith('$2')) {
            match = await bcrypt.compare(password, user.password);
        } else {
            if (password === user.password) {
                match = true;
                const newHash = await bcrypt.hash(password, 10);
                await pool.query(
                    'UPDATE users SET password = $1 WHERE id = $2',
                    [newHash, user.id]
                );
            }
        }
        if (!match) {
            return res.status(400).render('auth/login', {
                title: 'Login',
                styles: ['/css/style.css'],
                scripts: [],
                error: 'Sai thông tin đăng nhập'
            });
        }
        req.session.user = { id: user.id, username };
        res.redirect('/todos');
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).render('auth/login', {
            title: 'Login',
            styles: ['/css/style.css'],
            scripts: [],
            error: 'Lỗi server, vui lòng thử lại'
        });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Logout thất bại');
        }
        res.clearCookie('sid');
        res.redirect('/auth/login');
    });
});

module.exports = router;
