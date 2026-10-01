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
const FILES_DIR = path.join(__dirname, '..', 'labdata', 'files');
const uploadAttachments = require('../config/attachment-upload')(FILES_DIR);
router.post('/file/upload', async (req, res) => {
  try { await notes.assertEditable(req.query.noteId, req.session); }
  catch (error) { return res.status(error.status || 500).json({ message: error.message }); }
  uploadAttachments(req, res, async error => {
    const files = req.files || [];
    try {
      if (error) throw error;
      if (!files.length) return res.status(400).json({ message: '파일을 선택하세요.' });
      // Ownership may have changed while a large upload was in progress.
      await notes.assertEditable(req.query.noteId, req.session);
      const results = [];
      for (const file of files) {
        const name = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const data = { id: file.filename, name, size: file.size, noteId: req.query.noteId };
        await fs.writeJson(path.join(FILES_DIR, `${file.filename}.json`), data);
        results.push({ ...data, url: `/api/lab/file/${file.filename}` });
      }
      res.json({ files: results });
    } catch (failure) {
      await Promise.all(files.flatMap(file => [fs.remove(file.path), fs.remove(path.join(FILES_DIR, `${file.filename}.json`))]));
      res.status(failure.status || (failure instanceof multer.MulterError ? 413 : 500)).json({ message: failure instanceof multer.MulterError ? '1회 업로드는 총 1GB, 최대 100개 파일까지 가능합니다.' : failure.message });
    }
  });
});
router.get('/file/:id', async (req, res) => {
  if (!/^[a-f0-9-]{36}$/.test(req.params.id)) return res.sendStatus(404);
  try {
    const data = await fs.readJson(path.join(FILES_DIR, `${req.params.id}.json`));
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.download(path.join(FILES_DIR, req.params.id), data.name, error => {
      if (error && !res.headersSent) res.sendStatus(404);
    });
  } catch { res.sendStatus(404); }
});
router.delete('/file/:id', async (req, res) => {
  if (!/^[a-f0-9-]{36}$/.test(req.params.id)) return res.sendStatus(404);
  try {
    const metadata = path.join(FILES_DIR, `${req.params.id}.json`);
    const data = await fs.readJson(metadata);
    await notes.assertEditable(data.noteId, req.session);
    await fs.remove(path.join(FILES_DIR, req.params.id));
    await fs.remove(metadata);
    res.json({ success: true });
  } catch (error) {
    res.status(error.status || (error.code === 'ENOENT' ? 404 : 500)).json({ message: error.status ? error.message : error.code === 'ENOENT' ? '이미 삭제되었거나 존재하지 않는 파일입니다.' : '파일 삭제에 실패했습니다.' });
  }
});
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
