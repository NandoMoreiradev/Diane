export type OrderChannel = 'mesa' | 'retirada' | 'entrega' | 'balcao';
export type OrderStatus = 'novo' | 'preparo' | 'pronto' | 'entregue' | 'cancelado';
export type PaymentMethod = 'Pix' | 'Cartão' | 'Dinheiro';

export interface DeliveryZone {
  id: string;
  nome: string;
  ate: string;
  taxa: number;
  prazo: string;
  bairros: string[];
}

export interface DreConfig {
  custosFixos: Array<{ nome: string; valor: number }>;
  simples: number;
  taxas: Record<string, number>;
  perdas: number;
  diasAbertosNoMes: number;
  reserva: number;
  socios: string[];
}

export interface StoreConfig {
  whatsapp: string;
  abre: number;
  fecha: number;
  diasAbertos: number[];
  entrega: boolean;
  delivery: {
    pedidoMinimo: number;
    freteGratisAcima: number;
    custoPorEntrega: number;
    zonas: DeliveryZone[];
  };
  urlSite: string;
  mesas: Array<{ n: number; nome: string }>;
  dre: DreConfig;
}

export interface Product {
  id: string;
  cat: 'doces' | 'lanches' | 'cafes' | string;
  nome: string;
  desc: string;
  preco: number;
  custo: number;
  arte: string;
  sabores?: string | null;
  tag?: string | null;
  soNaMesa?: boolean;
}

export interface Combo {
  id: string;
  nome: string;
  desc: string;
  itens: string[];
  arte?: string[];
  preco: number;
  selo?: string | null;
  sabores?: string | null;
  pessoas: number;
  onde: string[];
}

export interface CatalogData {
  config: StoreConfig;
  sabores: Record<string, string[]>;
  saboresNome: Record<string, string>;
  produtos: Product[];
  combos: Combo[];
}

export interface CartItem {
  k: string;
  id: string;
  sabor: string | null;
  q: number;
}

export interface OrderItem {
  id: string;
  nome: string;
  q: number;
  preco: number;
  custo: number;
  sabor: string | null;
}

export interface Order {
  id: string;
  codigo: string;
  canal: OrderChannel;
  mesa: number | null;
  nome: string;
  telefone: string;
  local: string;
  bairro: string;
  quando: string;
  pagamento: string;
  obs: string;
  subtotal: number;
  frete: number;
  total: number;
  status: OrderStatus;
  criadoEm: number;
  em_preparo?: number | null;
  em_pronto?: number | null;
  em_entregue?: number | null;
  em_cancelado?: number | null;
  itens: OrderItem[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SOCIA' | 'BALCAO' | string;
  roleName?: string;
  permissions: string[];
}

export interface PermissionCatalogItem {
  key: string;
  label: string;
  group: string;
}

export interface RoleDefinition {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  permissions: string[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  roleId: string | null;
  roleName: string;
  directPermissions: string[];
  effectivePermissions: string[];
  active: boolean;
}
