/**
 * Separação por domínio (um único serviço atende os três):
 *  - casadiane.com.br      -> site público ("site")
 *  - app.casadiane.com.br  -> sistema da equipe ("app")
 *  - api.casadiane.com.br  -> somente API (o back-end responde 404 fora de /api)
 * Em localhost, IPs e domínios sem esses prefixos ("all"), todas as rotas ficam ativas.
 */
export type HostMode = 'site' | 'app' | 'all';

const isLocal = (h: string) => h === 'localhost' || /^[\d.]+$/.test(h) || h.includes(':') || h.endsWith('.localhost');

export function detectHostMode(hostname = window.location.hostname): HostMode {
  const h = hostname.toLowerCase();
  if (isLocal(h)) return 'all';
  if (h.startsWith('app.')) return 'app';
  // Separação site/sistema só vale quando o domínio app. existe (VITE_SPLIT_HOSTS=true no build).
  // Com um único domínio, o sistema fica em <domínio>/balcao.
  if (import.meta.env.VITE_SPLIT_HOSTS === 'true' && !h.endsWith('.up.railway.app')) return 'site';
  return 'all';
}

/** Origem do site público (remove o prefixo `app.` quando estamos no sistema). */
export function publicSiteOrigin(loc: Pick<Location, 'protocol' | 'hostname' | 'port'> = window.location): string {
  const host = loc.hostname.replace(/^app\./i, '');
  return `${loc.protocol}//${host}${loc.port ? `:${loc.port}` : ''}`;
}

/** Origem do sistema da equipe (adiciona `app.` quando estamos no site público). */
export function staffAppOrigin(loc: Pick<Location, 'protocol' | 'hostname' | 'port'> = window.location): string {
  const host = /^app\./i.test(loc.hostname) ? loc.hostname : `app.${loc.hostname}`;
  return `${loc.protocol}//${host}${loc.port ? `:${loc.port}` : ''}`;
}
