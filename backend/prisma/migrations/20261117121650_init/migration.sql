-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SOCIA', 'BALCAO');

-- CreateEnum
CREATE TYPE "OrderChannel" AS ENUM ('mesa', 'retirada', 'entrega', 'balcao');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('novo', 'preparo', 'pronto', 'entregue', 'cancelado');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'BALCAO',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "abre" INTEGER NOT NULL DEFAULT 7,
    "fecha" INTEGER NOT NULL DEFAULT 17,
    "diasAbertos" INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5, 6]::INTEGER[],
    "entrega" BOOLEAN NOT NULL DEFAULT true,
    "pedidoMinimo" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "freteGratisAcima" DOUBLE PRECISION NOT NULL DEFAULT 80,
    "custoPorEntrega" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "urlSite" TEXT NOT NULL DEFAULT '',
    "mesas" JSONB NOT NULL DEFAULT '[]',
    "dre" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryZone" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ate" TEXT NOT NULL,
    "taxa" DOUBLE PRECISION NOT NULL,
    "prazo" TEXT NOT NULL,
    "bairros" TEXT[],
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DeliveryZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlavorGroup" (
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "sabores" TEXT[],

    CONSTRAINT "FlavorGroup_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "cat" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "custo" DOUBLE PRECISION NOT NULL,
    "arte" TEXT NOT NULL,
    "saboresSlug" TEXT,
    "tag" TEXT,
    "soNaMesa" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Combo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "itens" TEXT[],
    "arte" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preco" DOUBLE PRECISION NOT NULL,
    "selo" TEXT,
    "saboresSlug" TEXT,
    "pessoas" INTEGER NOT NULL DEFAULT 1,
    "onde" TEXT[] DEFAULT ARRAY['delivery']::TEXT[],
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Combo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "canal" "OrderChannel" NOT NULL,
    "mesa" INTEGER,
    "nome" TEXT NOT NULL DEFAULT '',
    "telefone" TEXT NOT NULL DEFAULT '',
    "local" TEXT NOT NULL DEFAULT '',
    "bairro" TEXT NOT NULL DEFAULT '',
    "quando" TEXT NOT NULL DEFAULT 'agora',
    "pagamento" TEXT NOT NULL,
    "obs" TEXT NOT NULL DEFAULT '',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "frete" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'novo',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emPreparo" TIMESTAMP(3),
    "emPronto" TIMESTAMP(3),
    "emEntregue" TIMESTAMP(3),
    "emCancelado" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "q" INTEGER NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "custo" DOUBLE PRECISION NOT NULL,
    "sabor" TEXT,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Order_criadoEm_idx" ON "Order"("criadoEm");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_saboresSlug_fkey" FOREIGN KEY ("saboresSlug") REFERENCES "FlavorGroup"("slug") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Combo" ADD CONSTRAINT "Combo_saboresSlug_fkey" FOREIGN KEY ("saboresSlug") REFERENCES "FlavorGroup"("slug") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
