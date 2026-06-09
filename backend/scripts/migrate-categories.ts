import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normalizeCategoryName(name: string): string {
  // Trim whitespace
  let normalized = name.trim();
  // Collapse duplicate spaces
  normalized = normalized.replace(/\s+/g, ' ');
  // Title Case conversion
  normalized = normalized.split(' ').map(word => {
    if (word.length === 0) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
  return normalized;
}

async function migrateCategories() {
  console.log('Starting category migration...');
  
  // Get all unique categories across all organizations
  const distinctCategories = await prisma.transaction.findMany({
    select: {
      category: true,
      orgId: true,
    },
    distinct: ['category', 'orgId'],
  });

  console.log(`Found ${distinctCategories.length} distinct category entries to process.`);

  let createdCount = 0;
  let skippedCount = 0;

  for (const entry of distinctCategories) {
    if (!entry.category) continue;

    const normalizedName = normalizeCategoryName(entry.category);

    try {
      // Upsert to ensure we don't create duplicates within the same org
      await prisma.category.upsert({
        where: {
          orgId_name: {
            orgId: entry.orgId,
            name: normalizedName,
          }
        },
        update: {},
        create: {
          name: normalizedName,
          orgId: entry.orgId,
          isActive: true,
        }
      });
      createdCount++;
    } catch (err) {
      console.error(`Failed to migrate category "${entry.category}" for org ${entry.orgId}:`, err);
      skippedCount++;
    }
  }

  console.log('Migration complete!');
  console.log(`Successfully created/verified: ${createdCount}`);
  console.log(`Skipped/Errors: ${skippedCount}`);
}

migrateCategories()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
