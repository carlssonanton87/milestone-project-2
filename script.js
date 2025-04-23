// ugh, this file’s getting kinda thick—sorry future me

// API Key here—swap for env var if you’re fancy
const API_KEY = 'efcc557c1f6e4663b53db75c89df0f88';

document.addEventListener('DOMContentLoaded', () => {
  // UI references
  const spinner        = document.getElementById('loading-spinner');
  const ingredientInput= document.getElementById('ingredient-input');
  const addBtn         = document.getElementById('ingredient-add-btn');
  const tagContainer   = document.getElementById('ingredient-list');
  const searchBtn      = document.getElementById('search-button');
  const glutenFree     = document.getElementById('filter-gluten-free');
  const highProtein    = document.getElementById('filter-high-protein');
  const quickMeals     = document.getElementById('filter-quick-meals');
  const resultsDiv     = document.getElementById('results');
  const favGrid        = document.getElementById('favorites-grid');

    // allow Enter key in the ingredient input to "click" the + button
    ingredientInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();   // prevent any stray form‐submit
          addBtn.click();       // trigger our existing click handler
        }
      });

      
  // state
  let ingredients = [];
  let favorites   = JSON.parse(localStorage.getItem('favorites') || '[]');

  // initial render
  renderTags();
  renderFavs();



  // 1) Add ingredient tag when "+" clicked
  addBtn.addEventListener('click', () => {
    const val = ingredientInput.value.trim();
    if (!val) return;             // ignore empty
    if (!ingredients.includes(val)) {
      ingredients.push(val);
      console.log('Tag added:', val);
    }
    ingredientInput.value = '';   // clear input
    renderTags();
  });

  // 2) Search recipes when "Search Recipes" clicked
  searchBtn.addEventListener('click', async () => {
    if (ingredients.length === 0) {
      alert('Please add at least one ingredient first.');
      return;
    }
    await fetchAndShow(ingredients.join(','));
  });

  // Renders the ingredient tags beneath the input
  function renderTags() {
    tagContainer.innerHTML = '';
    ingredients.forEach((txt, i) => {
      const span = document.createElement('span');
      span.className = 'ingredient-tag';
      span.textContent = txt + ' ×';
      span.setAttribute('aria-label', `Remove ingredient ${txt}`);
      span.onclick = () => {
        ingredients.splice(i, 1);
        renderTags();
      };
      tagContainer.appendChild(span);
    });
  }

  // Fetch + display recipes
  async function fetchAndShow(q) {
    spinner.classList.remove('hidden');
    const params = new URLSearchParams({
      includeIngredients: q,
      diet: 'vegan',
      number: 10,
      apiKey: API_KEY
    });
    if (glutenFree.checked)  params.append('intolerances', 'gluten');
    if (highProtein.checked) params.append('minProtein', 10);
    if (quickMeals.checked)  params.append('maxReadyTime', 30);

    const url = `https://api.spoonacular.com/recipes/complexSearch?${params}`;
    console.log('Fetching:', url);

    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(resp.status);
      const data = await resp.json();
      showResults(data.results || []);
    } catch (err) {
      console.error('Fetch error:', err);
      resultsDiv.innerHTML = '<p>Could not load recipes. Try again later.</p>';
    } finally {
      spinner.classList.add('hidden');
    }
  }

  // Display recipe cards
  function showResults(arr) {
    resultsDiv.innerHTML = '';
    if (!arr.length) {
      resultsDiv.innerHTML = "<p class='no-results'>No recipes match your ingredients. Try different ones!</p>";
      return;
    }
    arr.forEach(item => {
      if (!item.id || !item.title) return;
      const card = document.createElement('div');
      card.className = 'recipe-card';
      card.innerHTML = `
        <img src="${item.image}" alt="${item.title} image">
        <div class="recipe-card-content">
          <h3>${item.title}</h3>
          <p class="recipe-snippet">Loading summary...</p>
        </div>
        <div class="recipe-card-footer">
          <button data-action="fav" data-id="${item.id}"
                  aria-label="${favorites.some(f=>f.id===item.id)?'Remove':'Add'} favorite">
            ${favorites.some(f=>f.id===item.id)?'★':'☆'}
          </button>
          <button data-action="view" data-id="${item.id}"
                  aria-label="View details for ${item.title}">
            View recipe
          </button>
        </div>`;
      resultsDiv.appendChild(card);

      // short summary fetch
      fetch(`https://api.spoonacular.com/recipes/${item.id}/summary?apiKey=${API_KEY}`)
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(data => {
          const tmp = document.createElement('div');
          tmp.innerHTML = data.summary || '';
          const txt = (tmp.textContent||tmp.innerText||'');
          const snippet = txt.length>120 ? txt.slice(0,120)+'...' : txt;
          card.querySelector('.recipe-snippet').textContent = snippet;
        })
        .catch(e => {
          console.warn('Summary error:', e);
          card.querySelector('.recipe-snippet').textContent = 'Summary not available.';
        });
    });
  }

  // Delegate click events (favorites / view)
  resultsDiv.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const act = btn.dataset.action;
    const id  = +btn.dataset.id;
    if (act === 'fav') {
      const exists = favorites.find(f=>f.id===id);
      if (exists) favorites = favorites.filter(f=>f.id!==id);
      else        favorites.push({id});
      localStorage.setItem('favorites', JSON.stringify(favorites));
      btn.textContent = exists ? '☆' : '★';
      renderFavs();
    }
    else if (act === 'view') {
      showModal(id);
    }
  });

  // Render favorites grid
  async function renderFavs() {
    favGrid.innerHTML = '';
    if (!favorites.length) {
      favGrid.innerHTML = '<p>No favorites yet.</p>';
      return;
    }
    for (let f of favorites) {
      const card = document.createElement('div');
      card.className = 'recipe-card';
      card.innerHTML = '<p>Loading…</p>';
      favGrid.appendChild(card);
      try {
        const res = await fetch(
          `https://api.spoonacular.com/recipes/${f.id}/information?apiKey=${API_KEY}`
        );
        const d = await res.json();
        card.innerHTML = `
          <img src="${d.image}" alt="${d.title} image">
          <h3>${d.title}</h3>
          <div class="recipe-card-footer">
            <button data-action="view" data-id="${d.id}"
                    aria-label="View details for ${d.title}">
              View recipe
            </button>
          </div>`;
      } catch (_) {
        card.innerHTML = '<p>Failed loading.</p>';
      }
    }
    // favorites click delegate
    favGrid.onclick = e => {
      const b = e.target.closest('button[data-action="view"]');
      if (!b) return;
      showModal(+b.dataset.id);
    };
  }

  // Show detail modal
  async function showModal(id) {
    const mod = document.getElementById('recipe-modal');
    const mb  = document.getElementById('modal-body');
    const cb  = document.getElementById('modal-close');
    mb.innerHTML = '<p>Loading details…</p>';
    mod.style.display = 'block';
    cb.onclick    = () => mod.style.display = 'none';
    window.onclick = ev => { if (ev.target===mod) mod.style.display='none'; };

    try {
      const r2 = await fetch(
        `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`
      );
      const d2 = await r2.json();
      const ingr = (d2.extendedIngredients||[])
        .map(i=>`<li>${i.original}</li>`).join('');
      const steps= d2.analyzedInstructions?.[0]?.steps
        .map(s=>`<li>${s.step}</li>`).join('') || '<li>No steps</li>';
      mb.innerHTML = `
        <h2>${d2.title}</h2>
        <img src="${d2.image}" alt="${d2.title} image" style="width:100%;border-radius:8px;">
        <h3>Ingredients</h3><ul>${ingr}</ul>
        <h3>Instructions</h3><ol>${steps}</ol>`;
    } catch (ex) {
      console.error('Modal error:', ex);
      mb.innerHTML = '<p>Could not load details.</p>';
    }
  }

});
