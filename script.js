// script.js

// Ensure the DOM is fully loaded before executing any JavaScript code
document.addEventListener("DOMContentLoaded", function () {
    // Log a message to confirm that the script is running
    console.log("Vegan Recipe Finder loaded");

    // Retrieve the search input element by its ID
    const searchInput = document.getElementById("search-input");
    // Retrieve the search button element by its ID
    const searchButton = document.getElementById("search-button");
    // Retrieve the results section where recipes will be displayed
    const resultsContainer = document.getElementById("results");

    // Set an event listener on the search button to handle clicks
    searchButton.addEventListener("click", function () {
        // Get the trimmed value from the input field
        const query = searchInput.value.trim();
        // Check if the query is not empty
        if (query) {
            // Call the function to fetch recipes based on the query
            fetchRecipes(query);
        }
    });

    /**
     * Placeholder function for fetching recipes using an API.
     * @param {string} query - The ingredients input by the user.
     */
    function fetchRecipes(query) {
        console.log(`Searching for recipes with: ${query}`);
        // Future implementation: fetch recipes from Spoonacular or other recipe APIs.
        
    }
});
