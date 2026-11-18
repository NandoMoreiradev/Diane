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

## Usuários de desenvolvimento

`npm run prisma:seed` cria usuários de **demonstração** (`socia@diane.com.br` e `balcao@diane.com.br`).
As senhas vêm de `SEED_SOCIA_PASSWORD` / `SEED_BALCAO_PASSWORD` (ou padrões locais do código).
O seed **recusa rodar em produção**.

## Deploy no Railway (um serviço Web + PostgreSQL)

O serviço Web builda o front e serve `/` e `/api` na mesma origem (sem CORS).

1. Crie o projeto com um serviço **PostgreSQL** e um serviço **Web** ligado a este repositório.
2. Variáveis do serviço Web:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = 64+ caracteres aleatórios (o app não sobe com menos de 32)
   - `BOOTSTRAP_ADMIN_EMAIL` e `BOOTSTRAP_ADMIN_PASSWORD` (mín. 12 caracteres), só para o 1º deploy
   - opcional: `CORS_ORIGIN`, `TRUST_PROXY_HOPS` (padrão 2: Cloudflare + Railway)
3. No 1º deploy, o start roda `prisma migrate deploy` e o **bootstrap**, que cria cargos, cardápio
   inicial e o administrador. É idempotente e nunca sobrescreve senhas, preços ou configurações.
4. Depois do 1º login, **apague `BOOTSTRAP_ADMIN_PASSWORD`** e crie a equipe pela tela de usuários.
5. Cloudflare: DNS com proxy ligado, SSL/TLS **Full (strict)**, "Always Use HTTPS" e uma regra de
   rate-limit para `/api/auth/*`.
6. Ative backups do PostgreSQL no Railway.
