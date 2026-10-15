const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const emailService = require('../services/emailService');


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

function parseExpiration(raw) {
    if (raw instanceof Date) return raw.getTime();
    if (typeof raw === 'number') return raw;
    const str = String(raw || '').trim();
    if (!/[+-]\d{2}:?\d{2}$|Z$/.test(str)) {
        return new Date(str.replace(' ', 'T') + 'Z').getTime();
    }
    return new Date(str).getTime();
}

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ message: "L'adresse e-mail est requise." });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const [users] = await db.execute('SELECT id, email FROM users WHERE LOWER(email) = ?', [normalizedEmail]);

        if (!users || users.length === 0) {
            return res.json({
                message: "Si un compte est associé à cette adresse e-mail, vous recevrez un code et un lien de réinitialisation sous peu."
            });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

        await db.execute('DELETE FROM password_resets WHERE LOWER(email) = ?', [normalizedEmail]);
        await db.execute(
            'INSERT INTO password_resets (email, code, token, expires_at) VALUES (?, ?, ?, ?)',
            [normalizedEmail, code, token, expiresAt]
        );

        const defaultOrigin = req.headers.origin || (req.headers.host ? `${req.protocol || 'http'}://${req.headers.host}` : null);
        const appUrl = process.env.APP_URL || defaultOrigin || 'http://localhost';
        const resetUrl = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

        await emailService.sendPasswordResetEmail({
            to: normalizedEmail,
            code,
            resetUrl
        });

        res.json({
            message: "Si un compte est associé à cette adresse e-mail, vous recevrez un code et un lien de réinitialisation sous peu."
        });
    } catch (error) {
        console.error('Erreur forgotPassword:', error);
        res.status(500).json({ message: error.message || "Erreur lors de l'envoi de l'e-mail de réinitialisation." });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, tokenOrCode, token, code, newPassword, password } = req.body;
        const cleanTokenOrCode = (token || tokenOrCode || code || '').trim();
        const rawPassword = newPassword || password;

        if (!cleanTokenOrCode || !rawPassword) {
            return res.status(400).json({ message: "Le code/jeton et le nouveau mot de passe sont requis." });
        }

        if (rawPassword.length < 6) {
            return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères." });
        }

        let records = [];
        let normalizedEmail = '';
        if (email && typeof email === 'string' && email.trim()) {
            normalizedEmail = email.trim().toLowerCase();
            const [result] = await db.execute(
                'SELECT * FROM password_resets WHERE LOWER(email) = ? AND (token = ? OR code = ?) ORDER BY id DESC LIMIT 1',
                [normalizedEmail, cleanTokenOrCode, cleanTokenOrCode]
            );
            records = result;
        } else {
            const [result] = await db.execute(
                'SELECT * FROM password_resets WHERE token = ? OR code = ? ORDER BY id DESC LIMIT 1',
                [cleanTokenOrCode, cleanTokenOrCode]
            );
            records = result;
        }

        if (!records || records.length === 0) {
            return res.status(400).json({ message: "Code ou lien de réinitialisation invalide." });
        }

        const resetRecord = records[0];
        const targetEmail = (resetRecord.email || normalizedEmail || '').toLowerCase();

        const expireTime = parseExpiration(resetRecord.expires_at);
        if (isNaN(expireTime) || expireTime < Date.now()) {
            await db.execute('DELETE FROM password_resets WHERE id = ?', [resetRecord.id]);
            return res.status(400).json({ message: "Ce code ou lien de réinitialisation a expiré. Veuillez refaire une demande." });
        }

        const hashedPassword = await bcrypt.hash(rawPassword, 10);
        await db.execute('UPDATE users SET password_hash = ? WHERE LOWER(email) = ?', [hashedPassword, targetEmail]);
        await db.execute('DELETE FROM password_resets WHERE LOWER(email) = ?', [targetEmail]);

        res.json({ message: "Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant vous connecter." });
    } catch (error) {
        console.error('Erreur resetPassword:', error);
        res.status(500).json({ message: error.message || "Erreur lors de la réinitialisation du mot de passe." });
    }
};


