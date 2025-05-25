import { products, displayProducts, filterByCategory } from './productslisting.js';

document.addEventListener("DOMContentLoaded", () => {
    // Optional: Display all products on load
    displayProducts(products);

    // Handle category button clicks
    document.querySelectorAll(".filter-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const category = button.getAttribute("data-filter");
            const filtered = filterByCategory(category);
            displayProducts(filtered);
        });
    });
});

