import { JwtModuleOptions, JwtSecretRequestType, JwtService } from '@nestjs/jwt';

type EnvReader = (name: string) => string | undefined;

const fromProcessEnv: EnvReader = (name) => process.env[name];
const signatureChecker = new JwtService();

function list(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function jwtSigningSecret(get: EnvReader = fromProcessEnv): string {
  const secret = get('JWT_SECRET');
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET não está definido no ambiente de produção.');
  }
  return 'diane-dev-jwt-secret-local-2026';
}

export function jwtVerificationSecrets(get: EnvReader = fromProcessEnv): string[] {
  return [...new Set([jwtSigningSecret(get), ...list(get('JWT_SECRET_PREVIOUS'))])];
}

export function secretMatchingToken(token: string, candidates: string[]): string {
  if (candidates.length > 1 && typeof token === 'string') {
    for (const secret of candidates) {
      try {
        signatureChecker.verify(token, { secret, ignoreExpiration: true });
        return secret;
      } catch {
        // tenta o próximo
      }
    }
  }
  return candidates[0];
}

export function sessionJwtSecretFor(token: string, get: EnvReader = fromProcessEnv): string {
  return secretMatchingToken(token, jwtVerificationSecrets(get));
}

export function rotatingJwtModuleOptions(
  get: EnvReader = fromProcessEnv,
  extra: Omit<JwtModuleOptions, 'secret' | 'secretOrKeyProvider'> = {},
): JwtModuleOptions {
  jwtSigningSecret(get);
  return {
    ...extra,
    secretOrKeyProvider: (requestType, tokenOrPayload, callOptions) => {
      const explicit = (callOptions as { secret?: string } | undefined)?.secret;
      if (explicit) return explicit;
      if (requestType === JwtSecretRequestType.SIGN) return jwtSigningSecret(get);
      return secretMatchingToken(tokenOrPayload as string, jwtVerificationSecrets(get));
    },
  };
}

export function passportSecretProvider(get: EnvReader = fromProcessEnv) {
  jwtSigningSecret(get);
  return (_request: unknown, rawJwtToken: string, done: (error: unknown, secret?: string) => void) => {
    try {
      done(null, sessionJwtSecretFor(rawJwtToken, get));
    } catch (error) {
      done(error);
    }
  };
}
