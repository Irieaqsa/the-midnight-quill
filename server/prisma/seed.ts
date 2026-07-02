import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SQLite TMQ database...');

  // 1. Clean existing records
  await prisma.comment.deleteMany({});
  await prisma.submissionTag.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.teamMember.deleteMany({});
  await prisma.podcastEpisode.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.instagramHighlight.deleteMany({});
  await prisma.newsletterSubscriber.deleteMany({});

  // 2. Pre-hash password
  const passwordHash = bcrypt.hashSync('password123', 10);

  // 3. Create Core Users
  const imran = await prisma.user.create({
    data: {
      email: 'irie1imran@mail.com',
      passwordHash,
      name: 'Imran Ali',
      role: 'ADMIN',
      bio: 'Founder of TMQ. Writer of midnight verses and raw truths.',
      avatarUrl: '/images/team/irie.png',
    },
  });

  const ritashree = await prisma.user.create({
    data: {
      email: 'dasritasree1@gmail.com',
      passwordHash,
      name: 'Ritashree',
      role: 'EDITOR',
      bio: 'Co-founder and editorial voice. Writes about memory, grief, and grace.',
      avatarUrl: '/images/team/ritashree.png',
    },
  });

  const shagnik = await prisma.user.create({
    data: {
      email: 'bhattacharyashagnik2@gmail.com',
      passwordHash,
      name: 'Shagnik',
      role: 'EDITOR',
      bio: 'Visual storyteller. Designs the look and feel of TMQs digital presence.',
      avatarUrl: '/images/team/shagnik.png',
    },
  });

  const aryan = await prisma.user.create({
    data: {
      email: 'aryan.chatterjee04@gmail.com',
      passwordHash,
      name: 'Aryan Chatterjee',
      role: 'MEMBER',
      bio: 'Writes about identity, the city, and the spaces between silence.',
      avatarUrl: '/images/team/aryan.png',
    },
  });

  const jovial = await prisma.user.create({
    data: {
      email: 'jovialroutray@gmail.com',
      passwordHash,
      name: 'Jovial Routray',
      role: 'MEMBER',
      bio: 'Voice of the margins. Writes monologues and scripts for performance.',
      avatarUrl: '/images/team/jovial.png',
    },
  });

  console.log('Seeded users:', { imran: imran.email, ritashree: ritashree.email });

  // 4. Seed all 29 Team Members from Notion
  const teamMembers = [
    { name: 'Imran Ali', role: 'Founder & President', order: 1, bio: 'Founder & President' },
    { name: 'Ritashree', role: 'Co-Founder & VP', order: 2, bio: 'Co-Founder & Vice President' },
    { name: 'Shagnik', role: 'Co-Founder & Social Media Lead', order: 3, bio: 'Co-Founder & Lead of Literature Legacy' },
    { name: 'Aryan Chatterjee', role: 'Founding Member & Writer', order: 4, bio: 'Founding Member' },
    { name: 'Juntecum Nawaj', role: 'Founding Member & Writer', order: 5, bio: 'Founding Member' },
    { name: 'Jovial Routray', role: 'Lead of Script Writers', order: 6, bio: 'Lead of Script Writers' },
    { name: 'Sucheta Dutta', role: 'Lead of Designers', order: 7, bio: 'Lead of Designers' },
    { name: 'Aashish Yadav', role: 'Art Crafter', order: 8, bio: 'Part-Time Art Crafter' },
    { name: 'Abhinav', role: 'Writer', order: 9, bio: 'Part-Time Writer' },
    { name: 'Abhishek', role: 'Writer', order: 10, bio: 'Part-Time Writer' },
    { name: 'Adrita Sarkar', role: 'Writer', order: 11, bio: 'Part-Time Writer' },
    { name: 'Antara Das', role: 'Writer', order: 12, bio: 'Writer' },
    { name: 'Archita', role: 'Writer', order: 13, bio: 'Writer (Currently on vacation)' },
    { name: 'Arindam Sarkar', role: 'Writer', order: 14, bio: 'Part-Time Writer' },
    { name: 'Asghar Hassan', role: 'Writer & Graphic Designer', order: 15, bio: 'Writer & Graphic Designer' },
    { name: 'Asmita Chatterjee', role: 'Writer', order: 16, bio: 'Part-Time Writer' },
    { name: 'Barsha Patra', role: 'Graphic Designer', order: 17, bio: 'Part-Time Graphic Designer' },
    { name: 'Diya Dasgupta', role: 'Writer', order: 18, bio: 'Writer' },
    { name: 'Geet', role: 'Writer', order: 19, bio: 'Part-Time Writer' },
    { name: 'Gunveen Kaur', role: 'Writer', order: 20, bio: 'Writer' },
    { name: 'Mohammad Zeeshan Ahmed', role: 'Writer', order: 21, bio: 'Part-Time Writer' },
    { name: 'Neestha Rath', role: 'Writer', order: 22, bio: 'Part-Time Writer' },
    { name: 'Rohit Gupta', role: 'Marketing', order: 23, bio: 'Part-Time Marketing Lead' },
    { name: 'Saishree Priyadarshini', role: 'Writer', order: 24, bio: 'Part-Time Writer' },
    { name: 'Sneha Chatterjee', role: 'Writer', order: 25, bio: 'Part-Time Writer' },
    { name: 'Subhangkhi', role: 'Writer', order: 26, bio: 'Part-Time Writer' },
    { name: 'Suryash Gupta', role: 'Writer', order: 27, bio: 'Part-Time Writer' },
    { name: 'Yatika Gupta', role: 'Writer', order: 28, bio: 'Part-Time Writer' },
    { name: 'Zara', role: 'Writer', order: 29, bio: 'Part-Time Writer' },
  ];

  for (const m of teamMembers) {
    const filename = m.name.toLowerCase().replace(/\s+/g, '_');
    await prisma.teamMember.create({
      data: {
        name: m.name,
        role: m.role,
        bio: m.bio,
        order: m.order,
        avatarUrl: `/images/team/${filename}.jpg`,
      },
    });
  }
  console.log(`Seeded ${teamMembers.length} team members`);

  // 5. Create Tags
  const tagNames = ['love', 'night', 'solitude', 'grief', 'healing', 'identity', 'family', 'spoken word'];
  const tagsMap: Record<string, any> = {};

  for (const name of tagNames) {
    const tag = await prisma.tag.create({
      data: { name },
    });
    tagsMap[name] = tag;
  }

  // 6. Create Submissions
  const submissionsData = [
    {
      authorId: imran.id,
      title: 'Whispers at 2AM',
      body: 'In the quiet spacing of the night, when the crickets talk and the neon lights hum, we scribble down words we will never say to your face. We count the decimals of a love that refused to call itself enough.',
      excerpt: 'In the quiet spacing of the night, we scribble down words we will never say...',
      category: 'POETRY',
      status: 'PUBLISHED',
      aiDeclaration: true,
      publishedAt: new Date('2025-10-18T02:00:00Z'),
      tags: ['love', 'night', 'solitude'],
    },
    {
      authorId: ritashree.id,
      title: 'The Art of Letting Go',
      body: 'You do not learn to let go. You practice it, every morning, like a quiet prayer. You watch the steam rise from your tea, you watch the fog clear from the window pane, and you understand that some things are meant to be carried only in memory.',
      excerpt: 'You do not learn to let go. You practice it, every morning, like a quiet prayer...',
      category: 'PROSE',
      status: 'PUBLISHED',
      aiDeclaration: true,
      publishedAt: new Date('2025-10-22T08:00:00Z'),
      tags: ['grief', 'healing'],
    },
    {
      authorId: aryan.id,
      title: 'Ink Stains on My Soul',
      body: 'I carried the weight of the city in my boots, and the silence of a hundred missed calls in my pocket. We talk in margins because the center is too crowded with noise. Here, every ink stain is an identity.',
      excerpt: 'I carried the weight of the city in my boots, and the silence in my pocket...',
      category: 'POETRY',
      status: 'PUBLISHED',
      aiDeclaration: true,
      publishedAt: new Date('2025-11-03T10:00:00Z'),
      tags: ['identity', 'solitude'],
    },
    {
      authorId: jovial.id,
      title: 'Monologues from the Margins',
      body: 'They told me to stand straight and speak clearly. But my voice is a fractured glass Sunday, reflecting shards of a story they never bothered to read. I read this script not to be heard by you, but to be known by me.',
      excerpt: 'They told me to stand straight and speak clearly. But my voice is a fractured glass Sunday...',
      category: 'SPOKEN_WORD_SCRIPT',
      status: 'PUBLISHED',
      aiDeclaration: true,
      publishedAt: new Date('2025-11-14T15:00:00Z'),
      tags: ['spoken word', 'family'],
    },
  ];

  for (const s of submissionsData) {
    const submission = await prisma.submission.create({
      data: {
        authorId: s.authorId,
        title: s.title,
        body: s.body,
        excerpt: s.excerpt,
        category: s.category,
        status: s.status,
        aiDeclaration: s.aiDeclaration,
        publishedAt: s.publishedAt,
        featuredOnDate: s.title === 'Whispers at 2AM' ? new Date() : null, // Featured today
      },
    });

    for (const tagName of s.tags) {
      await prisma.submissionTag.create({
        data: {
          submissionId: submission.id,
          tagId: tagsMap[tagName].id,
        },
      });
    }
  }
  console.log('Seeded submissions & tags');

  // 7. Seed Podcast Episode S1E1
  await prisma.podcastEpisode.create({
    data: {
      title: 'Why We Built This',
      description: 'Three founders sit down together for the first time on audio to talk about why TMQ exists, what we built it for, and where we are taking it. No scripts, no performance — just honest conversation.',
      spotifyUrl: 'https://open.spotify.com/episode/390VKi8Gva4vNhUKB437qo?si=P4kUbyTrQPyd3_vsXANwDw',
      publishedAt: new Date('2026-05-03T05:51:00Z'),
    },
  });
  console.log('Seeded podcast episode S1E1');

  // 8. Seed Instagram Curated Highlights
  const igHighlights = [
    {
      imageUrl: '/images/instagram/post1.webp',
      caption: 'Alas! A devil can find redemption perhaps in the arms of an angel. Written by @arindamsarkarz, Designed by @ritasree04',
      linkUrl: 'https://www.instagram.com/p/C6qredemption/',
      order: 1,
    },
    {
      imageUrl: '/images/instagram/post2.webp',
      caption: 'Beneath my skin, stories bloom where silence once lived. Written by @theylovegeetie, Designed by @percabethnewt',
      linkUrl: 'https://www.instagram.com/p/C6silence/',
      order: 2,
    },
    {
      imageUrl: '/images/instagram/post3.webp',
      caption: 'The Final act of love... make sure the last stroke is your stroke. Crafted by @irieimran',
      linkUrl: 'https://www.instagram.com/p/C6lovefinal/',
      order: 3,
    },
  ];

  for (const highlight of igHighlights) {
    await prisma.instagramHighlight.create({
      data: highlight,
    });
  }
  console.log('Seeded Instagram highlights');

  // 9. Seed Subscribers
  await prisma.newsletterSubscriber.create({
    data: {
      email: 'member1@example.com',
      source: 'site-footer',
    },
  });
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
