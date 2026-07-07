// prisma.config.ts

import "dotenv/config"; // 👉 ini yang penting, untuk load .env

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",          // kalau ada, biarkan saja
  datasource: {
    url: env("DATABASE_URL"), // sekarang env() akan bisa baca dari .env
  },
});
