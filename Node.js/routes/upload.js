
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, adminOnly } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const allowedMimeTypes = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',

  // Videos
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',

  // Audio
  'audio/mpeg',      // mp3
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',       // m4a
  'audio/x-m4a',
  'audio/ogg',
  'audio/aac',
];

const allowedExtensions = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.mp4',
  '.webm',
  '.mov',
  '.m4v',
  '.mp3',
  '.wav',
  '.m4a',
  '.ogg',
  '.aac',
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  console.log('Original name:', file.originalname);
  console.log('Extension:', ext);
  console.log('Mime type:', file.mimetype);

  const validExtension = allowedExtensions.includes(ext);
  const validMime =
    allowedMimeTypes.includes(file.mimetype) ||
    file.mimetype === 'application/octet-stream';

  if (validExtension && validMime) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type. Extension: ${ext}, MIME: ${file.mimetype}`
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});

router.post(
  '/',
  protect,
  adminOnly,
  upload.single('file'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message: 'No file uploaded',
      });
    }

    const ext = path
      .extname(req.file.originalname)
      .toLowerCase()
      .replace('.', '');

    let kind = 'image';

    if (['mp4', 'webm', 'mov', 'm4v'].includes(ext)) {
      kind = 'video';
    } else if (['mp3', 'wav', 'm4a', 'ogg', 'aac'].includes(ext)) {
      kind = 'audio';
    }

    const url = `${req.protocol}://${req.get(
      'host'
    )}/uploads/${req.file.filename}`;

    res.json({
      url,
      kind,
      filename: req.file.filename,
    });
  }
);

module.exports = router;
