const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const BASE_DIR = '/home/user/cloud/';
const META_FILE = './uploads.json';

// 메타데이터 파일 초기화
if (!fs.existsSync(META_FILE)) {
    fs.writeFileSync(META_FILE, '[]', 'utf8');
}

// 메타데이터 읽기
function readMeta() {
    const data = fs.readFileSync(META_FILE, 'utf8');
    return JSON.parse(data);
}

// 메타데이터 저장
function saveMeta(meta) {
    fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2), 'utf8');
}

// Multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, BASE_DIR);
    },
    filename: (req, file, cb) => {
        const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
        const safeOriginalName = file.originalname.replace(/\s+/g, '_');
        cb(null, `${timestamp}_${safeOriginalName}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB 제한
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and videos are allowed!'));
        }
    }
});

// 비밀번호 인증 미들웨어
function verifyPassword(req, res, next) {
    const inputPassword = req.headers['x-password'];
    const hashedPassword = process.env.HASHED_PASSWORD;

    if (!inputPassword || !hashedPassword) {
        return res.status(403).json({ message: 'Access Denied' });
    }

    if (!bcrypt.compareSync(inputPassword, hashedPassword)) {
        return res.status(403).json({ message: 'Invalid password' });
    }
    next();
}

// [CREATE] 파일 업로드
app.post('/upload', verifyPassword, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const subPath = req.body.subPath || '';

    const meta = readMeta();
    const newEntry = {
        id: uuidv4(),
        originalName: req.file.originalname,
        savedName: req.file.filename,
        virtualPath: subPath,
        uploadedAt: new Date().toISOString()
    };
    meta.push(newEntry);
    saveMeta(meta);

    res.status(200).json({ message: 'File uploaded successfully', file: newEntry });
});

// [READ] 특정 가상 경로의 파일 목록 조회
app.get('/files', (req, res) => {
    const subPath = req.query.subPath || '';
    const meta = readMeta();
    const filtered = meta.filter(file => file.virtualPath === subPath);
    res.status(200).json(filtered);
});

// [DOWNLOAD] 파일 다운로드
app.get('/download/:id', (req, res) => {
    const { id } = req.params;
    const meta = readMeta();
    const file = meta.find(f => f.id === id);

    if (!file) {
        return res.status(404).json({ message: 'File not found' });
    }

    const filePath = path.join(BASE_DIR, file.savedName);
    res.download(filePath, file.originalName);
});

// [UPDATE] 파일 가상 경로 수정
app.put('/update/:id', verifyPassword, (req, res) => {
    const { id } = req.params;
    const { newSubPath } = req.body;
    const meta = readMeta();
    const fileIndex = meta.findIndex(f => f.id === id);

    if (fileIndex === -1) {
        return res.status(404).json({ message: 'File not found' });
    }

    meta[fileIndex].virtualPath = newSubPath;
    saveMeta(meta);
    res.status(200).json({ message: 'File path updated', file: meta[fileIndex] });
});

// [DELETE] 파일 삭제
app.delete('/delete/:id', verifyPassword, (req, res) => {
    const { id } = req.params;
    let meta = readMeta();
    const fileIndex = meta.findIndex(f => f.id === id);

    if (fileIndex === -1) {
        return res.status(404).json({ message: 'File not found' });
    }

    const filePath = path.join(BASE_DIR, meta[fileIndex].savedName);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    meta.splice(fileIndex, 1);
    saveMeta(meta);

    res.status(200).json({ message: 'File deleted' });
});

// 정적 파일 서빙
app.use('/static', express.static(BASE_DIR));

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});