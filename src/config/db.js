const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const env = require('./env');

// Configure driver adapter with PostgreSQL connection string
const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL
});

// Create singleton PrismaClient instance
const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
});

module.exports = prisma;
