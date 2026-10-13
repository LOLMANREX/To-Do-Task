const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'todo_desktop_jwt_secret_fallback_key_2026';

const auth = (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = auth;
