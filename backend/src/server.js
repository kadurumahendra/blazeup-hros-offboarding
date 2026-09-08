import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(config.port, () => {
      console.log(`=====================================================`);
      console.log(`🚀 BlazeUp HROS Backend Server Running on Port ${config.port}`);
      console.log(`🌐 API Base URL: http://localhost:${config.port}/api`);
      console.log(`🏥 Health Check: http://localhost:${config.port}/api/health`);
      console.log(`=====================================================`);
    });

    const handleShutdown = () => {
      console.log('\n[Server] Graceful shutdown initiated...');
      server.close(() => {
        console.log('[Server] HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
  } catch (error) {
    console.error('[Server Startup Error]', error);
    process.exit(1);
  }
};

startServer();
