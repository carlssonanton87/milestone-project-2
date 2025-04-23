

// Ugh, this file’s getting kinda thick—sorry future me!

// API Key here—swap for env var if you’re fancy
const API_KEY = 'efcc557c1f6e4663b53db75c89df0f88';

document.addEventListener('DOMContentLoaded', () => {
  // UI element refs
  var spinner = document.getElementById('loading-spinner');              // loading spinner
  let formTags = document.getElementById('ingredient-form');             // ingredient form
  const tagContainer = document.getElementById('ingredient-list');       // tag list container
  const searchBtn = document.getElementById('search-button');            // search button
  const resultsDiv = document.getElementById('results');                 // results grid
  const favGrid = document.getElementById('favorites-grid');             // favorites grid
  const glutenFree = document.getElementById('filter-gluten-free');      // gluten-free checkbox
  const highProtein = document.getElementById('filter-high-protein');    // high-protein checkbox
  const quickMeals = document.getElementById('filter-quick-meals');      // quick meals checkbox

  // Hamburger menu toggle
  document.getElementById('nav-toggle').addEventListener('click', () => {
    document.querySelector('nav').classList.toggle('open');
  });

  // State
  let ingreds = [];
  let favs = JSON.parse(localStorage.getItem('favorites') || '[]');

  renderTags();
  renderFavs();

  // Add ingredient tag on form submit
  formTags.addEventListener('submit', (e) => {
    e.preventDefault();
    const inp = formTags.querySelector('input');
    const val = inp.value.trim();
    if (val && ingreds.indexOf(val) === -1) {
      ingreds.push(val);
      console.log('Added tag:', val);
    }
    inp.value = '';
    renderTags();
  });

  // Search recipes on button click
  searchBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (ingreds.length === 0) {
      alert('Add at least one ingredient!');
      return;
    }
    console.log('Searching for:', ingreds.join(','));
    await fetchAndShow(ingreds.join(','));
  });

  // Render the ingredient tags
  function renderTags() {
    tagContainer.textContent = '';
    ingreds.forEach((txt, idx) => {
      const span = document.createElement('span');
      span.className = 'ingredient-tag';
      span.textContent = `${txt} ×`;
      span.setAttribute('aria-label', `Remove ingredient ${txt}`); // for screen readers
      span.addEventListener('click', () => {
        ingreds.splice(idx, 1);
        renderTags();
      });
      tagContainer.appendChild(span);
    });
  }

  // Fetch recipes and display
  async function fetchAndShow(q) {
    spinner.classList.remove('hidden');
    const params = new URLSearchParams({ includeIngredients: q, diet: 'vegan', number: 10, apiKey: API_KEY });
    if (glutenFree.checked) {
      params.append('intolerances', 'gluten');
    }
    if (highProtein.checked) {
      params.append('minProtein', 10);
    }
    if (quickMeals.checked) {
      params.append('maxReadyTime', 30);
    }
    const url = `https://api.spoonacular.com/recipes/complexSearch?${params}`;
    console.log('API URL:', url);
    try {
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error('Status ' + resp.status);
      }
      const data = await resp.json();
      showResults(data.results || []);
    } catch (err) {
      console.error('Fetch error:', err);
      resultsDiv.innerHTML = '<p>Could not load recipes.</p>';
    } finally {
      spinner.classList.add('hidden');
    }
  }

  // Display results as cards
  function showResults(arr) {
    resultsDiv.innerHTML = '';
    if (arr.length === 0) {
      resultsDiv.innerHTML = "<p class='no-results'>No recipes match your ingredients. Try different ones!</p>";
      return;
    }
    arr.forEach((item) => {
      if (!item.id || !item.title) {
        return;
      }
      const card = document.createElement('div');
      card.className = 'recipe-card';
      card.innerHTML = `
        <img src='${item.image}' alt='${item.title} image'>
        <div class='recipe-card-content'>
          <h3>${item.title}</h3>
          <p class='recipe-snippet'>Loading summary...</p>
        </div>
        <div class='recipe-card-footer'>
          <button data-action='fav' data-id='${item.id}' aria-label='${favs.some(f=>f.id===item.id)?'Remove':'Add'} favorite'>${favs.some(f=>f.id===item.id)?'★':'☆'}</button>
          <button data-action='view' data-id='${item.id}' aria-label='View details for ${item.title}'>View recipe</button>
        </div>`;
      resultsDiv.appendChild(card);

      // Fetch and insert summary
      fetch(`https://api.spoonacular.com/recipes/${item.id}/summary?apiKey=${API_KEY}`)
        .then(res => {
          if (!res.ok) {
            return Promise.reject(res.status);
          }
          return res.json();
        })
        .then((data) => {
          const tmp = document.createElement('div');
          tmp.innerHTML = data.summary || '';
          const text = tmp.textContent || tmp.innerText || '';
          const snippetEl = card.querySelector('.recipe-snippet');
          snippetEl.textContent = text.length > 120 ? text.slice(0, 120) + '...' : text;
        })
        .catch((err) => {
          console.warn('Summary failed:', err);
          card.querySelector('.recipe-snippet').textContent = 'Summary not available.';
        });
    });
  }

  // Delegate button clicks in results
  resultsDiv.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) {
      return;
    }
    const action = btn.getAttribute('data-action');
    const id = Number(btn.getAttribute('data-id'));
    if (action === 'fav') {
      const exists = favs.find(f => f.id === id);
      if (exists) {
        favs = favs.filter(f => f.id !== id);
      } else {
        favs.push({ id });
      }
      localStorage.setItem('favorites', JSON.stringify(favs));
      btn.textContent = exists ? '☆' : '★';
      renderFavs();
    } else if (action === 'view') {
      showModal(id);
    }
  });

  // Render favorites
  async function renderFavs() {
    favGrid.innerHTML = '';
    if (favs.length === 0) {
      favGrid.innerHTML = '<p>No favorites yet.</p>';
      return;
    }
    for (let f of favs) {
      const card = document.createElement('div');
      card.className = 'recipe-card';
      card.innerHTML = '<p>Loading…</p>';
      favGrid.appendChild(card);
      try {
        const resp = await fetch(`https://api.spoonacular.com/recipes/${f.id}/information?apiKey=${API_KEY}`);
        if (!resp.ok) {
          throw new Error('Status ' + resp.status);
        }
        const data = await resp.json();
        card.innerHTML = `
          <img src='${data.image}' alt='${data.title} image'>
          <h3>${data.title}</h3>
          <div class='recipe-card-footer'>
            <button data-action='view' data-id='${data.id}' aria-label='View details for ${data.title}'>View recipe</button>
          </div>`;
      } catch (err) {
        console.error('Fav load error:', err);
        card.innerHTML = '<p>Failed loading.</p>';
      }
    }

    // Delegate clicks in favorites
    favGrid.addEventListener('click', (ev) => {
      const btn2 = ev.target.closest('button[data-action="view"]');
      if (!btn2) {
        return;
      }
      showModal(Number(btn2.dataset.id));
    });
  }

  // Modal logic
  async function showModal(id) {
    const mod = document.getElementById('recipe-modal');
    const mb = document.getElementById('modal-body');
    const cb = document.getElementById('modal-close');
    mb.innerHTML = '<p>Loading details…</p>';
    mod.style.display = 'block';
    cb.onclick = () => { mod.style.display = 'none'; };
    window.addEventListener('click', (ev) => {
      if (ev.target === mod) {
        mod.style.display = 'none';
      }
    });
    try {
      const resp2 = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`);
      if (!resp2.ok) {
        throw new Error('Status ' + resp2.status);
      }
      const d2 = await resp2.json();
      const ingrList = (d2.extendedIngredients || []).map(i => `<li>${i.original}</li>`).join('');
      const stepsList = (d2.analyzedInstructions && d2.analyzedInstructions.length ? d2.analyzedInstructions[0].steps : []).map(s => `<li>${s.step}</li>`).join('') || '<li>No steps</li>';
      mb.innerHTML = `
        <h2>${d2.title}</h2>
        <img src='${d2.image}' alt='${d2.title} image' style='width:100%;'>
        <h3>Ingredients</h3><ul>${ingrList}</ul>
        <h3>Instructions</h3><ol>${stepsList}</ol>`;
    } catch (err2) {
      console.error('Modal error:', err2);
      mb.innerHTML = '<p>Could not load details.</p>';
    }
  }
});
