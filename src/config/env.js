const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'healthcare_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  NODE_ENV: process.env.NODE_ENV || 'development'
};

if (!env.DATABASE_URL) {
  console.error('CRITICAL ERROR: DATABASE_URL is missing in environment variables.');
  process.exit(1);
}

module.exports = env;
