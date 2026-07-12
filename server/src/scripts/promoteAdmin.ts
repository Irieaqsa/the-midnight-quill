import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const adminEmails = ['dasritasree1@gmail.com', 'jnawaj.official@gmail.com'];

async function main() {
  console.log('🚀 Running database update script for administrators...');

  for (const email of adminEmails) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user) {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
      });
      console.log(`✅ Promoted existing user to ADMIN: ${updated.email}`);
    } else {
      console.log(`ℹ️ User not registered yet: ${email} (will be auto-promoted to ADMIN upon signup)`);
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Error executing promote script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
