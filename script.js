// ⚠️ Replace with your actual GNews API key from gnews.io
const API_KEY = c91bb0be2a32bcca086642f24e285e70;
const BASE_URL = 'https://gnews.io/api/v4';

let currentCategory = 'general';

async function fetchNews(category = 'general', btn = null) {
  currentCategory = category;

  if (btn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  document.getElementById('searchInput').value = '';
  setLoading();

  try {
    const res = await fetch(
      `${BASE_URL}/top-headlines?category=${category}&lang=en&max=12&apikey=${API_KEY}`
    );
    const data = await res.json();

    if (data.errors) throw new Error(data.errors[0]);
    renderNews(data.articles, `Top headlines — ${category}`);
  } catch (e) {
    setError(e.message);
  }
}

async function searchNews() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return;

  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  setLoading();

  try {
    const res = await fetch(
      `${BASE_URL}/search?q=${encodeURIComponent(query)}&lang=en&max=12&apikey=${API_KEY}`
    );
    const data = await res.json();

    if (data.errors) throw new Error(data.errors[0]);
    renderNews(data.articles, `Results for "${query}"`);
  } catch (e) {
    setError(e.message);
  }
}

function renderNews(articles, label) {
  const grid = document.getElementById('newsGrid');
  const stats = document.getElementById('newsStats');

  if (!articles || articles.length === 0) {
    grid.innerHTML = `<div class="error-state">No articles found. Try a different search!</div>`;
    stats.textContent = '';
    return;
  }

  stats.textContent = `${articles.length} articles · ${label} · ${new Date().toLocaleTimeString()}`;

  grid.innerHTML = articles.map(article => {
    const date = new Date(article.publishedAt).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    const imgHtml = article.image
      ? `<img class="news-img" src="${article.image}" alt="${article.title}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
         <div class="news-img-placeholder" style="display:none">📰</div>`
      : `<div class="news-img-placeholder">📰</div>`;

    return `
      <div class="news-card" onclick="window.open('${article.url}', '_blank')">
        ${imgHtml}
        <div class="news-body">
          <div class="news-meta">
            <span class="news-source">${article.source?.name || 'Unknown'}</span>
            <span class="news-date">${date}</span>
          </div>
          <div class="news-title">${article.title}</div>
          <div class="news-desc">${article.description || 'Click to read the full article.'}</div>
          <a class="news-link" href="${article.url}" target="_blank"
             onclick="event.stopPropagation()">Read full article →</a>
        </div>
      </div>`;
  }).join('');
}

function setLoading() {
  document.getElementById('newsGrid').innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Fetching latest headlines...</p>
    </div>`;
  document.getElementById('newsStats').textContent = '';
}

function setError(msg) {
  document.getElementById('newsGrid').innerHTML = `
    <div class="error-state">
      <p>❌ ${msg}</p>
      <p style="margin-top:8px;font-size:0.82rem;color:#606070;">
        Make sure your API key is set in script.js
      </p>
    </div>`;
}

document.getElementById('searchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') searchNews();
});

window.onload = () => fetchNews('general');