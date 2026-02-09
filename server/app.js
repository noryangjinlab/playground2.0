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

// nginx에서 서빙 (제거?)
const clientBuildPath = path.join(__dirname, "..", "client", "dist");

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false
  })
);
app.use(express.json());

const isProd = process.env.NODE_ENV === 'production';

app.use(cors({
  origin: isProd
    ? ['https://noryangjinlab.org', 'https://www.noryangjinlab.org']
    : 'http://localhost:5173',
  credentials: true
}));

app.use(session({
  key: 'session_id',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 10
  }
}));

app.use(express.static(clientBuildPath));
app.use('/api/auth', authRouter);
app.use('/api/lab', labRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});