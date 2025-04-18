// Quick start for Vegan Recipe Finder
// TODO: refactor this spaghetti before it grows too big

const API_KEY = 'efcc557c1f6e4663b53db75c89df0f88'

window.addEventListener('DOMContentLoaded', () => {
  var spinner = document.getElementById('loading-spinner')
  let formTags = document.getElementById('ingredient-form')
  const tagContainer = document.getElementById('ingredient-list')
  const searchForm = document.getElementById('search-form')
  const resultsDiv = document.getElementById('results')
  const favGrid = document.getElementById('favorites-grid')
  const glutenFree = document.getElementById('filter-gluten-free')
  const highProtein = document.getElementById('filter-high-protein')
  const quickMeals = document.getElementById('filter-quick-meals')

  // current ingredients & favorites
  let ingreds = []
  let favs = JSON.parse(localStorage.getItem('favorites') || '[]')

  renderTags()
  renderFavs()

  // handle new tag submit
  formTags.addEventListener('submit', e => {
    e.preventDefault()
    const inp = formTags.querySelector('input')
    const val = inp.value.trim()
    if (val && ingreds.indexOf(val) < 0) {
      ingreds.push(val)
      console.log('Added tag', val)
    }
    inp.value = ''
    renderTags()
  })

  // search handler
  searchForm.addEventListener('submit', async e => {
    e.preventDefault()
    if (!ingreds.length) return alert('No ingredients? Add some!')
    await fetchAndShow(ingreds.join(','))
  })

  // render tag list
  function renderTags() {
    tagContainer.innerHTML = ''
    ingreds.forEach((txt, idx) => {
      const span = document.createElement('span')
      span.className = 'ingredient-tag'
      span.textContent = txt + ' ×'
      span.onclick = () => {
        ingreds.splice(idx, 1)
        renderTags()
      }
      tagContainer.appendChild(span)
    })
  }

  // fetch recipes
  async function fetchAndShow(q) {
    spinner.classList.remove('hidden')
    const params = new URLSearchParams({ includeIngredients: q, diet: 'vegan', number: 10, apiKey: API_KEY })
    if (glutenFree.checked) params.append('intolerances', 'gluten')
    if (highProtein.checked) params.append('minProtein', 10)
    if (quickMeals.checked) params.append('maxReadyTime', 30)
    const url = `https://api.spoonacular.com/recipes/complexSearch?${params}`
    console.log('Calling API:', url)
    try {
      const resp = await fetch(url)
      if (!resp.ok) throw new Error('Status ' + resp.status)
      const data = await resp.json()
      showResults(data.results || [])
    } catch (err) {
      console.error('API fail:', err)
      resultsDiv.innerHTML = '<p>Oops, could not load recipes.</p>'
    } finally {
      spinner.classList.add('hidden')
    }
  }

  // display results
  function showResults(arr) {
    resultsDiv.innerHTML = ''
    if (!arr.length) {
      resultsDiv.innerHTML = '<p>No matches found.</p>'
      return
    }
    arr.forEach(item => {
      if (!item.id || !item.title) return
      const card = document.createElement('div')
      card.className = 'recipe-card'
      card.innerHTML = `
        <img src='${item.image}' alt='${item.title}'>
        <div class='recipe-card-content'><h3>${item.title}</h3></div>
        <div class='recipe-card-footer'>
          <button data-action='fav' data-id='${item.id}'>${favs.some(f=>f.id===item.id)?'★':'☆'}</button>
          <button data-action='view' data-id='${item.id}'>View recipe</button>
        </div>`
      resultsDiv.appendChild(card)
    })
  }

  // delegate clicks on results
  resultsDiv.addEventListener('click', e => {
    const btn = e.target.closest('button')
    if (!btn) return
    const act = btn.getAttribute('data-action')
    const id = +btn.getAttribute('data-id')
    if (act === 'fav') {
      const exists = favs.find(f=>f.id===id)
      if (exists) favs = favs.filter(f=>f.id!==id)
      else favs.push({id})
      localStorage.setItem('favorites', JSON.stringify(favs))
      btn.textContent = exists ? '☆' : '★'
      renderFavs()
    } else if (act === 'view') showModal(id)
  })

  // render favorites
  async function renderFavs() {
    favGrid.innerHTML = ''
    if (!favs.length) {
      favGrid.innerHTML = '<p>No favorites yet.</p>'
      return
    }
    for (let f of favs) {
      const card = document.createElement('div')
      card.className = 'recipe-card'
      card.innerHTML = `<p>Loading...</p>`
      favGrid.appendChild(card)
      try {
        const r = await fetch(`https://api.spoonacular.com/recipes/${f.id}/information?apiKey=${API_KEY}`)
        const d = await r.json()
        card.innerHTML = `
          <img src='${d.image}' alt='${d.title}'>
          <h3>${d.title}</h3>
          <div class='recipe-card-footer'>
            <button data-action='view' data-id='${d.id}'>View recipe</button>
          </div>`
      } catch (_) {
        card.innerHTML = '<p>Failed to load.</p>'
      }
    }
    // delegate for favGrid
    favGrid.onclick = e => {
      const btn = e.target.closest('button[data-action="view"]')
      if (!btn) return
      showModal(+btn.dataset.id)
    }
  }

  // show modal
  async function showModal(id) {
    const mod = document.getElementById('recipe-modal')
    const mb = document.getElementById('modal-body')
    const cb = document.getElementById('modal-close')
    mb.innerHTML = '<p>Loading details…</p>'
    mod.style.display = 'block'
    cb.onclick = () => (mod.style.display = 'none')
    window.onclick = ev => { if (ev.target === mod) mod.style.display = 'none' }
    try {
      const res = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`)
      const d2 = await res.json()
      const listIng = (d2.extendedIngredients||[]).map(i=>`<li>${i.original}</li>`).join('')
      const steps = d2.analyzedInstructions?.[0]?.steps.map(s=>`<li>${s.step}</li>`).join('')||'<li>No steps</li>'
      mb.innerHTML = `
        <h2>${d2.title}</h2>
        <img src='${d2.image}' alt='${d2.title}' style='width:100%;'>
        <h3>Ingredients</h3><ul>${listIng}</ul>
        <h3>Instructions</h3><ol>${steps}</ol>`
    } catch (ex) {
      mb.innerHTML = '<p>Could not load details.</p>'
    }
  }
})
