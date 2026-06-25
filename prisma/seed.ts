import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create Sites
  const siteA = await prisma.site.upsert({
    where: { code: 'SITE-A' },
    update: {},
    create: {
      name: 'Main Manufacturing Plant',
      code: 'SITE-A',
      location: 'Mumbai'
    }
  })

  const siteB = await prisma.site.upsert({
    where: { code: 'SITE-B' },
    update: {},
    create: {
      name: 'Logistics Hub',
      code: 'SITE-B',
      location: 'Delhi'
    }
  })

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pgepl.com' },
    update: {},
    create: {
      email: 'admin@pgepl.com',
      password: adminPassword,
      name: 'System Admin',
      role: 'ADMIN',
      department: 'IT',
      siteId: siteA.id
    }
  })

  // Create HR User
  const hrPassword = await bcrypt.hash('hr123', 10)
  const hr = await prisma.user.upsert({
    where: { email: 'hr@pgepl.com' },
    update: {},
    create: {
      email: 'hr@pgepl.com',
      password: hrPassword,
      name: 'HR Manager',
      role: 'HR',
      department: 'Human Resources',
      siteId: siteA.id
    }
  })

  // Create Employee
  const empPassword = await bcrypt.hash('emp123', 10)
  const employee = await prisma.user.upsert({
    where: { email: 'employee@pgepl.com' },
    update: {},
    create: {
      email: 'employee@pgepl.com',
      password: empPassword,
      name: 'John Doe',
      role: 'EMPLOYEE',
      department: 'Assembly',
      siteId: siteB.id
    }
  })

  console.log({ admin, hr, employee })
  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
