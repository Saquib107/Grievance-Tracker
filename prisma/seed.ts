import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash("password123", 10)

  // Seed Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@pgepl.com" },
    update: {},
    create: {
      email: "admin@pgepl.com",
      name: "Admin User",
      password,
      role: "ADMIN",
      department: "Administration",
    },
  })

  const hr = await prisma.user.upsert({
    where: { email: "hr@pgepl.com" },
    update: {},
    create: {
      email: "hr@pgepl.com",
      name: "HR User",
      password,
      role: "HR",
      department: "Human Resources",
    },
  })

  const employee = await prisma.user.upsert({
    where: { email: "employee@pgepl.com" },
    update: {},
    create: {
      email: "employee@pgepl.com",
      name: "John Employee",
      password,
      role: "EMPLOYEE",
      department: "Engineering",
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: "manager@pgepl.com" },
    update: {},
    create: {
      email: "manager@pgepl.com",
      name: "Jane Manager",
      password,
      role: "MANAGER",
      department: "Engineering",
    },
  })

  // Seed Categories
  const categories = [
    "Workplace Harassment",
    "Discrimination",
    "Payroll Issues",
    "Leave Issues",
    "Manager Conduct",
    "Safety Concerns",
    "Policy Violation",
    "Other",
  ]

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  console.log({ admin, hr, employee, manager })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
