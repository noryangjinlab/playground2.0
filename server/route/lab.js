const express = require('express');
const path = require('path');
const fs = require('fs-extra'); // writeJson, readJson, ensureDir 등 사용
const multer = require('multer')
const crypto = require('crypto')


const router = express.Router();

const NOTES_DIR = path.join(__dirname, '..', 'labdata', 'notes');
const IMAGES_DIR = path.join(__dirname, '..', 'labdata', 'images');

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

router.post('/image/upload', upload.single('file'), async (req, res) => {
  if (!(req.session && req.session.username === 'admin0106')) {
    return res.status(403).json({ message: '권한이 없습니다' });
  }
  if (!req.file) {
    return res.status(400).json({ message: '파일이 없습니다' });
  }

  const filename = req.file.filename;
  const base = `${req.protocol}://${req.get('host')}`;
  const url = `${base}/api/lab/images/${encodeURIComponent(filename)}`;

  return res.json({ filename, url });
});

router.delete('/image/delete/:filename', async (req, res) => {
  if (!(req.session && req.session.username === 'admin0106')) {
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



// 노트 저장 (신규 생성 + 수정 공용)
// POST /lab/save
// body: { id, parentId?, title?, content: tiptapJSON }
router.post('/save', async (req, res) => {
  const { id, parentId: parentIdFromBody, title: titleFromBody, content } = req.body;
  if (!(req.session && req.session.username === "admin0106")) {
    return res.status(403).json({ message: "권한이 없습니다" });
  }
  if (!id) {
    return res.status(400).json({ message: "id가 없습니다" });
  }

  try {
    const filePath = path.join(NOTES_DIR, `${id}.json`);
    const exists = await fs.pathExists(filePath);
    let existing = null;

    // 이미 존재하는 노트라면 기존 parentId, title을 재사용
    if (exists) {
      existing = await fs.readJson(filePath);
    }

    const parentId =
      typeof parentIdFromBody !== 'undefined'
        ? parentIdFromBody
        : existing
        ? existing.parentId || null
        : null;

    const title =
      typeof titleFromBody !== 'undefined'
        ? titleFromBody
        : existing
        ? existing.title || ''
        : '';

    // ancestors 계산
    let ancestors = [];
    if (parentId) {
      const parentPath = path.join(NOTES_DIR, `${parentId}.json`);
      const parentExists = await fs.pathExists(parentPath);
      if (parentExists) {
        const parentNote = await fs.readJson(parentPath);
        const parentAnc = parentNote.ancestors || [];
        ancestors = [
          ...parentAnc,
          { id: parentNote.id, title: parentNote.title || '' },
        ];
      }
    }

    const payload = {
      id,
      parentId: parentId || null,
      title,
      ancestors,
      content,
    };

    await fs.writeJson(filePath, payload, { spaces: 2 });
    return res.json({ success: true });
  } catch (err) {
    console.error("노트 저장 실패:", err);
    return res.status(500).json({ message: "노트 저장 중 오류가 발생했습니다" });
  }
});


router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'id가 필요합니다' });
  }

  try {
    const filePath = path.join(NOTES_DIR, `${id}.json`)

    // 파일이 없으면 404
    const exists = await fs.pathExists(filePath);
    if (!exists) {
      return res.status(404).json({ message: '노트를 찾을 수 없습니다' });
    }

    const note = await fs.readJson(filePath);
    return res.json(note);
  } catch (err) {
    console.error('노트 읽기 실패:', err);
    return res.status(500).json({ message: '노트 읽기 중 오류가 발생했습니다' });
  }
});


router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  if (!(req.session && req.session.username === 'admin0106')) {
    return res.status(403).json({ message: '권한이 없습니다' });
  }

  if (!id) {
    return res.status(400).json({ message: 'id가 필요합니다' });
  }

  try {
    const filePath = path.join(NOTES_DIR, `${id}.json`);
    const exists = await fs.pathExists(filePath);

    if (!exists) {
      return res.status(404).json({ message: '노트를 찾을 수 없습니다' });
    }

    await fs.remove(filePath);

    return res.json({ success: true });
  } catch (err) {
    console.error('노트 삭제 실패:', err);
    return res.status(500).json({ message: '노트 삭제 중 오류가 발생했습니다' });
  }
});


module.exports = router;