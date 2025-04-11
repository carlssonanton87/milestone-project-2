// Wait for the DOM to fully load before running the code
document.addEventListener("DOMContentLoaded", function () {
    // Retrieve the search input element by its ID
    const searchInput = document.getElementById("search-input");
    // Retrieve the search button element by its ID
    const searchButton = document.getElementById("search-button");
    // Retrieve the results container where recipes will be displayed
    const resultsContainer = document.getElementById("results");
    // Retrieve the favorites container where favorite recipes will be displayed
    const favoritesContainer = document.getElementById("favorites");
    // Initialize an array to store favorite recipes
    let favorites = [];

    // Add an event listener to the search button
    searchButton.addEventListener("click", function () {
        // Get the user's input, trimmed of extra spaces
        const query = searchInput.value.trim();
        if (query) {
            console.log("Search button clicked. Query:", query);
            fetchRecipes(query);  // Call the function to fetch recipes based on the query
        } else {
            console.log("Empty query; please enter some ingredients.");
        }
    });

    /**
     * Fetch recipes from the Spoonacular API using the provided ingredients.
     *
     * @param {string} query - Comma-separated list of ingredients.
     */
    function fetchRecipes(query) {
        const apiKey = "efcc557c1f6e4663b53db75c89df0f88"; // Spoonacular API key
        const number = 10; // Number of recipes to return
        // Build the API URL with query parameters
        const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(query)}&number=${number}&ranking=1&ignorePantry=true&apiKey=${apiKey}`;
        console.log("Fetching URL:", url);

        // Make the API request
        fetch(url)
            .then(response => {
                console.log("Response status:", response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("API Response:", data);
                displayRecipes(data);  // Render the recipes on the page
            })
            .catch(error => {
                console.error("Error fetching recipes:", error);
                resultsContainer.innerHTML = "<p>Error fetching recipes. Please try again later.</p>";
            });
    }

    /**
     * Renders the recipes returned by the API on the page.
     *
     * @param {Array} recipes - An array of recipe objects.
     */
    function displayRecipes(recipes) {
        // Clear any previous results
        resultsContainer.innerHTML = '';

        // Loop through each recipe from the API response
        recipes.forEach(recipe => {
            // Create a container (card) for the recipe
            const card = document.createElement('div');
            card.classList.add('recipe-card'); // Apply styling

            // Create an element for the recipe title
            const title = document.createElement('h3');
            title.textContent = recipe.title;

            // Create an image element for the recipe image
            const image = document.createElement('img');
            image.src = recipe.image;
            image.alt = `${recipe.title} image`;
            image.style.width = "100%";

            // Create a paragraph element to display ingredient details
            const details = document.createElement('p');
            details.textContent = `Used Ingredients: ${recipe.usedIngredientCount}, Missing Ingredients: ${recipe.missedIngredientCount}`;

            // Create a "Save Recipe" button to allow users to favorite a recipe
            const saveButton = document.createElement('button');
            saveButton.textContent = "Save Recipe";
            saveButton.addEventListener("click", function () {
                // Ensure the recipe isn't already saved (check by id)
                if (!favorites.some(fav => fav.id === recipe.id)) {
                    favorites.push(recipe);
                    updateFavorites(); // Refresh the favorites display
                }
            });

            // Append title, image, details, and save button to the recipe card
            card.appendChild(title);
            card.appendChild(image);
            card.appendChild(details);
            card.appendChild(saveButton);

            // Append the recipe card to the results container
            resultsContainer.appendChild(card);
        });
    }

    /**
     * Updates and renders the favorite recipes in the favorites section.
     */
    function updateFavorites() {
        // Clear the favorites container, keeping the header
        favoritesContainer.innerHTML = "<h2>Favorites</h2>";

        // Loop through each saved favorite recipe
        favorites.forEach(fav => {
            // Create a card for each favorite recipe
            const card = document.createElement('div');
            card.classList.add('recipe-card'); // Reuse card styling

            // Create an element for the recipe title
            const title = document.createElement('h3');
            title.textContent = fav.title;

            // Create an image element for the recipe
            const image = document.createElement('img');
            image.src = fav.image;
            image.alt = `${fav.title} image`;
            image.style.width = "100%";

            // Create a "Remove" button to allow removal from favorites
            const removeButton = document.createElement('button');
            removeButton.textContent = "Remove";
            removeButton.addEventListener("click", function () {
                // Remove this recipe from the favorites array
                favorites = favorites.filter(r => r.id !== fav.id);
                updateFavorites(); // Refresh the display
            });

            // Append title, image, and remove button to the favorite card
            card.appendChild(title);
            card.appendChild(image);
            card.appendChild(removeButton);

            // Append the favorite card to the favorites container
            favoritesContainer.appendChild(card);
        });
    }
});
