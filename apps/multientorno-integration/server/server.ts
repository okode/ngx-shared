import express, { Application } from 'express';
import compression from 'compression';
import { APP_BASE_HREF } from '@angular/common';
import { ngExpressEngine } from '@nguniversal/express-engine';
import { existsSync } from 'fs';
import { join } from 'path';
import { requestContext } from './interceptors/request-context';
import { responseLogger } from './interceptors/response-logger';
import { ENVIRONMENT_CONFIG } from '../src/tokens/environment-config.token';
import { ENVIRONMENT_VARS } from '../src/tokens/environment-vars.token';
import { AppServerModule } from '../src/main.server';
import { EnvironmentConfig, getEnvironmentConfigByEnv } from '../src/environments/environment-config';

export class Server {
  private server: Application;
  private port = process.env['PORT'] || 4000;
  private distFolder = join(process.cwd(), 'dist/apps/multientorno-integration/browser');
  private startDate = new Date().toISOString();
  private envSelected =  process.env['APP_ENVIRONMENT'] ?? 'pro';
  private envConfig?: EnvironmentConfig;

  constructor(
  ) {
    this.server = express();
    this.server.use(compression());
    this.server.use(requestContext);
    this.server.use(responseLogger);
    this.setExpressConfig();
  }

  async run() {
    this.envConfig = await getEnvironmentConfigByEnv(this.envSelected);
    this.server.listen(this.port, () => {
      this.startDate = new Date().toISOString();
      console.log(
        JSON.stringify({
          time: this.startDate,
          type: 'info',
          message: `SERVER READY in env: ${this.envSelected} with mode:. Node Express server listening on PORT: ${this.port}`,
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
        environment: this.envSelected,
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
          { provide: ENVIRONMENT_VARS, useValue: this.envSelected },
          { provide: ENVIRONMENT_CONFIG, useValue: this.envConfig },
        ],
      });
    });
  }
}
