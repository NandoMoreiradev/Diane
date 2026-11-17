# Dianê · Site de Pedidos e Portal do Balcão

Aplicação full-stack da **Dianê** (Brigaderia & Café Takeaway — Aracaju/SE), migrada para:

- **Backend:** NestJS + TypeScript + Prisma ORM + PostgreSQL + Server-Sent Events (SSE)
- **Frontend:** React + TypeScript + Vite + `styled-components` + React Router
- **Deploy:** Configurado para **Railway** (`railway.json`)

## Estrutura do repositório

```text
├── backend/              # API NestJS, schema Prisma, migrations e seed
│   ├── prisma/
│   │   ├── schema.prisma # Modelos: User, StoreConfig, DeliveryZone, FlavorGroup, Product, Combo, Order, OrderItem
│   │   └── seed.ts       # Seed inicial com cardápio, combos, zonas de entrega, DRE e usuários da equipe
│   └── src/
│       ├── auth/         # Login JWT da equipe
│       ├── catalog/      # Cardápio, combos, sabores, zonas e configurações
│       └── orders/       # Pedidos, venda no balcão e streams SSE em tempo real
├── frontend/             # SPA React + styled-components
│   ├── public/midia/     # Fotos e logos SVG da marca
│   └── src/
│       ├── pages/
│       │   ├── HomePage.tsx    # Site público (/)
│       │   ├── CounterPage.tsx # Portal do balcão (/balcao)
│       │   └── QrCodesPage.tsx # Placas QR Code para impressão (/qr-codes)
│       └── components/
├── docker-compose.yml    # PostgreSQL 16 local para desenvolvimento
├── railway.json          # Configuração de build e start no Railway
└── package.json          # Scripts unificados na raiz
```

## Rodando localmente

1. **Subir o PostgreSQL local (Docker):**
   ```bash
   docker compose up -d
   ```

2. **Instalar dependências:**
   ```bash
   npm run install:all
   ```

3. **Gerar Prisma Client, rodar migrações e popular o banco (seed):**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

4. **Iniciar backend e frontend em desenvolvimento:**
   ```bash
   npm run dev
   ```
   - Site: `http://localhost:5173`
   - Balcão: `http://localhost:5173/balcao`
   - QR Codes: `http://localhost:5173/qr-codes`
   - API: `http://localhost:3001/api`

## Credenciais iniciais (seed)

> Troque as senhas antes de usar em produção.

- **Sócia (acesso completo + aba Resultado/DRE):** `socia@diane.com.br` / `diane2026`
- **Equipe Balcão (pedidos e venda no balcão):** `balcao@diane.com.br` / `balcao2026`

## Deploy no Railway

1. Crie um projeto no Railway com um serviço **PostgreSQL** e um serviço **Web** conectado a este repositório.
2. No serviço Web, configure as variáveis de ambiente:
   - `DATABASE_URL`: referência da variável do PostgreSQL do Railway (`${{Postgres.DATABASE_URL}}`)
   - `JWT_SECRET`: string aleatória longa e segura
   - `NODE_ENV`: `production`
3. O Railway usará automaticamente o [railway.json](railway.json) para rodar `npm run build` e `npm run start:prod` (que aplica `prisma migrate deploy` e sobe o servidor NestJS servindo a API `/api/*` e o frontend buildado em `frontend/dist`).
