const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const noteController = require('../controllers/noteController');
const authMiddleware = require('../middleware/authMiddleware');

const fileFilter = (req, file, cb) => {
  const allowedExts = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

  if (allowedExts.includes(ext) || allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Word, and PowerPoint files are allowed.'), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.get('/search', noteController.searchNotes);
router.get('/mine', authMiddleware, noteController.getMyNotes);
router.get('/semester/:sem', noteController.getNotesBySemester);
router.get('/', noteController.getNotes);
router.get('/:id/file', noteController.serveNoteFile);
router.get('/:id', noteController.getNoteById);
router.post('/upload', authMiddleware, upload.single('pdf'), noteController.uploadNote);
router.post('/:id/download', authMiddleware, noteController.incrementDownloads);
router.delete('/:id', authMiddleware, noteController.deleteNote);

module.exports = router;
