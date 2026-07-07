// scripts/reset-password.ts
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const newPassword = "admin123";
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log("Hash baru:", hashedPassword);

    await prisma.user.update({
      where: { email: "admin@kreasimandiriglass69.com" },
      data: { password: hashedPassword },
    });

    console.log("✅ Password berhasil direset!");
    console.log("Email: admin@kreasimandiriglass69.com");
    console.log("Password: admin123");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();