const { isAdmin } = require('../config/env');
const express = require('express');
const path = require('path');
const fs = require('fs-extra'); // writeJson, readJson, ensureDir 등 사용
const multer = require('multer')
const crypto = require('crypto')


const router = express.Router();

const NOTES_DIR = path.join(__dirname, '..', 'labdata', 'notes');
const IMAGES_DIR = path.join(__dirname, '..', 'labdata', 'images');
fs.ensureDirSync(NOTES_DIR);
fs.ensureDirSync(IMAGES_DIR);

router.use('/images', express.static(IMAGES_DIR));

const extFromMime = mime => {
  if (mime === 'image/png') return '.png';
  if (mime === 'image/jpeg') return '.jpg';
  if (mime === 'image/gif') return '.gif';
  if (mime === 'image/webp') return '.webp';
  if (mime === 'image/bmp') return '.bmp';
  if (mime === 'image/svg+xml') return '.svg';
  return '';
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMAGES_DIR),
  filename: (req, file, cb) => {
    const rawExt = path.extname(file.originalname || '');
    const ext = rawExt || extFromMime(file.mimetype);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) return cb(new Error('Only images'));
    cb(null, true);
  },
})

router.post('/image/upload', async (req, res, next) => {
  try {
    if (!isAdmin(req.session)) await notes.assertEditable(req.query.noteId, req.session);
    next();
  } catch (error) { res.status(error.status || 500).json({ message: error.message }); }
}, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '파일이 없습니다' });
  }

  const filename = req.file.filename;
  const url = `/api/lab/images/${encodeURIComponent(filename)}`;

  return res.json({ filename, url });
});

router.delete('/image/delete/:filename', async (req, res) => {
  if (!(isAdmin(req.session))) {
    return res.status(403).json({ message: '권한이 없습니다' });
  }

  const { filename } = req.params;
  if (!filename) return res.status(400).json({ message: 'filename이 필요합니다' });
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    return res.status(400).json({ message: '잘못된 파일명입니다' });
  }

  try {
    const filePath = path.join(IMAGES_DIR, filename);
    const exists = await fs.pathExists(filePath);
    if (!exists) return res.status(404).json({ message: '이미지를 찾을 수 없습니다' });

    await fs.remove(filePath);
    return res.json({ success: true });
  } catch (err) {
    console.error('이미지 삭제 실패:', err);
    return res.status(500).json({ message: '이미지 삭제 중 오류가 발생했습니다' });
  }
});



const { createNoteStore } = require('../config/note-store');
const notes = createNoteStore(NOTES_DIR);
const ready = Promise.all(['jobs1944', 'khs'].map(username => notes.ensureUserFolder(username)));
ready.catch(error => console.error('사용자 폴더 생성 실패:', error));
const respond = handler => async (req, res) => {
  try { await ready; res.json(await handler(req)); }
  catch (error) {
    console.error('문서 요청 실패:', error);
    res.status(error.status || 500).json({ message: error.status ? error.message : '문서 처리 중 오류가 발생했습니다' });
  }
};
router.post('/save', respond(req => notes.save(req.body, req.session)));
router.get('/tree', respond(() => notes.list()));
router.get('/:id', respond(req => notes.read(req.params.id)));
router.delete('/delete/:id', respond(req => notes.deleteTree(req.params.id, req.session)));

module.exports = router;
