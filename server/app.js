const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const sessionStore = require('./config/session');
const authRouter = require('./route/auth');
const labRouter = require('./route/lab');

dotenv.config();

const app = express();


app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
// 정적 파일 서빙 형식으로 변경 시 수정 고려

app.use(session({
  key: 'session_id',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60
  }
}));


app.use('/auth', authRouter);
app.use('/lab', labRouter);


const clientBuildPath = path.join(__dirname, "..", "client", "dist");

app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on port ${PORT}`);
});