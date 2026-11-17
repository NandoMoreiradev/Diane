import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PermissionsGuard } from './guard/permissions.guard';
import { rotatingJwtModuleOptions } from './jwt-secrets';
import { JwtStrategy } from './jwt.strategy';
import { LoginAttemptsService } from './login-attempts.service';
import { SessionValidationService } from './session-validation.service';

@Global()
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () =>
        rotatingJwtModuleOptions(undefined, {
          signOptions: { expiresIn: '15m' },
        }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LoginAttemptsService,
    SessionValidationService,
    PermissionsGuard,
  ],
  exports: [AuthService, JwtModule, SessionValidationService, PermissionsGuard],
})
export class AuthModule {}
