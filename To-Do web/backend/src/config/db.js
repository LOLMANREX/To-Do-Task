const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const ensureColumns = async () => {
    try {
        const [columns] = await pool.query('SHOW COLUMNS FROM users');
        const names = columns.map(c => c.Field);
        if (!names.includes('first_name')) {
            await pool.query('ALTER TABLE users ADD COLUMN first_name VARCHAR(100) DEFAULT NULL');
        }
        if (!names.includes('last_name')) {
            await pool.query('ALTER TABLE users ADD COLUMN last_name VARCHAR(100) DEFAULT NULL');
        }
        if (!names.includes('avatar_url')) {
            await pool.query('ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) DEFAULT NULL');
        }
    } catch (e) {
    }
};

ensureColumns();

module.exports = pool;
