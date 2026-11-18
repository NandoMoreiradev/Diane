import {
  AdminUser,
  AuthUser,
  CatalogData,
  Combo,
  DeliveryZone,
  DreData,
  Order,
  OrderStatus,
  PermissionCatalogItem,
  Product,
  RoleDefinition,
} from '../types/diane';

const TOKEN_KEY = 'diane-auth-token';

export const brl = (v: number | undefined | null) =>
  (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const pct = (v: number) =>
  Number.isFinite(v) ? `${(v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%` : '–';

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string | null) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore storage errors
  }
};

let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) {
          setToken(null);
          return null;
        }
        const data = (await res.json()) as { accessToken: string };
        setToken(data.accessToken);
        return data.accessToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request<T>(path: string, init: RequestInit = {}, auth = false, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (auth) {
    const token = getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`/api${path}`, { ...init, headers, credentials: 'include' });
  if (res.status === 401 && auth && retry) {
    const newToken = await tryRefreshAccessToken();
    if (newToken) {
      return request<T>(path, init, auth, false);
    }
  }
  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) {
        message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getCatalog: () => request<CatalogData>('/catalog'),

  getDre: () => request<DreData>('/catalog/dre', {}, true),

  getAdminCatalog: () =>
    request<{ config: Record<string, unknown>; products: Array<Product & { ativo: boolean; custo: number }>; combos: Combo[] }>(
      '/catalog/admin',
      {},
      true,
    ),

  updateProduct: (id: string, payload: { preco?: number; custo?: number; ativo?: boolean }) =>
    request(`/catalog/products/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, true),

  updateConfig: (payload: {
    whatsapp?: string;
    urlSite?: string;
    abre?: number;
    fecha?: number;
    entrega?: boolean;
    pedidoMinimo?: number;
    freteGratisAcima?: number;
  }) =>
    request('/catalog/config', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, true),

  createOrder: (payload: {
    canal: 'mesa' | 'retirada' | 'entrega';
    mesa: number | null;
    nome: string;
    telefone: string;
    local: string;
    bairro: string;
    quando: string;
    pagamento: string;
    obs: string;
    itens: Array<{ id: string; q: number; sabor: string | null }>;
  }) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getOrder: (id: string) => request<Order>(`/orders/${encodeURIComponent(id)}`),

  login: (email: string, password: string) =>
    request<{ accessToken: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  refresh: () => tryRefreshAccessToken(),

  logout: () => request('/auth/logout', { method: 'POST' }),

  logoutAll: () => request('/auth/logout-all', { method: 'POST' }, true),

  me: () => request<AuthUser>('/auth/me', {}, true),

  listOrders: (desdeIso?: string) =>
    request<Order[]>(
      `/orders${desdeIso ? `?desde=${encodeURIComponent(desdeIso)}` : ''}`,
      {},
      true,
    ),

  createCounterSale: (payload: {
    nome: string;
    pagamento: string;
    itens: Array<{ id: string; q: number; sabor: string | null }>;
  }) =>
    request<Order>(
      '/orders/counter',
      {
        method: 'POST',
        body: JSON.stringify({ ...payload, canal: 'balcao' }),
      },
      true,
    ),

  updateOrderStatus: (id: string, status: OrderStatus) =>
    request<Order>(
      `/orders/${encodeURIComponent(id)}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
      true,
    ),

  getPermissionsCatalog: () => request<PermissionCatalogItem[]>('/users/permissions', {}, true),
  listRoles: () => request<RoleDefinition[]>('/users/roles', {}, true),
  listUsers: () => request<AdminUser[]>('/users', {}, true),
  createUser: (payload: {
    email: string;
    name: string;
    password: string;
    roleId?: string;
    directPermissions?: string[];
  }) =>
    request<AdminUser>('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true),
  updateUser: (
    id: string,
    payload: {
      name?: string;
      active?: boolean;
      roleId?: string | null;
      directPermissions?: string[];
      newPassword?: string;
    },
  ) =>
    request<AdminUser>(`/users/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, true),
};

export function normalizeBairro(s: string): string {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchBairro(catalog: CatalogData, nome: string): string | null {
  const alvo = normalizeBairro(nome)
    .replace(/^(bairro|b\.) /, '')
    .replace(/^18 do forte$/, 'dezoito do forte')
    .replace(/^13 de julho$/, 'treze de julho');
  for (const z of catalog.config.delivery.zonas) {
    const b = z.bairros.find((x) => normalizeBairro(x) === alvo);
    if (b) return b;
  }
  return null;
}

export function findZone(catalog: CatalogData, bairro: string): DeliveryZone | null {
  const b = matchBairro(catalog, bairro);
  if (!b) return null;
  return catalog.config.delivery.zonas.find((z) => z.bairros.includes(b)) ?? null;
}

export function calcFrete(catalog: CatalogData, subtotal: number, bairro: string): number | null {
  const z = findZone(catalog, bairro);
  if (!z) return null;
  const { freteGratisAcima } = catalog.config.delivery;
  return freteGratisAcima && subtotal >= freteGratisAcima ? 0 : z.taxa;
}

export function findCatalogItem(catalog: CatalogData, id: string): Product | Combo | null {
  return catalog.produtos.find((p) => p.id === id) ?? catalog.combos.find((c) => c.id === id) ?? null;
}

export function isCombo(item: Product | Combo): item is Combo {
  return 'itens' in item;
}
