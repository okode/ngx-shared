import express, { Application } from 'express';
import compression from 'compression';
import { APP_BASE_HREF } from '@angular/common';
import { ngExpressEngine } from '@nguniversal/express-engine';
import { existsSync } from 'fs';
import { join } from 'path';
import { requestContext } from './interceptors/request-context';
import { responseLogger } from './interceptors/response-logger';
import { AppServerModule } from '../src/main.server';
import { ENVIRONMENT_CONFIG } from '@okode/multienvironment';
import { ENVIRONMENT, initServerMultiEnvironmentApp } from '@okode/multienvironment';

export class Server {
  private server: Application;
  private port = process.env['PORT'] || 4000;
  private distFolder = join(process.cwd(), 'dist/apps/multienvironment-integration/browser');
  private startDate = new Date().toISOString();
  private env?: string;
  private envConfig?: unknown;

  constructor(
  ) {
    this.server = express();
    this.server.use(compression());
    this.server.use(requestContext);
    this.server.use(responseLogger);
    this.setExpressConfig();
  }

  async run() {
    const { env, envConfig } = await initServerMultiEnvironmentApp(
      {
        envVar: 'APP_ENVIRONMENT',
        defaultEnv: 'pro',
        distFolder: this.distFolder
      }
    );
    this.env = env;
    this.envConfig = envConfig;
    this.server.listen(this.port, () => {
      this.startDate = new Date().toISOString();
      console.log(
        JSON.stringify({
          time: this.startDate,
          type: 'info',
          message: `SERVER READY in env: ${this.env}. Node Express server listening on PORT: ${this.port}`,
        })
      );
    });
  }

  private setExpressConfig() {
    // Our Universal express-engine
    this.server.engine('html', ngExpressEngine({ bootstrap: AppServerModule }));

    this.server.set('view engine', 'html');
    this.server.set('views', this.distFolder);

    // Hide header X-Powered-By (copied from saludsavia-ng)
    this.server.disable('x-powered-by');

    // Serve static files from /browser
    this.server.get('*.*', express.static(this.distFolder, { maxAge: '1y' }));

    // health status check service
    this.server.get('/healthz', (_req, res) =>
      res.json({
        environment: this.env,
        startDate: this.startDate,
      })
    );

    // All regular routes use the Universal engine
    const indexHtml = existsSync(join(this.distFolder, 'index.original.html'))
      ? 'index.original.html'
      : 'index';
    this.server.get('*', (req, res) => {
      return res.render(indexHtml, {
        req,
        res,
        providers: [
          { provide: APP_BASE_HREF, useValue: req.baseUrl },
          { provide: ENVIRONMENT, useValue: this.env },
          { provide: ENVIRONMENT_CONFIG, useValue: this.envConfig },
        ],
      });
    });
  }
}
