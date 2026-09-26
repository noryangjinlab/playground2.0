const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  for (const key of ['DB_HOST', 'DB_USER', 'DB_NAME', 'SESSION_SECRET', 'ADMIN_ID']) {
    if (!process.env[key]) throw new Error(`Missing required production setting: ${key}`);
  }
}
const adminId = process.env.ADMIN_ID || 'admin0106';
module.exports = { isProduction, isAdmin: session => Boolean(session?.username && session.username === adminId) };
