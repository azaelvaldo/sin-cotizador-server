import 'dotenv/config';
import Hapi from '@hapi/hapi';
import { registerAuth } from './plugins/auth.js';
import { validationPlugin } from './plugins/validation.js';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { stateRoutes } from './routes/states.js';
import { cropRoutes } from './routes/crops.js';
import { quotationRoutes } from './routes/quotation.js';
import { rabbitMQService } from './services/rabbitmq.service.js';

async function init() {
  const server = Hapi.server({
    port: Number(process.env.PORT || 4000),
    host: '0.0.0.0',
    routes: { cors: { origin: ['*'] } },
  });

  // Register validation plugin
  await server.register(validationPlugin);

  // Register auth plugin
  await registerAuth(server);

  // Initialize RabbitMQ service
  try {
    await rabbitMQService.initialize();
    await rabbitMQService.startConsumer();
    console.log('✅ RabbitMQ service initialized');
  } catch (error) {
    console.error('❌ Failed to initialize RabbitMQ service:', error);
  }

  // Register routes
  server.route(authRoutes as Hapi.ServerRoute[]);
  server.route(userRoutes as Hapi.ServerRoute[]);
  server.route(stateRoutes as Hapi.ServerRoute[]);
  server.route(cropRoutes as Hapi.ServerRoute[]);
  server.route(quotationRoutes as Hapi.ServerRoute[]);

  await server.start();
  console.log(`🚀 Server on http://localhost:${server.info.port}`);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('🔄 Shutting down gracefully...');
    await rabbitMQService.close();
    await server.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('🔄 Shutting down gracefully...');
    await rabbitMQService.close();
    await server.stop();
    process.exit(0);
  });
}

init().catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});
