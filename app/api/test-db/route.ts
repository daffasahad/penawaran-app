// app/api/test-db/route.ts
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test 1: Database connection
    await prisma.$connect();
    console.log("✅ Database connected");

    // Test 2: Find user
    const user = await prisma.user.findUnique({
      where: { email: "admin@kreasimandiriglass69.com" },
    });

    console.log("👤 User found:", !!user);

    if (!user) {
      return Response.json({ 
        success: false, 
        error: "User not found in database" 
      });
    }

    // Test 3: Password info
    return Response.json({ 
      success: true, 
      userExists: true,
      email: user.email,
      passwordHash: user.password.substring(0, 20) + "...",
      passwordLength: user.password.length
    });
  } catch (error: any) {
    console.error("❌ Database error:", error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}