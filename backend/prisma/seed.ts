import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Supprimer les avatars existants
  await prisma.avatar.deleteMany();

  // Créer les avatars prédéfinis
  const avatars = [
    {
      pictureAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    },
    {
      pictureAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    },
    {
      pictureAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    },
    {
      pictureAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
    },
    {
      pictureAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
    },
  ];

  for (const avatar of avatars) {
    await prisma.avatar.create({
      data: avatar,
    });
  }

  console.log('Avatars créés avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 