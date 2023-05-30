import express, { Application } from 'express';
import compression from 'compression';
import { APP_BASE_HREF } from '@angular/common';
import { ngExpressEngine } from '@nguniversal/express-engine';
import { existsSync } from 'fs';
import { join } from 'path';
import { requestContext } from './interceptors/request-context';
import { responseLogger } from './interceptors/response-logger';
import { ENVIRONMENT_CONFIG } from '../src/tokens/environment-config.token';
import { AppServerModule } from '../src/main.server';
import { EnvironmentConfig, getEnvironmentConfigByEnv } from '../src/config/environment-config';
import { APP_INITIALIZER, Injector } from '@angular/core';
import { ServerMultienvironmentConfigService } from '../src/app/services/server-multienvironment-config.service';
import { ENVIRONMENT_NAME } from '../src/tokens/environment-name.token';

export class Server {
  private server: Application;
  private port = process.env['PORT'] || 4000;
  private distFolder = join(process.cwd(), 'dist/apps/multientorno-integration/browser');
  private startDate = new Date().toISOString();
  private env?: string;
  private envConfig?: EnvironmentConfig;

  constructor(
  ) {
    this.server = express();
    this.server.use(compression());
    this.server.use(requestContext);
    this.server.use(responseLogger);
    this.setExpressConfig();
  }

  async initServerMultiEnvironment(opts: { envVar: string; defaultEnv: string; }) {
    const env =  process.env[opts.envVar] ?? opts.defaultEnv;
    const config = await getEnvironmentConfigByEnv(env);
    return { env, config };
  }

  async run() {
    const { env, config } = await this.initServerMultiEnvironment({ envVar: 'APP_ENVIRONMENT', defaultEnv: 'pro' });
    this.env = env;
    this.envConfig = config;
    this.server.listen(this.port, () => {
      this.startDate = new Date().toISOString();
      console.log(
        JSON.stringify({
          time: this.startDate,
          type: 'info',
          message: `SERVER READY in env: ${this.env} with mode:. Node Express server listening on PORT: ${this.port}`,
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
        //TODO un provider que sea el config y otro provider que sea el name
        providers: [
          { provide: APP_BASE_HREF, useValue: req.baseUrl },
          { provide: ENVIRONMENT_CONFIG, useValue: this.envConfig },
          { provide: ENVIRONMENT_NAME, useValue: this.env },
          {
            provide: APP_INITIALIZER,
            useFactory: (injector: Injector) => () =>
              { injector.get(ServerMultienvironmentConfigService ).init({ envVars: this.env ?? 'dev' }) },
            deps: [Injector],
            multi: true,
          },
        ],
      });
    });
  }
}
