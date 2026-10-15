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
    queueLimit: 0,
    dateStrings: true
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
        const [taskCols] = await pool.query('SHOW COLUMNS FROM tasks');
        const taskNames = taskCols.map(c => c.Field);
        if (!taskNames.includes('priority')) {
            await pool.query("ALTER TABLE tasks ADD COLUMN priority VARCHAR(20) DEFAULT 'medium'");
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

    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS password_resets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                code VARCHAR(10) NOT NULL,
                token VARCHAR(255) NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_pwd_resets_email (email),
                INDEX idx_pwd_resets_token (token)
            )
        `);
    } catch (e) {
        console.error('Error ensuring password_resets table in web db:', e);
    }
};

ensureDatabase();

module.exports = pool;
