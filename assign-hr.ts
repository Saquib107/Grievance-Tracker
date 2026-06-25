import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function assignHR() {
  console.log("Starting HR Assignment Script...")
  
  // Find all distinct concerned persons
  const grievances = await prisma.grievance.findMany({
    where: {
      concernedPerson: { not: null, not: "" }
    },
    select: {
      id: true,
      concernedPerson: true,
      siteId: true
    }
  })

  const hrMap = new Map<string, string>() // Name -> HR User ID
  const hrSiteMap = new Map<string, string>() // Name -> Site ID (most common site for this HR)

  // Map HRs to their primary site
  for (const g of grievances) {
    if (g.concernedPerson) {
      const name = g.concernedPerson.trim()
      if (g.siteId) {
        hrSiteMap.set(name, g.siteId)
      }
    }
  }

  const defaultPassword = await bcrypt.hash("Pgepl@123", 10)
  let createdCount = 0

  // Create HR Accounts
  for (const [name, siteId] of hrSiteMap.entries()) {
    // Generate an email based on the name
    const emailPrefix = name.toLowerCase().replace(/[^a-z0-9]/g, '') || `hr${Math.floor(Math.random() * 1000)}`
    const email = `${emailPrefix}@pgepl.local`

    let user = await prisma.user.findFirst({
      where: { name: name, role: "HR" }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: defaultPassword,
          role: "HR",
          siteId,
          department: "Human Resources",
          designation: "HR Manager",
          isActive: true
        }
      })
      console.log(`Created HR User: ${name} (${email})`)
      createdCount++
    }
    
    hrMap.set(name, user.id)
  }

  // Update grievances
  let updatedCount = 0
  for (const g of grievances) {
    if (g.concernedPerson) {
      const hrId = hrMap.get(g.concernedPerson.trim())
      if (hrId) {
        await prisma.grievance.update({
          where: { id: g.id },
          data: { assignedToId: hrId }
        })
        updatedCount++
      }
    }
  }

  console.log(`\nComplete! Created ${createdCount} HR users and assigned ${updatedCount} cases.`)
}

assignHR().catch(console.error).finally(() => prisma.$disconnect())
