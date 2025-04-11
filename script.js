// I ensure that the entire DOM is loaded before executing any code.
document.addEventListener("DOMContentLoaded", function () {
    // Instead of one text input for searching, 
    // I have a text box for adding a single ingredient and a button to confirm adding.
    const ingredientInput = document.getElementById("ingredient-input");
    const ingredientAddBtn = document.getElementById("ingredient-add-btn");
    const ingredientListContainer = document.getElementById("ingredient-list");

    // I store the user's chosen ingredients in this array.
    let ingredients = [];

    // This button triggers the recipe search with all selected ingredients.
    const searchButton = document.getElementById("search-button");
    // Container for the search results
    const resultsContainer = document.getElementById("results");
    // Container for the favorites section
    const favoritesContainer = document.getElementById("favorites");
    // Array to store favorite recipes
    let favorites = [];

    /**
     * I add an ingredient to the array if it’s not empty and not already present.
     * Then I re-render the ingredient list visually.
     */
    ingredientAddBtn.addEventListener("click", function () {
        const newIngredient = ingredientInput.value.trim();
        if (newIngredient && !ingredients.includes(newIngredient)) {
            ingredients.push(newIngredient);
            ingredientInput.value = ''; // Clear the input
            renderIngredientTags();
        }
    });

    /**
     * I create "tags" for each selected ingredient in the ingredientListContainer.
     * Clicking a tag removes the ingredient from the array.
     */
    function renderIngredientTags() {
        // Clear the existing list before re-drawing
        ingredientListContainer.innerHTML = '';

        // Loop through each ingredient in my ingredients array
        ingredients.forEach((ing, index) => {
            // Create a span that represents a "tag"
            const tag = document.createElement('span');
            tag.classList.add('ingredient-tag');
            tag.textContent = `${ing} ✕`;

            // Clicking the tag removes this ingredient
            tag.addEventListener('click', function () {
                // Remove the ingredient at this index from the array
                ingredients.splice(index, 1);
                renderIngredientTags(); 
            });

            ingredientListContainer.appendChild(tag);
        });
    }

    /**
     * When the user clicks "Search Recipes," 
     * I take all ingredients from the 'ingredients' array and fetch vegan recipes.
     */
    searchButton.addEventListener("click", function () {
        // If no ingredients are selected, do nothing or show a message
        if (ingredients.length === 0) {
            console.log("No ingredients selected. Please add at least one ingredient.");
            return;
        }
        
        // Join the ingredients array into a comma-separated list for the API query
        const query = ingredients.join(',');
        console.log("Searching with ingredients:", query);
        fetchRecipes(query);
    });

    /**
     * I fetch vegan recipes from Spoonacular using the complexSearch endpoint.
     * The 'includeIngredients' param is built from the chosen ingredients.
     * 'diet=vegan' ensures only vegan recipes are returned.
     */
    function fetchRecipes(query) {
        const apiKey = "efcc557c1f6e4663b53db75c89df0f88"; 
        const number = 10;
        const url = `https://api.spoonacular.com/recipes/complexSearch?includeIngredients=${encodeURIComponent(query)}&diet=vegan&number=${number}&apiKey=${apiKey}`;

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
                displayRecipes(data.results); // data.results holds the actual recipes
            })
            .catch(error => {
                console.error("Error fetching recipes:", error);
                resultsContainer.innerHTML = "<p>Error fetching recipes. Please try again later.</p>";
            });
    }

    /**
     * I display the returned recipes in the results section as cards.
     * Each card has a title, image, and "Save Recipe" button.
     */
    function displayRecipes(recipes) {
        // Clear any previous results
        resultsContainer.innerHTML = '';

        // Loop through each recipe
        recipes.forEach(recipe => {
            // Card container
            const card = document.createElement('div');
            card.classList.add('recipe-card');

            // Title
            const title = document.createElement('h3');
            title.textContent = recipe.title;

            // Image
            const image = document.createElement('img');
            image.src = recipe.image || '';
            image.alt = `${recipe.title} image`;
            image.style.width = "100%";

            // "Save Recipe" button 
            const saveButton = document.createElement('button');
            saveButton.textContent = "Save Recipe";
            saveButton.addEventListener("click", function () {
                // Check if not already in favorites
                if (!favorites.some(fav => fav.id === recipe.id)) {
                    favorites.push(recipe);
                    updateFavorites();
                }
            });

            // Append elements to card
            card.appendChild(title);
            card.appendChild(image);
            card.appendChild(saveButton);

            // Append the card to the results container
            resultsContainer.appendChild(card);
        });
    }

    /**
     * I update the Favorites section with any recipes the user has saved.
     * Each favorite card has a "Remove" button to remove it from the list.
     */
    function updateFavorites() {
        // Clear the favorites container and re-add the heading
        favoritesContainer.innerHTML = "<h2>Favorites</h2>";

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
                favorites = favorites.filter(r => r.id !== fav.id);
                updateFavorites();
            });

            card.appendChild(title);
            card.appendChild(image);
            card.appendChild(removeButton);
            favoritesContainer.appendChild(card);
        });
    }
});
