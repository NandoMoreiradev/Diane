import type { Request } from 'express';

/**
 * IP real do cliente. Em produção o tráfego passa por Cloudflare -> Railway:
 * o Cloudflare envia `CF-Connecting-IP`; sem ele (acesso local/direto) usamos
 * `req.ip`, que respeita `trust proxy` configurado em main.ts.
 */
export function clientIp(req: Pick<Request, 'headers' | 'ip'>): string {
  const cf = req.headers['cf-connecting-ip'];
  const value = Array.isArray(cf) ? cf[0] : cf;
  return (value && value.trim()) || req.ip || 'unknown';
}
