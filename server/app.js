const express = require('express');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const path = require('path');
const { engine } = require('express-handlebars');
const pool = require('./db');

const authRouter = require('./routes/auth');
const todoRouter = require('./routes/todo');

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
    store: new PgSession({ pool, tableName: 'session' }),
    name: 'sid',
    secret: 'bí mật',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
    }
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRouter);
app.use('/todos', todoRouter);

app.get('/', (req, res) => {
    res.redirect('/todos');
});

app.use((req, res) => {
    res.status(404).send('Page not found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});