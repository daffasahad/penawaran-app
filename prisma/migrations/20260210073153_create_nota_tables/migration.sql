-- CreateTable
CREATE TABLE "Nota" (
    "id" TEXT NOT NULL,
    "nomorNota" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kepadaYth" TEXT NOT NULL,
    "noTelp" TEXT NOT NULL,
    "total" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "dp" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "sisa" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotaItem" (
    "id" TEXT NOT NULL,
    "notaId" TEXT NOT NULL,
    "no" INTEGER NOT NULL,
    "jenisBarang" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "harga" DECIMAL(15,2) NOT NULL,
    "jumlah" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "NotaItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Nota_nomorNota_key" ON "Nota"("nomorNota");

-- CreateIndex
CREATE INDEX "NotaItem_notaId_idx" ON "NotaItem"("notaId");

-- AddForeignKey
ALTER TABLE "NotaItem" ADD CONSTRAINT "NotaItem_notaId_fkey" FOREIGN KEY ("notaId") REFERENCES "Nota"("id") ON DELETE CASCADE ON UPDATE CASCADE;
