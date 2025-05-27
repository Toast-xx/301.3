console.log('home.js loaded');
import { fetchProducts } from './productlistings.js';


async function loadFeaturedProducts() {
    console.log('Loading featured products...');
    try {
        const response = await fetch('/static/data/products.json');
        if (!response.ok) throw new Error('Failed to load products JSON');

        const allProducts = await response.json();
        console.log('All products loaded:', allProducts.length);

        const featuredProducts = allProducts.filter(p => p.featured);
        console.log('Featured products:', featuredProducts.length);

        displayFeaturedProducts(featuredProducts);
    } catch (err) {
        console.error(err);
        const container = document.getElementById('featured-products-container');
        if (container) {
            container.innerHTML = '<p class="text-danger">Failed to load featured products.</p>';
        }
    }
}


function displayFeaturedProducts(products) {
    const container = document.getElementById('featured-products-container');
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p class="text-center">No featured products found.</p>';
        return;
    }

    products.forEach(product => {
        const productHTML = `
          <div class="col-12 col-sm-6 col-md-4 mb-4">
            <div class="card h-100 shadow-sm">
              <img src="${product.image}" class="card-img-top" alt="${product.model}" />
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${product.brand} ${product.model}</h5>
                <p class="card-text fw-bold">$${product.price}</p>
                <button class="btn btn-light border mt-auto">Add to Cart</button>
              </div>
            </div>
          </div>
        `;
        container.insertAdjacentHTML('beforeend', productHTML);
    });
}


window.addEventListener('DOMContentLoaded', loadFeaturedProducts);
