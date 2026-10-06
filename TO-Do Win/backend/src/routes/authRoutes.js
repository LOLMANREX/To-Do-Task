const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

const uploadsDir = process.env.UPLOADS_PATH || (fs.existsSync('/app/uploads') ? '/app/uploads' : path.join(__dirname, '../../uploads'));
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.me);
router.put('/profile', auth, authController.updateProfile);
router.post('/avatar', auth, upload.single('avatar'), authController.uploadAvatar);
router.delete('/avatar', auth, authController.deleteAvatar);
router.put('/avatar-preset', auth, authController.setAvatarPreset);

module.exports = router;
