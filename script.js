// Quick start for Veggies & Co Recipe Finder 🤷‍♂️
// ugh, this file’s getting kinda thick—sorry future me

// API Key here—swap for env var if you’re fancy
const API_KEY = 'efcc557c1f6e4663b53db75c89df0f88'

document.addEventListener('DOMContentLoaded', () => {
  // UI element refs
  var spinner       = document.getElementById('loading-spinner')              // spinner
  let formTags      = document.getElementById('ingredient-form')              // form input tags
  const tagContainer = document.getElementById('ingredient-list')             // tag list container
  const searchForm   = document.getElementById('search-form')                 // search form
  const resultsDiv   = document.getElementById('results')                     // results grid
  const favGrid      = document.getElementById('favorites-grid')              // favorites grid
  const glutenFree   = document.getElementById('filter-gluten-free')          // gluten-free
  const highProtein  = document.getElementById('filter-high-protein')         // high-protein
  const quickMeals   = document.getElementById('filter-quick-meals')          // quick-meals

  // state
  let ingreds = []
  let favs    = JSON.parse(localStorage.getItem('favorites') || '[]')

  renderTags()
  renderFavs()

  // add tag
  formTags.addEventListener('submit', e => {
    e.preventDefault()
    const inp = formTags.querySelector('input')
    const val = inp.value.trim()
    if (val && !ingreds.includes(val)) {
      ingreds.push(val)
      console.log('Added tag', val)
    }
    inp.value = ''
    renderTags()
  })

  // search recipes
  searchForm.addEventListener('submit', async e => {
    e.preventDefault()
    if (!ingreds.length) return alert('Add at least one ingredient!')
    await fetchAndShow(ingreds.join(','))
  })

  // render ingredient tags with aria labels
  function renderTags() {
    tagContainer.innerHTML = ''
    ingreds.forEach((txt, idx) => {
      const span = document.createElement('span')
      span.className = 'ingredient-tag'
      span.textContent = txt + ' ×'
      // aria-label: tells screen reader user this removes the ingredient tag
      span.setAttribute('aria-label', `Remove ingredient ${txt}`)  // screen reader
      span.onclick = () => { ingreds.splice(idx,1); renderTags() }
      tagContainer.appendChild(span)
    })
  }

  // fetch & display
  async function fetchAndShow(q) {
    spinner.classList.remove('hidden')
    const params = new URLSearchParams({ includeIngredients: q, diet: 'vegan', number: 10, apiKey: API_KEY })
    if (glutenFree.checked) params.append('intolerances','gluten')
    if (highProtein.checked) params.append('minProtein',10)
    if (quickMeals.checked) params.append('maxReadyTime',30)
    const url = `https://api.spoonacular.com/recipes/complexSearch?${params}`
    console.log('API:', url)
    try {
      const resp = await fetch(url)
      if (!resp.ok) throw new Error('Status ' + resp.status)
      const data = await resp.json()
      showResults(data.results || [])
    } catch (err) {
      console.error('Fetch error', err)
      resultsDiv.innerHTML = '<p>Could not load recipes.</p>'
    } finally { spinner.classList.add('hidden') }
  }

    // display results
  function showResults(arr) {
    resultsDiv.innerHTML = ''
    // if no recipes returned, show friendly message
    if (!arr.length) {
      resultsDiv.innerHTML = "<p class='no-results'>No recipes match your ingredients. Try different ones!</p>"
      return
    }
    arr.forEach(item => {
      if (!item.id || !item.title) return
      const card = document.createElement('div')
      card.className = 'recipe-card'
      // each card shows title, image, and placeholder for summary
      card.innerHTML = `
        <img src='${item.image}' alt='${item.title} image'>
        <div class='recipe-card-content'>
          <h3>${item.title}</h3>
          <p class='recipe-snippet'>Loading summary...</p>
        </div>
        <div class='recipe-card-footer'>
          <button data-action='fav' data-id='${item.id}' aria-label='${favs.some(f=>f.id===item.id)?'Remove':'Add'} favorite'>${favs.some(f=>f.id===item.id)?'★':'☆'}</button>
          <button data-action='view' data-id='${item.id}' aria-label='View details for ${item.title}'>View recipe</button>
        </div>`
      resultsDiv.appendChild(card)
      // fetch and insert summary text
      fetch(`https://api.spoonacular.com/recipes/${item.id}/summary?apiKey=${API_KEY}`)
        .then(res => res.ok ? res.json() : Promise.reject(res.status))
        .then(data => {
          const strip = document.createElement('div')
          strip.innerHTML = data.summary || ''
          const text = strip.textContent || strip.innerText || ''
          const snippetEl = card.querySelector('.recipe-snippet')
          snippetEl.textContent = text.length > 120 ? text.slice(0,120) + '...' : text
        })
        .catch(err => {
          console.warn('Summary failed', err)
          const snippetEl = card.querySelector('.recipe-snippet')
          snippetEl.textContent = 'Summary not available.'
        })
    })
  }

  // delegate click events in results
  resultsDiv.addEventListener('click', e => {
    const btn = e.target.closest('button')
    if (!btn) return
    const act = btn.getAttribute('data-action')
    const id  = +btn.getAttribute('data-id')
    if (act === 'fav') {
      const exists = favs.find(f => f.id === id)
      if (exists) favs = favs.filter(f => f.id !== id)
      else favs.push({ id })
      localStorage.setItem('favorites', JSON.stringify(favs))
      btn.textContent = exists ? '☆' : '★'
      renderFavs()
    } else if (act === 'view') {
      showModal(id)
    }
  })

  // render favorites with aria-labels
  async function renderFavs() {
    favGrid.innerHTML = ''
    if (!favs.length) return favGrid.innerHTML = '<p>No favorites yet.</p>'
    for (let f of favs) {
      const card = document.createElement('div')
      card.className = 'recipe-card'
      card.innerHTML = `<p>Loading…</p>`
      favGrid.appendChild(card)
      try {
        const r = await fetch(`https://api.spoonacular.com/recipes/${f.id}/information?apiKey=${API_KEY}`)
        const d = await r.json()
        card.innerHTML = `
          <img src='${d.image}' alt='${d.title} image'>
          <h3>${d.title}</h3>
          <div class='recipe-card-footer'>
            <button data-action='view' data-id='${d.id}' aria-label='View details for ${d.title}'>View recipe</button>
          </div>`
      } catch(e) {
        console.error('Fav load error', e)
        card.innerHTML = '<p>Failed loading.</p>'
      }
    }
    // delegate favorites clicks
    favGrid.onclick = e => {
      const btn = e.target.closest('button[data-action="view"]')
      if (!btn) return
      showModal(+btn.dataset.id)
    }
  }

  // modal popup
  async function showModal(id) {
    const mod = document.getElementById('recipe-modal')
    const mb  = document.getElementById('modal-body')
    const cb  = document.getElementById('modal-close')
    mb.innerHTML = '<p>Loading details…</p>'
    mod.style.display = 'block'
    cb.onclick = () => mod.style.display = 'none'
    window.onclick = ev => { if(ev.target===mod) mod.style.display='none' }
    try {
      const res = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`)
      const d2  = await res.json()
      const ingr = (d2.extendedIngredients||[]).map(i=>`<li>${i.original}</li>`).join('')
      const steps= d2.analyzedInstructions?.[0]?.steps.map(s=>`<li>${s.step}</li>`).join('')||'<li>No steps</li>'
      mb.innerHTML = `
        <h2>${d2.title}</h2>
        <img src='${d2.image}' alt='${d2.title} image' style='width:100%;'>
        <h3>Ingredients</h3><ul>${ingr}</ul>
        <h3>Instructions</h3><ol>${steps}</ol>`
    } catch(ex) {
      console.error('Modal err', ex)
      mb.innerHTML = '<p>Could not load details.</p>'
    }
  }
})
