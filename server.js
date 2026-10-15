const app = require('./src/app');
const env = require('./src/config/env');
const prisma = require('./src/config/db');

const PORT = env.PORT || 5000;

// Test database connection and start HTTP server
async function startServer() {
  try {
    // Verify PostgreSQL connection via Prisma
    await prisma.$connect();
    console.log('Connected to Neon PostgreSQL database successfully.');

    const server = app.listen(PORT, () => {
      console.log(`Healthcare Backend Server is running on port ${PORT}`);
      console.log(` Health check available at: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log('HTTP server closed.');
        try {
          await prisma.$disconnect();
          console.log('Database disconnected cleanly.');
        } catch (err) {
          console.error('Error disconnecting database:', err);
        }
        process.exit(0);
      });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  } catch (error) {
    console.error(' Failed to start server:', error);
    process.exit(1);
  }
}
startServer();
