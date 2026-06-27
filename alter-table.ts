import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Adding columns via raw SQL...")
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "phone" TEXT;`)
    console.log("Added phone")
  } catch (e: any) { console.log("phone might exist", e.message) }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "employeeIdStr" TEXT UNIQUE;`)
    console.log("Added employeeIdStr")
  } catch (e: any) { console.log("employeeIdStr might exist", e.message) }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "designation" TEXT;`)
    console.log("Added designation")
  } catch (e: any) { console.log("designation might exist", e.message) }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "joiningDate" TIMESTAMP(3);`)
    console.log("Added joiningDate")
  } catch (e: any) { console.log("joiningDate might exist", e.message) }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;`)
    console.log("Added isActive")
  } catch (e: any) { console.log("isActive might exist", e.message) }

  console.log("Done adding columns.")
}

main().finally(() => prisma.$disconnect())
