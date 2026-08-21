const newsFallback = [
  {category: 'LOCAL', className: 'local', title: 'News will appear after the first automatic refresh', url: 'https://news.google.com/'},
  {category: 'AI', className: 'ai', title: 'Creative AI news is updating', url: 'https://news.google.com/'},
  {category: 'ANIMATION', className: 'anim', title: 'Animation industry news is updating', url: 'https://news.google.com/'},
  {category: 'GADGET', className: 'tech', title: 'Gadget news is updating', url: 'https://news.google.com/'},
  {category: 'CANADA', className: 'ca', title: 'Canadian news is updating', url: 'https://news.google.com/'}
];

function renderNews(stories, updatedAt) {
  const section = document.getElementById('news');
  if (!section) return;
  const badge = section.querySelector('.badge');
  const list = section.querySelector('.news');
  list.replaceChildren(...stories.slice(0, 5).map(story => {
    const li = document.createElement('li');
    const tag = document.createElement('span');
    tag.className = `tag ${story.className || ''}`;
    tag.textContent = story.category;
    const link = document.createElement('a');
    link.href = story.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = story.title;
    link.title = `${story.title}${story.source ? ` — ${story.source}` : ''}`;
    const arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.textContent = '↗';
    li.append(tag, link, arrow);
    return li;
  }));
  badge.textContent = updatedAt
    ? `LIVE · ${new Date(updatedAt).toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'})}`
    : 'WAITING FOR FEED';
}

document.title = 'Daily Command Center — V10';
document.querySelector('.side-note').innerHTML = 'V10 · live news + Gmail<br>Refreshes automatically.';
document.querySelector('.footer').textContent = 'Version 10 · live news · Calendar · Gmail metadata · Home Screen web app';

fetch(`./news.json?v=${Date.now()}`, {cache: 'no-store'})
  .then(response => {
    if (!response.ok) throw new Error('News unavailable');
    return response.json();
  })
  .then(data => renderNews(Array.isArray(data.stories) && data.stories.length ? data.stories : newsFallback, data.updatedAt))
  .catch(() => renderNews(newsFallback));
