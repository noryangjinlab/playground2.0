const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { transporter } = require('../config/mail');

const router = express.Router();


router.post('/signup', async (req, res) => {
  const { username, password, name, nickname, email } = req.body;
  if (!username || !password || !name || !nickname || !email) return res.status(400).json({ message: '모든 항목을 입력해주세요' });

  try {
    const [dupUser] = await pool.execute(`
      SELECT 'username' AS field
      FROM (
        SELECT username AS v FROM users
        UNION ALL
        SELECT username AS v FROM standby
      ) merged
      WHERE v = ?
      LIMIT 1
    `, [username]);
    if (dupUser.length > 0) return res.status(409).json({ message: '사용중인 아이디입니다' });

    const [dupNick] = await pool.execute(
      `
      SELECT 'nickname' AS field
      FROM (
        SELECT nickname AS v FROM users
        UNION ALL
        SELECT nickname AS v FROM standby
      ) merged
      WHERE v = ?
      LIMIT 1
      `,
      [nickname]
    )
    if (dupNick.length > 0) {
      return res.status(409).json({ message: '사용중인 닉네임입니다' })
    }

    const hash = await bcrypt.hash(password, 12);
    await pool.execute(
      'INSERT INTO standby (username, password, name, nickname, email) VALUES (?, ?, ?, ?, ?)',
      [username, hash, name, nickname, email]
    )
    res.status(201).json({ message: '회원가입 신청이 완료되었습니다' });

    console.log("새 회원가입 요청 들어옴 : ", {
      username: JSON.stringify(username),
      nickname: JSON.stringify(nickname),
    })
  } catch (err) {
    if (err?.code === 'ER_DUP_ENTRY') {
      // 레이스 컨디션 대비: DB UNIQUE 충돌을 409로 변환
      if (String(err?.sqlMessage || '').includes('standby.nickname')) {
        return res.status(409).json({ message: '사용중인 닉네임입니다' })
      }
      if (String(err?.sqlMessage || '').includes('standby.username')) {
        return res.status(409).json({ message: '사용중인 아이디입니다' })
      }
      return res.status(409).json({ message: '중복된 값입니다' })
    }
    console.log(err);
    res.status(500).json({ message: err });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: '모든 항목을 입력해주세요' });

  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ message: '일치하는 아이디가 없습니다' });
    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) return res.status(401).json({ message: '비밀번호가 틀립니다' });

    req.session.username = rows[0].username;
    req.session.name = rows[0].name;
    req.session.nickname = rows[0].nickname;
    res.status(200).json({ message: '로그인 성공', nickname: req.session.nickname });
  } catch (err) {
    res.status(500).json({ message: err });
    console.log(err)
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
    console.log("사용자 탈퇴 : ", req.session.username);
    res.json({ message: 'adios' });
  } catch (err) {
    res.status(500).json({ message: err });
    console.log(err)
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
  if (!(req.session.username == "admin0106")) return res.status(401).json({ message: '관리자 로그인 세션이 필요합니다' });
  
  try {
    const [rows] = await pool.execute('SELECT * FROM standby');
    res.json({ list: rows });
  } catch (err) {
    res.status(500).json({ message: err });
    console.log(err);
  }
});

router.post('/confirmstandby', async (req, res) => {
  if (!(req.session.username == "admin0106")) return res.status(401).json({ message: '관리자 로그인 세션이 필요합니다' });
  
  const { username, password, name, nickname, email } = req.body;
  
  try {
    await pool.execute('INSERT INTO users (username, password, name, nickname, email) VALUES (?, ?, ?, ?, ?)', 
      [username, password, name, nickname, email]);
    await pool.execute('DELETE FROM standby WHERE username = ?', [username]);
    res.status(200).json({ message: "회원가입 승인 완료" });
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: '회원가입 신청이 승인되었습니다 ( °ヮ° )',
      text: `
        ${username}님 환영합니다.
        노량진랩 회원가입 신청이 승인되었습니다.
        기타 문의사항 : hlawliet113@gmail.com
        바로가기 : https://noryangjinlab.org/login


                                        ..                        
                          .+#%%%%%%#+.                   
                        -%%*:       =#%#-                
                      :*%#-             :+%#=.            
                    -#%+.                  .+%#+.         
                  =%#-                        .*%%-       
                =%#:                             -%%-     
              #%=                               =%%-     
              .%%=::                           =%%-       
                .+%%=                           =%*       
                .#%-                             :%#:     
              -%#.                               .##-    
              =%# .*#####%%####.    .+*++++*#*+*%= .##:   
            =%*         .#..+:             == -=   :#*.  
            -##.          .::.                .      =%=  
          .+%-                                      :#*. 
          :##.                    .:.               :#%: 
          :#*.                  -#%*#%+.            :#%. 
          .*#.                :%%:   .=%=           -%#. 
            +%:                                     :#%-  
            :*%=                                  .+%#-   
              =%%*-.                         .=*#%%#-     
                .=%%=                        -%%+         
          .:::::-#%+.                          -*#%%%#+.  
        *%#***+=:     -##-             .%%#+:      :*%*. 
        *%=        :*%%%%-     =%#-     +%#+#%%%%%%%#-   
          :*#%%%%%%%#=:#%-     *%+##:     .#%#-           
                    -#%+.   .=%%-  *%=      .=#%-         
                  .#%+.  :+#%#-     -#%*=:. .-*%+         
                  -#%%%%%*:           :=###*=:           
                                                          

      `,
    })
  } catch (err) {
    res.status(500).json({ message: err });
    console.log(err);
  }
});

router.delete('/deletestandby', async (req, res) => {
  if (!(req.session.username == "admin0106")) return res.status(401).json({ message: '관리자 로그인 세션이 필요합니다' });
  
  const { username } = req.body;
  try {
    await pool.execute("DELETE FROM standby WHERE username=?", [username]);
    res.json({ message: '삭제되었습니다' });
  } catch (err) {
    res.json({ message: '삭제 실패' });
    console.log(err);
  }
  
});

router.delete('/deleteuser', async (req, res) => {
  if (!(req.body.username == "admin0106")) return res.status(401).json({ message: '관리자 로그인 세션이 필요합니다' });
  try {
    await pool.execute("DELETE FROM users WHERE username=?", [req.body.username]);
    req.session.destroy(() => {
      res.clearCookie('session_id');
    });
    console.log("사용자 탈퇴 : ", req.body.username);
    res.json({ message: 'adios' });
  } catch (err) {
    res.status(500).json({ message: err });
    console.log(err)
  }
});

router.get('/allusers', async (req, res) => {
  if (!(req.session.username == "admin0106")) return res.status(401).json({ message: '관리자 로그인 세션이 필요합니다' });
  
  try {
    const [rows] = await pool.execute('SELECT * FROM users');
    res.json({ users: rows });
  } catch (err) {
    res.status(500).json({ message: err });
    console.log(err);
  }
});


module.exports = router;