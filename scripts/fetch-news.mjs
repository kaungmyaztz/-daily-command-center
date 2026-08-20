import { writeFile } from 'node:fs/promises';

const feeds = [
  ['LOCAL', 'local', 'Vancouver OR British Columbia breaking news'],
  ['AI', 'ai', 'creative AI tools artificial intelligence'],
  ['ANIMATION', 'anim', 'animation industry studio jobs'],
  ['GADGET', 'tech', 'gadgets smart glasses technology'],
  ['CANADA', 'ca', 'Canada national news']
];

const decode = value => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/<[^>]*>/g, '').trim();

const field = (xml, name) => decode(xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'))?.[1] || '');

async function latest([category, className, query]) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-CA&gl=CA&ceid=CA:en`;
  const response = await fetch(url, {headers: {'user-agent': 'DailyCommandCenter/8.0'}});
  if (!response.ok) throw new Error(`${category} feed returned ${response.status}`);
  const xml = await response.text();
  const item = xml.match(/<item>([\s\S]*?)<\/item>/i)?.[1];
  if (!item) throw new Error(`${category} feed returned no stories`);
  const rawTitle = field(item, 'title');
  const source = field(item, 'source');
  const title = source && rawTitle.endsWith(` - ${source}`) ? rawTitle.slice(0, -source.length - 3) : rawTitle;
  return {category, className, title, url: field(item, 'link'), source, publishedAt: field(item, 'pubDate')};
}

const results = await Promise.allSettled(feeds.map(latest));
const stories = results.filter(result => result.status === 'fulfilled').map(result => result.value);
if (stories.length < 3) throw new Error(`Only ${stories.length} news feeds succeeded`);
await writeFile('news.json', `${JSON.stringify({updatedAt: new Date().toISOString(), stories}, null, 2)}\n`);
console.log(`Updated ${stories.length} news stories.`);
