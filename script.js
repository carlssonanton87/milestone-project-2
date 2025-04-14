// I wait for the DOM to fully load before executing any code.
document.addEventListener("DOMContentLoaded", function () {
    // I select elements for adding ingredients.
    const ingredientInput = document.getElementById("ingredient-input");
    const ingredientAddBtn = document.getElementById("ingredient-add-btn");
    const ingredientListContainer = document.getElementById("ingredient-list");
    let ingredients = []; // I store the ingredients here.

    // I select the filter checkboxes.
    const filterGlutenFree = document.getElementById("filter-gluten-free");
    const filterHighProtein = document.getElementById("filter-high-protein");
    const filterQuickMeals = document.getElementById("filter-quick-meals");

    // I select elements for search results and favorites.
    const searchButton = document.getElementById("search-button");
    const resultsContainer = document.getElementById("results");
    const favoritesContainer = document.getElementById("favorites");
    let favorites = []; // I store favorite recipes here.

    // I add an ingredient when the user clicks the plus (+) button.
    ingredientAddBtn.addEventListener("click", function () {
        const newIngredient = ingredientInput.value.trim();
        if (newIngredient && !ingredients.includes(newIngredient)) {
            ingredients.push(newIngredient);
            ingredientInput.value = ""; // I clear the input.
            renderIngredientTags();
        }
    });

    // I render each ingredient as a clickable tag so the user can remove it.
    function renderIngredientTags() {
        ingredientListContainer.innerHTML = ""; // Clear previous tags.
        ingredients.forEach((ing, index) => {
            const tag = document.createElement("span");
            tag.className = "ingredient-tag";
            tag.textContent = `${ing} ✕`; // Display with a removal indicator.
            tag.addEventListener("click", function () {
                ingredients.splice(index, 1); // Remove the ingredient.
                renderIngredientTags();
            });
            ingredientListContainer.appendChild(tag);
        });
    }

    // When the user clicks "Search Recipes," I join the ingredients and fetch recipes.
    searchButton.addEventListener("click", function () {
        if (ingredients.length === 0) {
            console.log("No ingredients selected. Please add at least one ingredient.");
            return;
        }
        const query = ingredients.join(",");
        console.log("Searching with ingredients:", query);
        fetchRecipes(query);
    });

    /**
     * I fetch vegan recipes from Spoonacular using the complexSearch endpoint.
     * I also include additional filters if selected.
     *
     * @param {string} query - A comma-separated list of ingredients.
     */
    function fetchRecipes(query) {
        const apiKey = "efcc557c1f6e4663b53db75c89df0f88"; // My Spoonacular API key.
        const number = 10; // I want to return 10 recipes.
        let url = `https://api.spoonacular.com/recipes/complexSearch?includeIngredients=${encodeURIComponent(query)}&diet=vegan`;
        
        if (filterGlutenFree.checked) {
            url += "&intolerances=gluten";
        }
        if (filterHighProtein.checked) {
            url += "&minProtein=10";
        }
        if (filterQuickMeals.checked) {
            url += "&maxReadyTime=30";
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
                displayRecipes(data.results);
            })
            .catch(error => {
                console.error("Error fetching recipes:", error);
                resultsContainer.innerHTML = "<p>Error fetching recipes. Please try again later.</p>";
            });
    }

    /**
     * I fetch a detailed summary for a recipe using its ID.
     *
     * @param {number} recipeId - The ID of the recipe.
     * @returns {Promise<Object>} A promise that resolves with the summary data.
     */
    function fetchRecipeSummary(recipeId) {
        const summaryUrl = `https://api.spoonacular.com/recipes/${recipeId}/summary?apiKey=efcc557c1f6e4663b53db75c89df0f88`;
        return fetch(summaryUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error fetching summary for recipe ${recipeId}: ${response.status}`);
                }
                return response.json();
            });
    }

    /**
     * I strip HTML from a string to produce plain text.
     *
     * @param {string} html - The HTML string.
     * @returns {string} The plain text.
     */
    function stripHtml(html) {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }

    /**
     * I shorten the given text to a maximum length.
     *
     * @param {string} text - The text to shorten.
     * @param {number} maxLength - The maximum allowed length.
     * @returns {string} The shortened text.
     */
    function shortenText(text, maxLength) {
        if (text.length > maxLength) {
            return text.slice(0, maxLength) + "...";
        }
        return text;
    }

    /**
     * I display fetched recipes as cards in my results grid.
     * I fetch and then shorten each recipe summary for readability.
     *
     * @param {Array} recipes - The array of recipe objects.
     */
    function displayRecipes(recipes) {
        resultsContainer.innerHTML = ""; // I clear any previous results.

        recipes.forEach(recipe => {
            const card = document.createElement("div");
            card.className = "recipe-card";

            const image = document.createElement("img");
            image.src = recipe.image || "";
            image.alt = `${recipe.title} image`;
            card.appendChild(image);

            const cardContent = document.createElement("div");
            cardContent.className = "recipe-card-content";

            const title = document.createElement("h3");
            title.textContent = recipe.title;
            cardContent.appendChild(title);

            const snippet = document.createElement("p");
            snippet.textContent = "Loading summary...";
            cardContent.appendChild(snippet);

            card.appendChild(cardContent);

            const cardFooter = document.createElement("div");
            cardFooter.className = "recipe-card-footer";

            const favoriteButton = document.createElement("button");
            favoriteButton.className = "favorite-btn";
            favoriteButton.innerHTML = favorites.some(fav => fav.id === recipe.id) ? "★" : "☆";
            favoriteButton.addEventListener("click", function () {
                if (favorites.some(fav => fav.id === recipe.id)) {
                    favorites = favorites.filter(fav => fav.id !== recipe.id);
                    favoriteButton.innerHTML = "☆";
                } else {
                    favorites.push(recipe);
                    favoriteButton.innerHTML = "★";
                }
                updateFavorites();
            });
            cardFooter.appendChild(favoriteButton);

            const viewButton = document.createElement("button");
            viewButton.textContent = "Visa recept";
            viewButton.addEventListener("click", function () {
                console.log("Visa recept clicked for:", recipe.title);
            });
            cardFooter.appendChild(viewButton);
            card.appendChild(cardFooter);

            resultsContainer.appendChild(card);

            // I fetch the summary for the recipe and update the snippet.
            fetchRecipeSummary(recipe.id)
                .then(summaryData => {
                    const plainText = stripHtml(summaryData.summary);
                    snippet.textContent = shortenText(plainText, 150);
                })
                .catch(error => {
                    console.error("Error fetching summary:", error);
                    snippet.textContent = "Summary not available.";
                });
        });
    }

    /**
     * I update the favorites section so that saved recipes are displayed in a grid.
     */
    function updateFavorites() {
        const favoritesGrid = document.getElementById("favorites-grid");
        if (!favoritesGrid) {
            console.error("Favorites grid container not found.");
            return;
        }
        favoritesGrid.innerHTML = ""; // I clear previous favorites.

        favorites.forEach(fav => {
            const card = document.createElement("div");
            card.className = "recipe-card";

            const image = document.createElement("img");
            image.src = fav.image || "";
            image.alt = `${fav.title} image`;
            card.appendChild(image);

            const cardContent = document.createElement("div");
            cardContent.className = "recipe-card-content";

            const title = document.createElement("h3");
            title.textContent = fav.title;
            cardContent.appendChild(title);
            card.appendChild(cardContent);

            const cardFooter = document.createElement("div");
            cardFooter.className = "recipe-card-footer";

            const removeButton = document.createElement("button");
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
