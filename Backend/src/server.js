import app from './app.js';
import connectDB from './config/db.js';
import env from './config/env.js';

/**
 * Server Bootstrap
 * Connects to database and starts the Express server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Database connected successfully');

    // Start server
    const server = app.listen(env.PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                    MediConnect API                     ║
╠═══════════════════════════════════════════════════════╣
║  Status:      Running                                  ║
║  Environment: ${env.NODE_ENV.padEnd(40)}║
║  Port:        ${String(env.PORT).padEnd(40)}║
║  URL:         ${env.APP_URL.padEnd(40)}║
╚═══════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
