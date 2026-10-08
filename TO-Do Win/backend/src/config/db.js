const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

let dbInstance = null;
let initPromise = null;

async function getDb() {
    if (dbInstance) return dbInstance;
    if (initPromise) return initPromise;
    initPromise = (async () => {
        const SQL = await initSqlJs();
        if (fs.existsSync(dbPath)) {
            try {
                const buffer = fs.readFileSync(dbPath);
                dbInstance = new SQL.Database(buffer);
            } catch (err) {
                console.warn('Erreur lecture SQLite, nouvelle base créée:', err);
                dbInstance = new SQL.Database();
                saveDb(dbInstance);
            }
        } else {
            dbInstance = new SQL.Database();
            saveDb(dbInstance);
        }
        return dbInstance;
    })();
    return initPromise;
}

function saveDb(db) {
    try {
        const data = db.export();
        fs.writeFileSync(dbPath, Buffer.from(data));
    } catch (e) {
        console.error('Erreur sauvegarde SQLite sur le disque:', e);
    }
}

const execute = async (sql, params = []) => {
    const db = await getDb();
    const cleanSql = sql.trim();
    const isSelect = cleanSql.toUpperCase().startsWith('SELECT') || cleanSql.toUpperCase().startsWith('SHOW');

    if (isSelect) {
        const stmt = db.prepare(cleanSql);
        stmt.bind(params);
        const rows = [];
        while (stmt.step()) {
            rows.push(stmt.getAsObject());
        }
        stmt.free();
        return [rows];
    } else {
        db.run(cleanSql, params);
        let insertId = 0;
        let affectedRows = 0;
        try {
            const res = db.exec("SELECT last_insert_rowid() AS lastId, changes() AS changes;");
            if (res && res[0] && res[0].values && res[0].values[0]) {
                insertId = res[0].values[0][0];
                affectedRows = res[0].values[0][1];
            }
        } catch (_) {}
        saveDb(db);
        return [{ insertId, affectedRows }];
    }
};

const ensureTables = async () => {
    try {
        await execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                first_name TEXT,
                last_name TEXT,
                avatar_url TEXT
            )
        `);
        await execute(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'todo',
                due_date DATE,
                due_time TIME,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        `);
        await execute(`
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id INTEGER NOT NULL,
                stored_name TEXT NOT NULL,
                original_name TEXT,
                mime_type TEXT,
                FOREIGN KEY(task_id) REFERENCES tasks(id)
            )
        `);
        await execute(`
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL DEFAULT 'Document sans titre',
                content TEXT DEFAULT '',
                pinned INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        `);
    } catch (e) {
        console.error('Erreur initialisation tables SQLite:', e);
    }
};

ensureTables();

module.exports = { execute };
