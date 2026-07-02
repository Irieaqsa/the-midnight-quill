const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper to normalize caption text for fuzzy string matching
function getCaptionKey(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, '') // Remove all non-alphanumeric chars
    .substring(0, 60);          // Match on the first 60 alphanumeric characters
}

async function main() {
  const postsHtmlPath = 'C:/Users/KIIT0001/Downloads/instagram-the_midnight_quilll-2026-05-10-g7xDVUGy/your_instagram_activity/media/posts_1.html';
  const viewedHtmlPath = 'C:/Users/KIIT0001/Downloads/instagram-the_midnight_quilll-2026-05-10-g7xDVUGy/ads_information/ads_and_topics/posts_viewed.html';
  const likedHtmlPath = 'C:/Users/KIIT0001/Downloads/instagram-the_midnight_quilll-2026-05-10-g7xDVUGy/your_instagram_activity/likes/liked_posts.html';

  if (!fs.existsSync(postsHtmlPath)) {
    console.error('Instagram posts_1.html file not found!');
    return;
  }

  const captionToUrlMap = {};

  // Function to extract caption/URL mappings from a given HTML file
  function parseMetadataFile(filePath, desc) {
    if (!fs.existsSync(filePath)) {
      console.log(`Skipped ${desc} (file not found)`);
      return;
    }
    console.log(`Reading ${desc} to extract specific URLs...`);
    const html = fs.readFileSync(filePath, 'utf8');
    const entries = html.split(/<table style="table-layout: fixed;">/g);
    
    let count = 0;
    for (const entry of entries) {
      const urlMatch = entry.match(/href="(https:\/\/www\.instagram\.com\/p\/[^"]+)"/);
      const captionMatch = entry.match(/<td class="_a6_q">Caption<\/td><td class="_2piu _a6_r">([\s\S]*?)<\/td>/);

      if (urlMatch && captionMatch) {
        const url = urlMatch[1];
        let caption = captionMatch[1].trim();
        caption = caption
          .replace(/&#064;/g, '@')
          .replace(/&#039;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/<br\s*\/?>/gi, '\n');
        
        const key = getCaptionKey(caption);
        if (key && !captionToUrlMap[key]) {
          captionToUrlMap[key] = url;
          count++;
        }
      }
    }
    console.log(`Added ${count} specific post URLs from ${desc}.`);
  }

  // Parse both viewed and liked posts
  parseMetadataFile(viewedHtmlPath, 'viewed posts');
  parseMetadataFile(likedHtmlPath, 'liked posts');

  console.log(`Total unique captions mapped to specific Instagram URLs: ${Object.keys(captionToUrlMap).length}`);

  // 2. Parse original posts HTML
  console.log('Reading Instagram posts...');
  const postsHtml = fs.readFileSync(postsHtmlPath, 'utf8');
  const blocks = postsHtml.split('<div class="pam _3-95 _2ph- _a6-g uiBoxWhite noborder">');
  const postBlocks = blocks.slice(1);

  const highlights = [];
  let mappedCount = 0;

  for (let i = 0; i < postBlocks.length; i++) {
    const block = postBlocks[i];

    // Extract caption
    const h2Match = block.match(/<h2 class="_3-95 _2pim _a6-h _a6-i">([\s\S]*?)<\/h2>/);
    let caption = h2Match ? h2Match[1].trim() : '';
    caption = caption
      .replace(/&#064;/g, '@')
      .replace(/&#039;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/<br\s*\/?>/gi, '\n');

    // Extract first image src
    const imgMatch = block.match(/<img[^>]+src="([^"]+)"/);
    let imageUrl = '';
    if (imgMatch) {
      const src = imgMatch[1];
      imageUrl = '/' + src.replace('media/posts/', 'images/instagram/');
    }

    if (!imageUrl) continue;

    // Lookup specific URL
    let linkUrl = 'https://www.instagram.com/the_midnight_quilll/';
    const key = getCaptionKey(caption);
    if (key && captionToUrlMap[key]) {
      linkUrl = captionToUrlMap[key];
      mappedCount++;
    }

    highlights.push({
      imageUrl,
      caption: caption || 'Instagram post by @the_midnight_quilll',
      linkUrl,
      order: highlights.length + 1
    });
  }

  console.log(`Successfully parsed ${highlights.length} valid posts. Mapped ${mappedCount} to specific URLs.`);

  console.log('Clearing old Instagram highlights from database...');
  await prisma.instagramHighlight.deleteMany({});

  console.log('Inserting real Instagram posts with specific URLs...');
  for (const hl of highlights) {
    await prisma.instagramHighlight.create({
      data: hl
    });
  }

  console.log('Instagram specific post link seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
