const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
require('./env');

const options = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  clearExpired: true,
  checkExpirationInterval: 10000,
  expiration: 1000 * 60 * 60 * 10
};

const hasDatabase = process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME;
if (!hasDatabase && process.env.NODE_ENV === 'production') {
  throw new Error('Production requires DB_HOST, DB_USER and DB_NAME');
}
const sessionStore = hasDatabase ? new MySQLStore(options) : new session.MemoryStore();
if (!hasDatabase) console.log('Local development: in-memory sessions; account login requires database configuration.');

module.exports = sessionStore;
