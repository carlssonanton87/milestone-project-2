// I ensure that the entire DOM is loaded before executing any code.
document.addEventListener("DOMContentLoaded", function () {
    // I retrieve the search input element, where users type in their ingredients.
    const searchInput = document.getElementById("search-input");
    // I get the search button element which users click to start searching.
    const searchButton = document.getElementById("search-button");
    // I retrieve the container element where the recipe search results will be displayed.
    const resultsContainer = document.getElementById("results");
    // I also get the container element where I'll display the user's favorite recipes.
    const favoritesContainer = document.getElementById("favorites");
    // I initialize an empty array to store recipes that the user marks as favorites.
    let favorites = [];

    // I add an event listener to the search button so that when it's clicked, I trigger the recipe search.
    searchButton.addEventListener("click", function () {
        // I extract the user's input and remove any extra whitespace.
        const query = searchInput.value.trim();
        if (query) {
            console.log("Search button clicked. Query:", query);
            // I call the fetchRecipes function to fetch recipes based on the input ingredients.
            fetchRecipes(query);
        } else {
            console.log("Empty query; please enter some ingredients.");
        }
    });

    /**
     * I created this function to fetch vegan recipes from Spoonacular using the complexSearch endpoint.
     * I am passing the user’s input as a comma-separated list of ingredients.
     * By adding diet=vegan, I ensure that only vegan recipes are returned.
     *
     * @param {string} query - A comma-separated list of ingredients provided by the user.
     */
    function fetchRecipes(query) {
        const apiKey = "efcc557c1f6e4663b53db75c89df0f88"; // My Spoonacular API key.
        const number = 10; // I set the maximum number of recipes to return.
        // I build the API URL, using encodeURIComponent() to properly encode the user's query.
        const url = `https://api.spoonacular.com/recipes/complexSearch?includeIngredients=${encodeURIComponent(query)}&diet=vegan&number=${number}&apiKey=${apiKey}`;
        console.log("Fetching URL:", url);

        // I use fetch() to send a GET request to the Spoonacular API.
        fetch(url)
            .then(response => {
                console.log("Response status:", response.status);
                // If the response is not OK, I throw an error to be caught later.
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                // I convert the response into JSON format.
                return response.json();
            })
            .then(data => {
                // I log the API response for debugging.
                console.log("API Response:", data);
                // I then pass the recipes (located in data.results) to the displayRecipes function.
                displayRecipes(data.results);
            })
            .catch(error => {
                // I log any errors that occur during the fetch process.
                console.error("Error fetching recipes:", error);
                // I update the results container with an error message for the user.
                resultsContainer.innerHTML = "<p>Error fetching recipes. Please try again later.</p>";
            });
    }

    /**
     * This function displays the recipes on the page.
     * It creates a card for each recipe, including the title, image, and a "Save Recipe" button.
     *
     * @param {Array} recipes - An array of recipe objects returned by the API.
     */
    function displayRecipes(recipes) {
        // I clear any previous results to avoid stacking recipes.
        resultsContainer.innerHTML = '';

        // I loop through the recipes array and create a card for each recipe.
        recipes.forEach(recipe => {
            // I create a div element that acts as a card and add a CSS class for styling.
            const card = document.createElement('div');
            card.classList.add('recipe-card');

            // I create an h3 element for the recipe title and set its text.
            const title = document.createElement('h3');
            title.textContent = recipe.title;

            // I create an image element for the recipe, setting its source to the recipe image.
            const image = document.createElement('img');
            image.src = recipe.image;
            image.alt = `${recipe.title} image`;
            image.style.width = "100%";

            // I create a "Save Recipe" button that lets the user add recipes to their favorites.
            const saveButton = document.createElement('button');
            saveButton.textContent = "Save Recipe";
            saveButton.addEventListener("click", function () {
                // I check if the recipe is already saved based on its unique id.
                if (!favorites.some(fav => fav.id === recipe.id)) {
                    favorites.push(recipe);
                    // I update the favorites section to reflect the newly saved recipe.
                    updateFavorites();
                }
            });

            // I append the title, image, and save button to the card.
            card.appendChild(title);
            card.appendChild(image);
            card.appendChild(saveButton);

            // I append the complete card to the results container on the page.
            resultsContainer.appendChild(card);
        });
    }

    /**
     * This function updates the favorites section on the page.
     * It loops through the favorites array and creates a card for each saved recipe.
     */
    function updateFavorites() {
        // I clear the favorites container and re-add the header.
        favoritesContainer.innerHTML = "<h2>Favorites</h2>";

        // I loop through each recipe in my favorites array.
        favorites.forEach(fav => {
            // I create a card for each favorite recipe.
            const card = document.createElement('div');
            card.classList.add('recipe-card');

            // I create an h3 element for the recipe title.
            const title = document.createElement('h3');
            title.textContent = fav.title;

            // I create an image element for the recipe.
            const image = document.createElement('img');
            image.src = fav.image;
            image.alt = `${fav.title} image`;
            image.style.width = "100%";

            // I create a "Remove" button to allow users to remove the recipe from favorites.
            const removeButton = document.createElement('button');
            removeButton.textContent = "Remove";
            removeButton.addEventListener("click", function () {
                // I remove the recipe from the favorites array using a filter.
                favorites = favorites.filter(r => r.id !== fav.id);
                // I update the favorites section to reflect the removal.
                updateFavorites();
            });

            // I append the title, image, and remove button to the favorite card.
            card.appendChild(title);
            card.appendChild(image);
            card.appendChild(removeButton);

            // I append the favorite card to the favorites container.
            favoritesContainer.appendChild(card);
        });
    }
});
