// Wait for the DOM to fully load before running any code
// This ensures all elements are available for selection and event binding

document.addEventListener("DOMContentLoaded", function () {
    // Spinner element to indicate loading state
    const loadingSpinner = document.getElementById('loading-spinner');

    // Get the forms
const ingredientForm = document.getElementById('ingredient-form');
const searchForm     = document.getElementById('search-form');

    // Ingredient input elements and storage
    const ingredientInput = document.getElementById("ingredient-input");
   
    const ingredientListContainer = document.getElementById("ingredient-list");
    let ingredients = []; // Array to hold user-selected ingredients

    // Filter checkboxes for dietary options
    const filterGlutenFree = document.getElementById("filter-gluten-free");
    const filterHighProtein = document.getElementById("filter-high-protein");
    const filterQuickMeals = document.getElementById("filter-quick-meals");

    // Search button and result/favorites containers
    
    const resultsContainer = document.getElementById("results");
    

    // Load favorites from localStorage or start with an empty array
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    updateFavorites();

    // Modal elements for detailed recipe view
    const modal = document.getElementById("recipe-modal");
    const modalBody = document.getElementById("modal-body");
    const modalClose = document.getElementById("modal-close");

    
// Handle ingredient submission (Enter key or '+' click)
ingredientForm.addEventListener('submit', function(event) {
    event.preventDefault();            // Don’t reload the page
    const newIngredient = ingredientInput.value.trim();
    if (newIngredient && !ingredients.includes(newIngredient)) {
      ingredients.push(newIngredient);
      ingredientInput.value = '';
      renderIngredientTags();
    }
  });

    /**
     * Render the list of ingredient tags.
     * Clicking a tag removes it from the list.
     */
    function renderIngredientTags() {
        ingredientListContainer.innerHTML = ""; // Clear existing tags
        ingredients.forEach((ing, index) => {
            const tag = document.createElement("span");
            tag.className = "ingredient-tag";
            tag.textContent = `${ing} ✕`;
            tag.setAttribute('aria-label', `Remove ingredient ${ing}`); // Screen reader label
            tag.addEventListener("click", () => {
                ingredients.splice(index, 1); // Remove from array
                renderIngredientTags();        // Re-render tags
            });
            ingredientListContainer.appendChild(tag);
        });
    }

    // Handle recipe search submission (Enter key in filter or button click)
searchForm.addEventListener('submit', function(event) {
    event.preventDefault();             // Prevent page refresh
    if (ingredients.length === 0) {
      console.log('No ingredients selected. Please add at least one ingredient.');
      return;
    }
    const query = ingredients.join(',');
    fetchRecipes(query);
  });

    /**
     * Fetch vegan recipes with optional filters using Spoonacular API.
     * @param {string} query - Comma-separated list of ingredients
     */
    function fetchRecipes(query) {
        loadingSpinner.classList.remove('hidden'); // Show spinner

        const apiKey = "efcc557c1f6e4663b53db75c89df0f88";
        let url = `https://api.spoonacular.com/recipes/complexSearch?includeIngredients=${encodeURIComponent(query)}&diet=vegan`;
        if (filterGlutenFree.checked) url += "&intolerances=gluten";
        if (filterHighProtein.checked) url += "&minProtein=10";
        if (filterQuickMeals.checked) url += "&maxReadyTime=30";
        url += `&number=10&apiKey=${apiKey}`;

        fetch(url)
            .then(response => {
                loadingSpinner.classList.add('hidden'); // Hide spinner on response
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then(data => displayRecipes(data.results))
            .catch(error => {
                loadingSpinner.classList.add('hidden');
                console.error("Error fetching recipes:", error);
                resultsContainer.innerHTML = "<p>Error fetching recipes. Please try again later.</p>";
            });
    }

    /**
     * Fetch the recipe summary (HTML) for a given recipe ID.
     * @param {number} recipeId
     * @returns {Promise<Object>}
     */
    function fetchRecipeSummary(recipeId) {
        const url = `https://api.spoonacular.com/recipes/${recipeId}/summary?apiKey=${apiKey}`;
        return fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Error ${response.status}`);
                return response.json();
            });
    }

    /**
     * Remove HTML tags from a string, returning plain text.
     * @param {string} html
     * @returns {string}
     */
    function stripHtml(html) {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }

    /**
     * Truncate text to a specified max length, adding ellipsis.
     * @param {string} text
     * @param {number} maxLength
     * @returns {string}
     */
    function shortenText(text, maxLength) {
        return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
    }

    /**
     * Display recipe cards in the results container.
     * Fetches and injects each summary snippet asynchronously.
     * @param {Array} recipes
     */
    function displayRecipes(recipes) {
        resultsContainer.innerHTML = ""; // Clear previous results
        recipes.forEach(recipe => {
            const card = document.createElement("div");
            card.className = "recipe-card";

            // Recipe image
            const image = document.createElement("img");
            image.src = recipe.image || "";
            image.alt = `${recipe.title} image`;
            card.appendChild(image);

            // Card content (title + snippet)
            const content = document.createElement("div");
            content.className = "recipe-card-content";
            const title = document.createElement("h3");
            title.textContent = recipe.title;
            content.appendChild(title);
            const snippet = document.createElement("p");
            snippet.textContent = "Loading summary...";
            content.appendChild(snippet);
            card.appendChild(content);

            // Card footer with favorite and view buttons
            const footer = document.createElement("div");
            footer.className = "recipe-card-footer";

            // Favorite button
            const favBtn = document.createElement("button");
            favBtn.className = "favorite-btn";
            const isFav = favorites.some(fav => fav.id === recipe.id);
            favBtn.innerHTML = isFav ? "★" : "☆";
            favBtn.setAttribute('aria-label', isFav
                ? `Remove ${recipe.title} from favorites`
                : `Add ${recipe.title} to favorites`
            );
            favBtn.addEventListener("click", () => {
                if (isFav) favorites = favorites.filter(fav => fav.id !== recipe.id);
                else favorites.push(recipe);
                favBtn.innerHTML = isFav ? "☆" : "★";
                updateFavorites();
            });
            footer.appendChild(favBtn);

            // View details button
            const viewBtn = document.createElement("button");
            viewBtn.textContent = "View recipe";
            viewBtn.setAttribute('aria-label', `View details for ${recipe.title}`);
            viewBtn.addEventListener("click", () => openRecipeModal(recipe));
            footer.appendChild(viewBtn);

            card.appendChild(footer);
            resultsContainer.appendChild(card);

            // Fetch and display summary text
            fetchRecipeSummary(recipe.id)
                .then(data => {
                    const text = stripHtml(data.summary);
                    snippet.textContent = shortenText(text, 150);
                })
                .catch(() => {
                    snippet.textContent = "Summary not available.";
                });
        });
    }

    /**
     * Fetch detailed recipe information (ingredients + instructions).
     * @param {number} recipeId
     * @returns {Promise<Object>}
     */
    function fetchRecipeDetails(recipeId) {
        const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`;
        return fetch(url).then(resp => {
            if (!resp.ok) throw new Error(`Error ${resp.status}`);
            return resp.json();
        });
    }

    /**
     * Open the modal and populate with full recipe details.
     * @param {Object} recipe
     */
    function openRecipeModal(recipe) {
        modalBody.innerHTML = `<h2>${recipe.title}</h2><p>Loading...</p>`;
        modal.style.display = "block";
        fetchRecipeDetails(recipe.id)
            .then(details => {
                const desc = stripHtml(details.summary || "");
                const ingList = details.extendedIngredients.map(i => i.original).join("<br>");
                let instr = "";
                if (details.instructions) instr = stripHtml(details.instructions);
                else if (details.analyzedInstructions.length)
                    instr = details.analyzedInstructions[0].steps.map(s => s.step).join("<br><br>");

                modalBody.innerHTML = `
                    <h2>${details.title}</h2>
                    <img src="${details.image}" alt="${details.title} image" style="width:100%;height:auto;object-fit:cover;border-radius:8px;">
                    <h3>Description</h3><p>${desc}</p>
                    <h3>Ingredients</h3><p>${ingList}</p>
                    <h3>Instructions</h3><p>${instr}</p>
                `;
            })
            .catch(() => {
                modalBody.innerHTML = `<h2>${recipe.title}</h2><p>Details not available.</p>`;
            });
    }

    // Close modal on '×' click or if clicking outside modal content
    modalClose.addEventListener("click", () => modal.style.display = "none");
    window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });

    /**
     * Update and render the favorites grid.
     * Steps:
     * 1. Retrieve the favorites grid container.
     * 2. Clear existing content.
     * 3. Create and append cards for each favorite.
     * 4. Persist the updated favorites array.
     */
    function updateFavorites() {
        const favoritesGrid = document.getElementById("favorites-grid");
        const favoritesContainer = document.getElementById("favorites");
        // If there are no favorites, hide the entire section:
        if (favorites.length === 0) {
             favoritesContainer.style.display = "none";
            return;
                 } else {
                    favoritesContainer.style.display = "";
                                        }

  favoritesGrid.innerHTML = "";
  // …render each favorite card…
}
        if (!favoritesGrid) return;
        favoritesGrid.innerHTML = "";

        favorites.forEach(fav => {
            // Card wrapper
            const card = document.createElement("div");
            card.className = "recipe-card";

            // Image
            const image = document.createElement("img");
            image.src = fav.image || "";
            image.alt = `${fav.title} image`;
            card.appendChild(image);

            // Title
            const content = document.createElement("div");
            content.className = "recipe-card-content";
            const title = document.createElement("h3");
            title.textContent = fav.title;
            content.appendChild(title);
            card.appendChild(content);

            // Remove button
            const footer = document.createElement("div");
            footer.className = "recipe-card-footer";
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Remove";
            removeBtn.setAttribute('aria-label', `Remove ${fav.title} from favorites`);
            removeBtn.addEventListener("click", () => {
                favorites = favorites.filter(r => r.id !== fav.id);
                updateFavorites();
            });
            footer.appendChild(removeBtn);
            card.appendChild(footer);

            favoritesGrid.appendChild(card);
        });

        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
});
