const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        const [existingUsers] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            'INSERT INTO users (email, password_hash, first_name, last_name, avatar_url) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, firstName || null, lastName || null, null]
        );
        
        const userId = result.insertId;
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            id: userId,
            email,
            firstName: firstName || null,
            lastName: lastName || null,
            avatarUrl: null
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            avatarUrl: user.avatar_url
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.me = async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, email, first_name, last_name, avatar_url FROM users WHERE id = ?', [req.userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = users[0];
        res.json({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            avatarUrl: user.avatar_url
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName } = req.body;
        await db.execute('UPDATE users SET first_name = ?, last_name = ? WHERE id = ?', [firstName || null, lastName || null, req.userId]);
        const [users] = await db.execute('SELECT id, email, first_name, last_name, avatar_url FROM users WHERE id = ?', [req.userId]);
        const user = users[0];
        res.json({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            avatarUrl: user.avatar_url
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier fourni' });
        }
        const avatarUrl = `/api/uploads/${req.file.filename}`;
        await db.execute('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, req.userId]);
        const [users] = await db.execute('SELECT id, email, first_name, last_name, avatar_url FROM users WHERE id = ?', [req.userId]);
        const user = users[0];
        res.json({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            avatarUrl: user.avatar_url
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteAvatar = async (req, res) => {
    try {
        await db.execute('UPDATE users SET avatar_url = NULL WHERE id = ?', [req.userId]);
        const [users] = await db.execute('SELECT id, email, first_name, last_name, avatar_url FROM users WHERE id = ?', [req.userId]);
        const user = users[0];
        res.json({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            avatarUrl: null
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.setAvatarPreset = async (req, res) => {
    try {
        const { avatarUrl } = req.body;
        await db.execute('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl || null, req.userId]);
        const [users] = await db.execute('SELECT id, email, first_name, last_name, avatar_url FROM users WHERE id = ?', [req.userId]);
        const user = users[0];
        res.json({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            avatarUrl: user.avatar_url
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
