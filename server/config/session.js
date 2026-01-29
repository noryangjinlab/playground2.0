const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
require('dotenv').config();

const options = {
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  clearExpired: true,
  checkExpirationInterval: 10000,
  expiration: 1000 * 60 * 60 * 10
};

const sessionStore = new MySQLStore(options);

module.exports = sessionStore;