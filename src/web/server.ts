import { swaggerUI } from '@hono/swagger-ui';
import type { Worker } from 'bullmq';
import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import { serveStatic } from 'hono/bun';
import env from '../lib/env.js';
import { logger } from '../lib/logger.js';
import { connection } from '../lib/queue.js';
import { UserRepository } from '../repository/user.js';
import { UserService } from '../service/user.js';
import { Tasker } from '../task/tasker.js';
import { registerScheduledTasks } from '../task/scheduler.js';
import { AuthController } from './controller/auth.js';
import { serveInternalServerError, serveNotFound } from './controller/resp/error.js';
import { rateLimit } from './middlelayer/rateLimit.js';
import { loginValidator, registrationValidator } from './validator/user.js';

export class Server {
  private app: Hono;
  private worker?: Worker;

  constructor(app: Hono) {
    this.app = app;
  }

  public configure() {
    // Index path
    this.app.get('/', (c) => {
      return c.text('Ok');
    });

    // Static files
    this.app.use('/static/*', serveStatic({ root: './' }));

    // API Doc
    this.app.get('/doc', swaggerUI({ url: '/static/openapi.yaml' }));

    // Universal catchall
    this.app.notFound((c) => {
      return serveNotFound(c);
    });

    // Error handling
    this.app.onError((err, c) => {
      return serveInternalServerError(c, err);
    });

    // API v1
    const v1 = new Hono();

    // Setup repos
    const userRepo = new UserRepository();

    // Setup services
    const userService = new UserService(userRepo);

    // Setup worker
    this.registerWorker(userService);

    // Setup scheduled tasks
    registerScheduledTasks();

    // Setup controllers
    const authController = new AuthController(userService);

    // Register routes
    this.registerUserRoutes(v1, authController);

    // Mount versioned API
    this.app.route('/v1', v1);
  }

  private registerUserRoutes(api: Hono, authCtrl: AuthController) {
    const user = new Hono();
    const authCheck = jwt({ secret: env.SECRET_KEY, alg: 'HS256' });
    const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, keyPrefix: 'rl:auth' });

    user.get('/me', authCheck, authCtrl.me);
    user.post('/login', authRateLimit, loginValidator, authCtrl.login);
    user.post('/register', authRateLimit, registrationValidator, authCtrl.register);

    api.route('/user', user);
  }

  private registerWorker(userService: UserService) {
    const tasker = new Tasker(userService);
    const worker = tasker.setup();
    if (worker.isRunning()) {
      logger.info('Worker is running');
    }
    this.worker = worker;
  }

  public async shutDownWorker() {
    await this.worker?.close();
    await connection.quit();
  }
}
