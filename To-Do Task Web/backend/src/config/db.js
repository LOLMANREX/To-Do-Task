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

const ensureDatabase = async () => {
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

    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL DEFAULT 'Document sans titre',
                content LONGTEXT,
                pinned TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_notes_user (user_id)
            )
        `);
    } catch (e) {
        console.error('Error ensuring notes table in web db:', e);
    }
};

ensureDatabase();

module.exports = pool;
