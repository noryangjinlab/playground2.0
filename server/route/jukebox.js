const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { randomUUID } = require('crypto');
const multer = require('multer');
const { isAdmin } = require('../config/env');

function createRouter(directory = process.env.JUKEBOX_DATA_DIR || path.join(__dirname, '../data/jukeboxdata')) {
  const router = express.Router();
  const media = path.join(directory, 'media');
  const catalog = path.join(directory, 'playlists.json');
  fs.ensureDirSync(media);
  let queue = Promise.resolve();
  const serial = action => {
    const result = queue.then(action);
    queue = result.catch(() => {});
    return result;
  };
  const read = async () => await fs.pathExists(catalog)
    ? fs.readJson(catalog)
    : { tracks: [], playlists: [] };
  const save = async data => {
    const temporary = `${catalog}.${randomUUID()}.tmp`;
    try { await fs.writeJson(temporary, data, { spaces: 2 }); await fs.rename(temporary, catalog); }
    finally { await fs.remove(temporary); }
  };
  const invalid = message => Object.assign(new Error(message), { status: 400 });
  const field = (value, label) => {
    if (typeof value !== 'string' || !value.trim() || value.trim().length > 200) throw invalid(`${label}은 1~200자로 입력해주세요.`);
    return value.trim();
  };
  router.get('/', async (req, res, next) => {
    try { res.set('Cache-Control', 'no-store').json(await read()); } catch (error) { next(error); }
  });
  router.use('/media', express.static(media, { fallthrough: false, dotfiles: 'deny' }));
  router.use((req, res, next) => {
    if (!isAdmin(req.session)) return res.status(403).json({ message: '관리자 로그인이 필요합니다.' });
    next();
  });
  router.post('/playlists', async (req, res, next) => {
    try {
      const name = field(req.body?.name, '플레이리스트 이름');
      const playlist = await serial(async () => {
        const data = await read();
        const item = { id: randomUUID(), name, tracks: [] };
        data.playlists.push(item); await save(data); return item;
      });
      res.status(201).json({ playlist });
    } catch (error) { next(error); }
  });
  // Add an existing library track to a playlist without uploading it again.
  router.post('/playlists/:id/items', async (req, res, next) => {
    try {
      const playlist = await serial(async () => {
        const data = await read();
        const item = data.playlists.find(item => item.id === req.params.id);
        if (!item) throw Object.assign(new Error('플레이리스트를 찾을 수 없습니다.'), { status: 404 });
        const track = data.tracks.find(track => track.id === req.body?.trackId);
        if (!track) throw invalid('음악 보관함에서 곡을 선택해주세요.');
        if (item.tracks.some(existing => existing.id === track.id)) throw Object.assign(new Error('이미 추가된 곡입니다.'), { status: 409 });
        item.tracks.push(track); await save(data); return item;
      });
      res.status(201).json({ playlist });
    } catch (error) { next(error); }
  });
  router.put('/playlists/:id/order', async (req, res, next) => {
    try {
      const playlist = await serial(async () => {
        const data = await read();
        const item = data.playlists.find(item => item.id === req.params.id);
        if (!item) throw Object.assign(new Error('플레이리스트를 찾을 수 없습니다.'), { status: 404 });
        const ids = req.body?.trackIds;
        const byId = new Map(item.tracks.map(track => [track.id, track]));
        if (!Array.isArray(ids) || ids.length !== item.tracks.length || new Set(ids).size !== ids.length || ids.some(id => !byId.has(id))) {
          throw Object.assign(new Error('곡 목록이 변경되었습니다. 관리 창을 다시 열어주세요.'), { status: 409 });
        }
        item.tracks = ids.map(id => byId.get(id)); await save(data); return item;
      });
      res.json({ playlist });
    } catch (error) { next(error); }
  });
  const upload = multer({
    storage: multer.diskStorage({ destination: media, filename: (req, file, done) => done(null, `${randomUUID()}.mp3`) }),
    limits: { fileSize: 50 * 1024 * 1024, files: 1, fields: 2, fieldSize: 2048 },
    fileFilter: (req, file, done) => done(/\.mp3$/i.test(file.originalname) ? null : invalid('MP3 파일만 업로드할 수 있습니다.'), /\.mp3$/i.test(file.originalname)),
  }).single('file');
  const uploadTrack = async (req, res, next) => {
    try {
      const title = field(req.body.title, '제목');
      const artist = field(req.body.artist, '아티스트');
      if (!req.file) throw invalid('MP3 파일을 선택해주세요.');
      const handle = await fs.open(req.file.path, 'r');
      const header = Buffer.alloc(3);
      try { await fs.read(handle, header, 0, 3, 0); } finally { await fs.close(handle); }
      if (header.toString() !== 'ID3' && !(header[0] === 0xff && (header[1] & 0xe6) === 0xe2)) throw invalid('유효한 MP3 파일이 아닙니다.');
      const track = { id: randomUUID(), title, artist, path: `/api/jukebox/media/${req.file.filename}` };
      await serial(async () => {
        const data = await read();
        if (req.params.id) {
          const playlist = data.playlists.find(item => item.id === req.params.id);
          if (!playlist) throw Object.assign(new Error('플레이리스트를 찾을 수 없습니다.'), { status: 404 });
          playlist.tracks.push(track);
        }
        data.tracks.push(track); await save(data);
      });
      res.status(201).json({ track });
    } catch (error) {
      if (req.file) await fs.remove(req.file.path).catch(() => {});
      next(error);
    }
  };
  router.post('/tracks', upload, uploadTrack);
  router.post('/playlists/:id/tracks', upload, uploadTrack);
  router.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : error instanceof multer.MulterError ? 400 : error.status || 500;
    res.status(status).json({ message: status === 413 ? 'MP3는 최대 50MB까지 업로드할 수 있습니다.' : status >= 500 ? '주크박스 저장 중 오류가 발생했습니다.' : error.message });
  });
  return router;
}
module.exports = createRouter;
