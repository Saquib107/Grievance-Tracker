import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function wipeDB() {
  console.log("Wiping all Grievances...")
  await prisma.grievance.deleteMany({})

  console.log("Wiping all HRs and Employees (keeping ADMIN)...")
  await prisma.user.deleteMany({
    where: {
      role: { not: 'ADMIN' }
    }
  })

  console.log("Database wiped clean!")
}

wipeDB().catch(console.error).finally(() => prisma.$disconnect())
