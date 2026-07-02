const fs = require('fs');

const commentsHtmlPath = 'C:/Users/KIIT0001/Downloads/instagram-the_midnight_quilll-2026-05-10-g7xDVUGy/your_instagram_activity/comments/hype.html';
const commentsHtml = fs.readFileSync(commentsHtmlPath, 'utf8');
const commentBlocks = commentsHtml.split('<div class="pam _3-95 _2ph- _a6-g uiBoxWhite noborder">');

console.log('Total blocks found:', commentBlocks.length);

for (let i = 1; i < commentBlocks.length; i++) {
  const block = commentBlocks[i];
  const urlMatch = block.match(/href="(https:\/\/www\.instagram\.com\/p\/[^"]+)"/);
  const dateMatch = block.match(/_a6_r">([\s\S]*?)<\/td>/);
  
  console.log(`Block ${i}:`);
  console.log(`  urlMatch:`, urlMatch ? urlMatch[1] : 'null');
  console.log(`  dateMatch:`, dateMatch ? dateMatch[1] : 'null');
}
