import app from './app';
import { env } from './config/env';
import { createServer } from 'http';

// Create the HTTP server
const httpServer = createServer(app);

// Start listening
const PORT = Number(env.PORT) || 5000;

console.log('🚀 Starting server initialization...');
const server = httpServer.listen(PORT, () => {
  console.log(`
  ################################################
  🛡️  Server listening on port: ${PORT} 🛡️ 
  👉  http://localhost:${PORT}
  ################################################
  `);
});

// 🚒 Error Handling: Uncaught Exceptions (Synchronous code errors)
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// 🚒 Error Handling: Unhandled Rejections (Async Promise errors)
process.on('unhandledRejection', (err: any) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});