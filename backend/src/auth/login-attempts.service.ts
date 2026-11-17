import { Injectable, Logger } from '@nestjs/common';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;

interface AttemptEntry {
  count: number;
  expiresAt: number;
}

@Injectable()
export class LoginAttemptsService {
  private readonly logger = new Logger(LoginAttemptsService.name);
  private readonly attempts = new Map<string, AttemptEntry>();

  private key(email: string, scope: string): string {
    return `${scope}:${email.trim().toLowerCase()}`;
  }

  getLockRemainingSeconds(email: string, scope = 'login'): number {
    const k = this.key(email, scope);
    const entry = this.attempts.get(k);
    if (!entry) return 0;
    if (Date.now() > entry.expiresAt) {
      this.attempts.delete(k);
      return 0;
    }
    if (entry.count < MAX_ATTEMPTS) return 0;
    return Math.ceil((entry.expiresAt - Date.now()) / 1000);
  }

  recordFailure(email: string, scope = 'login'): void {
    const k = this.key(email, scope);
    const now = Date.now();
    const current = this.attempts.get(k);
    if (!current || now > current.expiresAt) {
      this.attempts.set(k, { count: 1, expiresAt: now + WINDOW_MS });
      return;
    }
    const nextCount = current.count + 1;
    const expiresAt = nextCount >= MAX_ATTEMPTS ? now + LOCK_MS : current.expiresAt;
    this.attempts.set(k, { count: nextCount, expiresAt });
    if (nextCount === MAX_ATTEMPTS) {
      this.logger.warn(`Conta ${k} bloqueada temporariamente por ${LOCK_MS / 60000} min após ${nextCount} falhas.`);
    }
  }

  reset(email: string, scope = 'login'): void {
    this.attempts.delete(this.key(email, scope));
  }
}
