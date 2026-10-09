const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const auth = require('../middlewares/auth');

router.use(auth);

router.get('/', noteController.getNotes);
router.get('/:id', noteController.getNoteById);
router.post('/', noteController.createNote);
router.put('/:id', noteController.updateNote);
router.patch('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

module.exports = router;
