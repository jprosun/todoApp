const express = require('express');
const session = require('express-session');
const path = require('path');
const { engine } = require('express-handlebars');
const pool = require('./db');
const authRouter = require('./routes/auth');
const todoApiRouter = require('./routes/todo');

const app = express();

app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: { eq: (a, b) => a === b }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
    name: 'sid',
    secret: 'bí mật',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, maxAge: 1000 * 60 * 30 }
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRouter);
app.use('/api/todos', todoApiRouter);

app.get('/todos', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
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
        return res.status(500).send('Lỗi server, không thể tải tasks.');
    }
});

app.get('/', (req, res) => res.redirect('/auth/login'));

app.get('/ping', (req, res) => res.send('pong'));

app.use((req, res) => res.status(404).send('Page not found'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});
