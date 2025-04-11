// I wait for the DOM to be fully loaded before running my code.
document.addEventListener("DOMContentLoaded", function () {
    // I select elements for managing ingredients.
    const ingredientInput = document.getElementById("ingredient-input");
    const ingredientAddBtn = document.getElementById("ingredient-add-btn");
    const ingredientListContainer = document.getElementById("ingredient-list");
    let ingredients = []; // I store user-added ingredients in this array.
  
    // I select my filter checkboxes.
    const filterGlutenFree = document.getElementById("filter-gluten-free");
    const filterHighProtein = document.getElementById("filter-high-protein");
    const filterQuickMeals = document.getElementById("filter-quick-meals");
  
    // I select elements for search results and favorites.
    const searchButton = document.getElementById("search-button");
    const resultsContainer = document.getElementById("results");
    const favoritesContainer = document.getElementById("favorites");
    let favorites = []; // I store favorite recipes here.
  
    // I add an ingredient when the user clicks the plus button.
    ingredientAddBtn.addEventListener("click", function () {
        const newIngredient = ingredientInput.value.trim();
        if (newIngredient && !ingredients.includes(newIngredient)) {
            ingredients.push(newIngredient);
            ingredientInput.value = ''; // I clear the input after adding.
            renderIngredientTags();
        }
    });
  
    // I render the current ingredients as clickable tags.
    function renderIngredientTags() {
        ingredientListContainer.innerHTML = ''; // I clear previous tags.
        ingredients.forEach((ing, index) => {
            const tag = document.createElement('span');
            tag.className = 'ingredient-tag';
            tag.textContent = `${ing} ✕`; // I include an "X" to indicate removal.
            tag.addEventListener('click', function () {
                // I remove the clicked ingredient and re-render the tags.
                ingredients.splice(index, 1);
                renderIngredientTags();
            });
            ingredientListContainer.appendChild(tag);
        });
    }
  
    // When the user clicks "Search Recipes," I join the ingredients list and call fetchRecipes.
    searchButton.addEventListener("click", function () {
        if (ingredients.length === 0) {
            console.log("No ingredients selected. Please add at least one ingredient.");
            return;
        }
        const query = ingredients.join(',');
        console.log("Searching with ingredients:", query);
        fetchRecipes(query);
    });
  
    /**
     * I fetch vegan recipes from Spoonacular using complexSearch.
     * I also include additional filters if selected.
     *
     * @param {string} query - Comma-separated list of ingredients.
     */
    function fetchRecipes(query) {
        const apiKey = "efcc557c1f6e4663b53db75c89df0f88"; // My Spoonacular API key.
        const number = 10; // I want to fetch 10 recipes.
        let url = `https://api.spoonacular.com/recipes/complexSearch?includeIngredients=${encodeURIComponent(query)}&diet=vegan`;
  
        // I append additional filters based on user selections.
        if (filterGlutenFree.checked) {
            url += "&intolerances=gluten";
        }
        if (filterHighProtein.checked) {
            url += "&minProtein=10"; // For example, require at least 10g protein.
        }
        if (filterQuickMeals.checked) {
            url += "&maxReadyTime=30"; // For recipes that are ready in 30 minutes or less.
        }
  
        url += `&number=${number}&apiKey=${apiKey}`;
        console.log("Fetching URL:", url);
  
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("API Response:", data);
                // I pass the recipes (data.results) to my display function.
                displayRecipes(data.results);
            })
            .catch(error => {
                console.error("Error fetching recipes:", error);
                resultsContainer.innerHTML = "<p>Error fetching recipes. Please try again later.</p>";
            });
    }
  
    /**
     * I display each fetched recipe as a card in my results grid.
     * Each card shows an image, title, a snippet, and two buttons:
     * - A star button to toggle favorites.
     * - A "Visa recept" button to view details.
     *
     * @param {Array} recipes - Array of recipe objects.
     */
    function displayRecipes(recipes) {
        resultsContainer.innerHTML = ''; // I clear previous results.
  
        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';
  
            // I add the recipe image.
            const image = document.createElement('img');
            image.src = recipe.image || '';
            image.alt = `${recipe.title} image`;
            card.appendChild(image);
  
            // I create a container for the text content.
            const cardContent = document.createElement('div');
            cardContent.className = 'recipe-card-content';
  
            const title = document.createElement('h3');
            title.textContent = recipe.title;
            cardContent.appendChild(title);
  
            // I add a placeholder description.
            const snippet = document.createElement('p');
            snippet.textContent = "Här är en kort beskrivning av receptet.";
            cardContent.appendChild(snippet);
  
            card.appendChild(cardContent);
  
            // I create a footer for my buttons.
            const cardFooter = document.createElement('div');
            cardFooter.className = 'recipe-card-footer';
  
            // I create a favorite button using a star icon.
            const favoriteButton = document.createElement('button');
            favoriteButton.className = 'favorite-btn';
            // I display a filled star if the recipe is a favorite; otherwise, an empty star.
            favoriteButton.innerHTML = favorites.some(fav => fav.id === recipe.id) ? "★" : "☆";
            favoriteButton.addEventListener("click", function () {
                if (favorites.some(fav => fav.id === recipe.id)) {
                    // I remove the recipe from favorites.
                    favorites = favorites.filter(fav => fav.id !== recipe.id);
                    favoriteButton.innerHTML = "☆";
                } else {
                    // I add the recipe to favorites.
                    favorites.push(recipe);
                    favoriteButton.innerHTML = "★";
                }
                // I update the favorites section.
                updateFavorites();
            });
            cardFooter.appendChild(favoriteButton);
  
            // I add a "Visa recept" button for additional details (functionality can be implemented later).
            const viewButton = document.createElement('button');
            viewButton.textContent = "Visa recept";
            viewButton.addEventListener("click", function () {
                console.log("Visa recept clicked for:", recipe.title);
            });
            cardFooter.appendChild(viewButton);
  
            card.appendChild(cardFooter);
            resultsContainer.appendChild(card);
        });
    }
  
    /**
     * I update the favorites section to display saved recipes in a grid layout.
     * I clear the favorites container and then create a dedicated grid container inside.
     */
    function updateFavorites() {
        // I update the HTML of the favorites section to include a heading and a grid container.
        favoritesContainer.innerHTML = "<h2>Favorites</h2><div class='favorites-grid'></div>";
  
        // I select the grid container inside favorites.
        const favoritesGrid = favoritesContainer.querySelector('.favorites-grid');
  
        // I loop through my favorites array and display each recipe as a card.
        favorites.forEach(fav => {
            const card = document.createElement('div');
            card.className = 'recipe-card';
  
            const image = document.createElement('img');
            image.src = fav.image || '';
            image.alt = `${fav.title} image`;
            card.appendChild(image);
  
            const cardContent = document.createElement('div');
            cardContent.className = 'recipe-card-content';
  
            const title = document.createElement('h3');
            title.textContent = fav.title;
            cardContent.appendChild(title);
            card.appendChild(cardContent);
  
            const cardFooter = document.createElement('div');
            cardFooter.className = 'recipe-card-footer';
  
            const removeButton = document.createElement('button');
            removeButton.textContent = "Remove";
            removeButton.addEventListener("click", function () {
                favorites = favorites.filter(r => r.id !== fav.id);
                updateFavorites();
            });
            cardFooter.appendChild(removeButton);
            card.appendChild(cardFooter);
  
            favoritesGrid.appendChild(card);
        });
    }
});
