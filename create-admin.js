import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const existing = await prisma.user.findFirst({
      where: { email: "founder@orion.local" }
    });

    if (existing) {
      console.log("✅ Admin user already exists");
      await prisma.$disconnect();
      return;
    }

    const passwordHash = await bcrypt.hash("ChangeMe123!#", 12);

    const user = await prisma.user.create({
      data: {
        email: "founder@orion.local",
        passwordHash: passwordHash,
        firstName: "Orion",
        lastName: "Admin",
        role: "SUPER_ADMIN"
      }
    });

    console.log("✅ Admin user created successfully!");
    console.log("Email: founder@orion.local");
    console.log("Password: ChangeMe123!#");
    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createAdmin();

