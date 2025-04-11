# Milestone Project 2 – Vegan Recipe Finder

## Overview
This project is an interactive web application that allows users to input the ingredients they have at home and fetch vegan recipe suggestions based on those ingredients. The app also provides filtering options for dietary preferences such as gluten-free, high-protein, and quick meals.

## MVP Features
- **Ingredient Search:** Users can input ingredients.
- **API Integration:** Fetch recipes from an external API (e.g., Spoonacular).
- **Filter Options:** Options for gluten-free, high-protein, quick meals.
- **Favorites:** Save favorite recipes for later use.

## Tech Stack
- HTML
- CSS
- JavaScript
- Integration with a recipe API (e.g., Spoonacular)

## Setup
Instructions to install and run the project will be provided here.

## Wireframes
![UI Wireframe](assets/wireframe.png)

## Bug Log

### Bug: API Fetch Failing Initially
- **Description:** When attempting to fetch recipes from the Spoonacular API, nothing was displayed because the API call was failing. The issue was due to the script not being wrapped in a `DOMContentLoaded` event listener and the results container not being defined properly.
- **Impact:** Users could not see any recipes when performing a search, which impeded progress testing the API integration.
- **Resolution:** The bug was fixed in commit `feat: Integrate Spoonacular API with real data using provided API key and update display logic`, where the JavaScript code was updated to wrap all functionality within a `DOMContentLoaded` event listener and properly define and reference the results container.
- **Status:** Fixed
