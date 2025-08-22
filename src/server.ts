import 'dotenv/config';
import Hapi from '@hapi/hapi';
import { registerAuth } from './plugins/auth.js';
import { validationPlugin } from './plugins/validation.js';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { stateRoutes } from './routes/states.js';
import { cropRoutes } from './routes/crops.js';
import { quotationRoutes } from './routes/quotation.js';

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

  // Register routes
  server.route(authRoutes);
  server.route(userRoutes);
  server.route(stateRoutes);
  server.route(cropRoutes);
  server.route(quotationRoutes);

  await server.start();
  console.log(`🚀 Server on http://localhost:${server.info.port}`);
}

init().catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});
