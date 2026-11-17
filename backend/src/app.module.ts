import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { HealthController } from './health.controller';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

const candidatePaths = [
  resolve(process.cwd(), 'frontend', 'dist'),
  resolve(process.cwd(), '..', 'frontend', 'dist'),
];
const frontendDistPath = candidatePaths.find((p) => existsSync(p));

const staticImports = frontendDistPath
  ? [
      ServeStaticModule.forRoot({
        rootPath: frontendDistPath,
        exclude: ['/api/(.*)'],
      }),
    ]
  : [];

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    ...staticImports,
    PrismaModule,
    AuthModule,
    CatalogModule,
    OrdersModule,
    UsersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
