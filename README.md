# Milestone Project 2 – Vegan Recipe Finder

## Overview
**Vegan Recipe Finder** is an interactive front‑end web application that helps users discover vegan recipes based on the ingredients they have at home. It integrates with the Spoonacular API to:

- Let users add multiple ingredients as tags  
- Apply optional filters (Gluten‑Free, High‑Protein, Quick Meals)  
- Display results in a modern, responsive card grid with shortened summaries  
- Save favorites via a star‑toggle and view them in a separate grid  
- Open a “Visa recept” modal showing a full‑size image, detailed description, and step‑by‑step instructions  

---

## User Experience
1. **Add Ingredients**  
   - Type an ingredient and click **+** to create a removable tag.
2. **Apply Filters**  
   - Tick any of **Gluten‑Free**, **High‑Protein**, or **Quick Meals** to narrow results.
3. **Search Recipes**  
   - Click **Search Recipes** to fetch custom vegan recipes.
4. **Browse Cards**  
   - Scroll a responsive grid of recipe cards showing image, title, and a short snippet.
5. **View Details**  
   - Click **View Recipes** on any card to open a modal with full recipe info.
6. **Save Favorites**  
   - Click the star icon (☆/★) to toggle favorites, which appear in their own grid.

### Wireframes
![Wireframe 1](assets/wireframe1.png)  
*Initial layout with ingredient input, filters, and buttons.*  

![Wireframe 2](assets/wireframe2.png)  
*Recipe card grid and modal design.*  

---

## Development Process
1. **Initial Setup**  
   Created base HTML, CSS, and JavaScript scaffolding; set up GitHub repo.  
2. **Ingredient Tag & Filter System**  
   Built dynamic ingredient‑tag component and filter checkboxes.  
3. **API Integration**  
   Integrated Spoonacular’s `complexSearch` endpoint with `diet=vegan` and added filter parameters.  
4. **Recipe Card Layout**  
   Designed a responsive CSS Grid of recipe cards, each with an image, title, and truncated summary.  
5. **Favorites Functionality**  
   Added a star toggle to save favorites, displayed in a separate responsive grid.  
6. **Full Recipe Modal**  
   Implemented a modal that fetches and shows full recipe details (image, summary, instructions).  
7. **Summary Shortening**  
   Added helper functions to strip HTML and shorten long summaries for improved readability.  

---

## Technologies Used
- **HTML5, CSS3, JavaScript** – Core front‑end stack  
- **Spoonacular API** – Recipe data (endpoints: `complexSearch`, `information`)  
- **CSS Grid & Flexbox** – Layout and responsive design  
- **Git & GitHub** – Version control and hosting  
- **Live Server (VS Code Extension)** – Local development preview  
- **W3C Validators** – HTML/CSS validation  
- **Chrome DevTools** – Debugging and responsiveness testing  

---

## Bug Fixes
### Bug: API Fetch Failing Initially
- **Description:**  
  First fetch attempt failed because our script ran before the DOM was ready and the results container wasn’t defined.  
- **Impact:**  
  No recipes displayed on search, blocking API integration testing.  
- **Resolution:**  
  Wrapped all DOM queries and event listeners inside a `DOMContentLoaded` handler and ensured `resultsContainer` is correctly selected.  
- **Status:**  
  Fixed in commit `feat: Integrate Spoonacular API with real data and wrap code in DOMContentLoaded`.

---
