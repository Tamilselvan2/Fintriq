import { PrismaClient } from '@prisma/client';
import { OrganizationService } from './src/modules/organization/organization.service';

const prisma = new PrismaClient();

async function test() {
  const user = await prisma.user.findFirst();
  if (!user) { console.log('No user'); return; }
  
  const service = new OrganizationService();
  console.log('Testing inviteMember...');
  try {
    await service.inviteMember(user.orgId, 'dummy@test.com', 'USER', user.id);
    console.log('Success!');
  } catch (err) {
    console.error('Error:', err);
  }
}

test().catch(console.error).finally(() => process.exit(0));
