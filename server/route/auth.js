const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, password, name, nickname } = req.body;
  if (!username || !password || !name || !nickname) return res.status(400).json({ message: '모든 항목을 입력해주세요' });

  try {
    const [exists] = await pool.execute(`
      SELECT username FROM (
        SELECT username FROM users
        UNION ALL
        SELECT username FROM standby
      ) AS merged
      WHERE username = ?
    `, [username]);
    if (exists.length > 0) return res.status(409).json({ message: '사용중인 아이디입니다' });

    const hash = await bcrypt.hash(password, 12);
    await pool.execute('INSERT INTO standby (username, password, name, nickname) VALUES (?, ?, ?, ?)', [username, hash, name, nickname]);
    res.status(201).json({ message: '회원가입 신청이 완료되었습니다' });
  } catch (err) {
    res.status(500).json({ message: err });
    console.log(err);
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: '모든 항목을 입력해주세요' });

  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ message: '입력값을 확인해주세요' });
    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) return res.status(401).json({ message: '입력값을 확인해주세요' });

    req.session.username = rows[0].username;
    req.session.name = rows[0].name;
    req.session.nickname = rows[0].nickname;
    res.status(200).json({ message: '로그인 성공', nickname: req.session.nickname });
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

router.post('/logout', (req, res) => {
  if (!req.session) return res.json({ message: '이미 로그아웃 돼있습니다' });
  try {
    req.session.destroy(() => {
      res.clearCookie('session_id');
      res.json({ message: 'adios' });
    });
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

router.post('/bye', async (req, res) => {
  if (!req.session) return res.json({ message: '로그인 후 이용해주세요' });
  try {
    await pool.execute("DELETE FROM users WHERE username=?", [req.session.username]);
    req.session.destroy(() => {
      res.clearCookie('session_id');
    });
    res.json({ message: 'adios' });
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

router.get('/me', (req, res) => {
  if (!req.session || !req.session.username) return res.status(401).json({ message: '로그인 세션이 존재하지 않습니다' });
  res.json({
    username: req.session.username,
    name: req.session.name,
    nickname: req.session.nickname
  });
});

router.get('/standby', async (req, res) => {
  if (!(req.session.username == "admin")) return res.status(401).json({ message: '관리자 로그인 세션이 필요합니다' });
  
  try {
    const [rows] = await pool.execute('SELECT * FROM standby');
    res.json({ list: rows });
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

router.post('/confirmstandby', async (req, res) => {
  const { username, password, name, nickname } = req.body;
  
  try {
    await pool.execute('INSERT INTO USERS (username, password, name, nickname) VALUES (?, ?, ?, ?)', [username, password, name, nickname]);
    await pool.execute('DELETE FROM standby WHERE username = ?', [username]);
    res.status(200).json({ message: "회원가입 승인 완료" });
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

module.exports = router;