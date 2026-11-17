import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportSecretProvider } from './jwt-secrets';
import { AccessTokenClaims, SessionValidationService } from './session-validation.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly sessionValidation: SessionValidationService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportSecretProvider(),
    });
  }

  validate(payload: AccessTokenClaims) {
    return this.sessionValidation.validateAccessToken(payload);
  }
}
