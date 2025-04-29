const path = require('path');
require('dotenv').config({
    path: path.resolve(__dirname, '.env')
});

const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.PGHOST,
    port: parseInt(process.env.PGPORT, 10),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
});
pool
    .query('SELECT NOW()')
    .then(res => console.log('Postgres connected at', res.rows[0].now))
    .catch(err => console.error('Postgres connection error:', err.message));

module.exports = pool;
