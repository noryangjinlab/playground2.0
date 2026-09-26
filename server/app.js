const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
const { isProduction: isProd } = require('./config/env');
const path = require('path');
const sessionStore = require('./config/session');

const authRouter = require('./route/auth');
const labRouter = require('./route/lab');
const hostRouter = require('./route/host');


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


app.use(cors({
  origin: isProd
    ? ['https://noryangjinlab.org', 'https://www.noryangjinlab.org']
    : 'http://localhost:5173',
  credentials: true
}));

app.use(session({
  key: 'session_id',
  secret: process.env.SESSION_SECRET || (isProd ? undefined : require('crypto').randomBytes(32).toString('hex')),
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
app.use('/api/host', hostRouter);

app.use((req, res, next) => {

  console.log('SPA fallback reached:', req.method, req.path);
  
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  if (req.path.startsWith('/api')) return next();

  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, isProd ? '0.0.0.0' : '127.0.0.1', () => {
  console.log(`Server running on port ${PORT}`);
});
