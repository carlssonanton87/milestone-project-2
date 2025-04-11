// Wait for the DOM to fully load before running the code
document.addEventListener("DOMContentLoaded", function () {
    // Retrieve the search input element by its ID from the HTML
    const searchInput = document.getElementById("search-input");
    // Retrieve the search button element by its ID from the HTML
    const searchButton = document.getElementById("search-button");
    // Retrieve the results container where the recipe cards will be displayed
    const resultsContainer = document.getElementById("results");

    // Add an event listener to the search button
    searchButton.addEventListener("click", function () {
        // Get the user's input, trimmed of extra spaces
        const query = searchInput.value.trim();
        if (query) {
            // Log the search click and query value for debugging
            console.log("Search button clicked. Query:", query);
            // Call the function to fetch recipes based on the query
            fetchRecipes(query);
        } else {
            console.log("Empty query; please enter some ingredients.");
        }
    });

    /**
     * Fetch recipes from the Spoonacular API using the provided ingredients.
     * @param {string} query - Comma-separated list of ingredients.
     */
    function fetchRecipes(query) {
        // Your Spoonacular API key provided by the user
        const apiKey = "efcc557c1f6e4663b53db75c89df0f88";
        // Define the number of recipes you want to return
        const number = 10;
        // Build the API URL with query parameters safely encoded
        const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(query)}&number=${number}&ranking=1&ignorePantry=true&apiKey=${apiKey}`;
        // Log the URL for debugging
        console.log("Fetching URL:", url);

        // Make the API request using fetch()
        fetch(url)
            .then(response => {
                // Check if the response status is ok (HTTP status code 200-299)
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                // Parse the response JSON
                return response.json();
            })
            .then(data => {
                // Log the API response data for debugging
                console.log("API Response:", data);
                // Call displayRecipes to update the UI with the fetched recipes
                displayRecipes(data);
            })
            .catch(error => {
                // Log any errors that occur during the fetch call
                console.error("Error fetching recipes:", error);
                // Show a user-friendly error message in the results container
                resultsContainer.innerHTML = "<p>Error fetching recipes. Please try again later.</p>";
            });
    }

    /**
     * Renders the recipes returned by the API on the page.
     * @param {Array} recipes - An array of recipe objects.
     */
    function displayRecipes(recipes) {
        // Clear any previous results
        resultsContainer.innerHTML = '';

        // Loop through each recipe in the received data
        recipes.forEach(recipe => {
            // Create a new div element that will act as a "card" for the recipe
            const card = document.createElement('div');
            card.classList.add('recipe-card'); // Add class for styling

            // Create an element for the recipe title
            const title = document.createElement('h3');
            title.textContent = recipe.title;

            // Create an image element for the recipe
            const image = document.createElement('img');
            image.src = recipe.image;           // Recipe image URL from the API
            image.alt = `${recipe.title} image`;
            image.style.width = "100%";           // Set image width

            // Create an element to show some details (used and missed ingredients)
            const details = document.createElement('p');
            details.textContent = `Used Ingredients: ${recipe.usedIngredientCount}, Missing Ingredients: ${recipe.missedIngredientCount}`;

            // Append title, image, and details to the recipe card
            card.appendChild(title);
            card.appendChild(image);
            card.appendChild(details);

            // Append the recipe card to the results container in your HTML
            resultsContainer.appendChild(card);
        });
    }
});
