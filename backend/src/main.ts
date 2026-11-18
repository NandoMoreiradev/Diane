import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

const isProduction = process.env.NODE_ENV === 'production';

function assertProductionEnv() {
  if (!isProduction) return;
  const secret = process.env.JWT_SECRET ?? '';
  if (secret.length < 32) {
    throw new Error('FATAL: JWT_SECRET deve ter pelo menos 32 caracteres em produção.');
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('FATAL: DATABASE_URL não está definido.');
  }
}

async function bootstrap() {
  assertProductionEnv();
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Atrás de Cloudflare + proxy do Railway: sem isso req.ip seria sempre o IP do proxy.
  const hops = Number(process.env.TRUST_PROXY_HOPS ?? (isProduction ? 2 : 0));
  app.set('trust proxy', Number.isFinite(hops) ? hops : 0);

  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.use(cookieParser());

  // api.<domínio> serve somente a API: fora de /api não entrega o front-end.
  app.use((req: Request, res: Response, next: NextFunction) => {
    const host = (req.headers.host ?? '').toLowerCase();
    if (host.startsWith('api.') && !req.path.startsWith('/api')) {
      res.status(404).json({ statusCode: 404, message: 'Not Found' });
      return;
    }
    next();
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS: front e API são servidos pela mesma origem, então em produção só liberamos
  // origens explicitamente listadas. Nunca refletir qualquer origem com credenciais.
  const corsOrigins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  if (corsOrigins.length) {
    app.enableCors({ origin: corsOrigins, credentials: true });
  } else if (!isProduction) {
    app.enableCors({ origin: ['http://localhost:5173'], credentials: true });
  } else {
    logger.warn('CORS_ORIGIN vazio: CORS desabilitado (apenas mesma origem).');
  }

  app.enableShutdownHooks();

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port, '0.0.0.0');
  logger.log(`Dianê API rodando na porta ${port} (/api)`);
}

bootstrap();
