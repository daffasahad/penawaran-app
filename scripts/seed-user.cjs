const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@contoh.com";
  const plain = "123456";
  const hash = await bcrypt.hash(plain, 10);

  await prisma.user.upsert({
    where: { email },
    update: { name: "Admin", password: hash },
    create: { name: "Admin", email, password: hash },
  });

  console.log("✅ User siap login:");
  console.log("Email:", email);
  console.log("Password:", plain);
}

main().finally(() => prisma.$disconnect());
