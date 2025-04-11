// I ensure that the entire DOM is loaded before executing any code.
document.addEventListener("DOMContentLoaded", function () {
    // I select the element where the user can type in a single ingredient.
    const ingredientInput = document.getElementById("ingredient-input");
    // I get the button the user clicks to add an ingredient.
    const ingredientAddBtn = document.getElementById("ingredient-add-btn");
    // I also select the container where I'll display the ingredient "tags".
    const ingredientListContainer = document.getElementById("ingredient-list");

    // I maintain an array of the ingredients the user has added.
    let ingredients = [];

    // I select the filter checkboxes.
    const filterGlutenFree = document.getElementById("filter-gluten-free");
    const filterHighProtein = document.getElementById("filter-high-protein");
    const filterQuickMeals = document.getElementById("filter-quick-meals");

    // I get the search button that triggers the recipe lookup.
    const searchButton = document.getElementById("search-button");
    // I select the container where the recipe search results will be shown.
    const resultsContainer = document.getElementById("results");
    // I also get the container for the user's saved favorite recipes.
    const favoritesContainer = document.getElementById("favorites");
    // I initialize an empty array to hold any favorite recipes.
    let favorites = [];

    /**
     * I add an ingredient when the user clicks the plus (+) button.
     * I then re-render the ingredients list as tags.
     */
    ingredientAddBtn.addEventListener("click", function () {
        const newIngredient = ingredientInput.value.trim();
        if (newIngredient && !ingredients.includes(newIngredient)) {
            ingredients.push(newIngredient);
            ingredientInput.value = ''; // I clear the input after adding
            renderIngredientTags();
        }
    });

    /**
     * I render the user's selected ingredients as clickable tags.
     * Clicking a tag removes that ingredient from the list.
     */
    function renderIngredientTags() {
        // I clear the current tags.
        ingredientListContainer.innerHTML = '';
        // I loop over each ingredient in the array and create a tag.
        ingredients.forEach((ing, index) => {
            const tag = document.createElement('span');
            tag.classList.add('ingredient-tag');
            tag.textContent = `${ing} ✕`; // I add an 'X' for removal

            // I allow the user to remove an ingredient by clicking the tag.
            tag.addEventListener('click', function () {
                ingredients.splice(index, 1); // Remove the ingredient from the array
                renderIngredientTags(); // Re-render the tag list
            });

            ingredientListContainer.appendChild(tag);
        });
    }

    /**
     * When the user clicks "Search Recipes," 
     * I join the selected ingredients into a comma-separated list 
     * and fetch recipes from Spoonacular based on the ingredients and filters.
     */
    searchButton.addEventListener("click", function () {
        if (ingredients.length === 0) {
            console.log("No ingredients selected. Please add at least one ingredient.");
            return;
        }
        const query = ingredients.join(',');
        console.log("Searching with ingredients:", query);
        // I call my function to fetch recipes using the current ingredients and filter options.
        fetchRecipes(query);
    });

    /**
     * I fetch vegan recipes from Spoonacular using the complexSearch endpoint.
     * I include dynamic filter options:
     * - If Gluten-Free is checked, I add intolerances=gluten.
     * - If High-Protein is checked, I add minProtein (for demonstration, I use 10g).
     * - If Quick Meals is checked, I add maxReadyTime (e.g., 30 minutes).
     *
     * @param {string} query - A comma-separated list of ingredients.
     */
    function fetchRecipes(query) {
        const apiKey = "efcc557c1f6e4663b53db75c89df0f88"; // My Spoonacular API key
        const number = 10; // I want to return 10 recipes

        // I start building the URL with the base parameters.
        let url = `https://api.spoonacular.com/recipes/complexSearch?includeIngredients=${encodeURIComponent(query)}&diet=vegan`;

        // I check if the Gluten-Free filter is selected, then append the intolerance parameter.
        if (filterGlutenFree.checked) {
            url += "&intolerances=gluten";
        }
        // I check if the High-Protein filter is selected, then append a minimum protein parameter.
        // Note: Check your API documentation to ensure this parameter is supported.
        if (filterHighProtein.checked) {
            url += "&minProtein=10"; // For example, require at least 10g of protein.
        }
        // I check if the Quick Meals filter is selected, then append a ready time parameter.
        if (filterQuickMeals.checked) {
            url += "&maxReadyTime=30"; // For example, recipes that take 30 minutes or less.
        }

        // I then append the number of recipes to return and the API key.
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
                // I pass the array of recipes (data.results) to the display function.
                displayRecipes(data.results);
            })
            .catch(error => {
                console.error("Error fetching recipes:", error);
                resultsContainer.innerHTML = "<p>Error fetching recipes. Please try again later.</p>";
            });
    }

    /**
     * I display each fetched recipe as a card in the results container.
     * Each card shows the recipe title, an image, and includes a "Save Recipe" button.
     *
     * @param {Array} recipes - An array of recipe objects.
     */
    function displayRecipes(recipes) {
        resultsContainer.innerHTML = ''; // I clear any previous results.

        recipes.forEach(recipe => {
            // I create a card for each recipe.
            const card = document.createElement('div');
            card.classList.add('recipe-card');

            // I create and set up an element for the recipe title.
            const title = document.createElement('h3');
            title.textContent = recipe.title;

            // I create an image element for the recipe.
            const image = document.createElement('img');
            image.src = recipe.image || '';
            image.alt = `${recipe.title} image`;
            image.style.width = "100%";

            // I create a "Save Recipe" button.
            const saveButton = document.createElement('button');
            saveButton.textContent = "Save Recipe";
            saveButton.addEventListener("click", function () {
                // I check if the recipe isn't already saved by comparing IDs.
                if (!favorites.some(fav => fav.id === recipe.id)) {
                    favorites.push(recipe);
                    updateFavorites(); // I update the favorites display.
                }
            });

            // I append the title, image, and button to the card.
            card.appendChild(title);
            card.appendChild(image);
            card.appendChild(saveButton);

            // I append the card to the results container.
            resultsContainer.appendChild(card);
        });
    }

    /**
     * I update the favorites section on the page.
     * For every saved recipe, I create a card with a title, image, and a "Remove" button.
     */
    function updateFavorites() {
        favoritesContainer.innerHTML = "<h2>Favorites</h2>"; // I clear previous favorites.

        favorites.forEach(fav => {
            const card = document.createElement('div');
            card.classList.add('recipe-card');

            const title = document.createElement('h3');
            title.textContent = fav.title;

            const image = document.createElement('img');
            image.src = fav.image || '';
            image.alt = `${fav.title} image`;
            image.style.width = "100%";

            const removeButton = document.createElement('button');
            removeButton.textContent = "Remove";
            removeButton.addEventListener("click", function () {
                favorites = favorites.filter(r => r.id !== fav.id); // I remove the recipe from favorites.
                updateFavorites(); // I refresh the favorites section.
            });

            card.appendChild(title);
            card.appendChild(image);
            card.appendChild(removeButton);
            favoritesContainer.appendChild(card);
        });
    }
});
