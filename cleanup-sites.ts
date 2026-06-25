import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("Scanning for unused sites...")
  const sites = await prisma.site.findMany({
    include: {
      _count: {
        select: { users: true, grievances: true }
      }
    }
  })

  let deleted = 0
  for (const site of sites) {
    if (site._count.users === 0 && site._count.grievances === 0) {
      console.log(`Deleting unused site: ${site.name}`)
      await prisma.site.delete({ where: { id: site.id } })
      deleted++
    } else {
      console.log(`Keeping site: ${site.name} (Users: ${site._count.users}, Cases: ${site._count.grievances})`)
    }
  }

  console.log(`\nDeleted ${deleted} unused sites that were not in the Excel data.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
