let currentIndex = 0;
const itemsPerPage = 6;
let allProducts = [];
let filteredProducts = [];
let selectedCategory = '';

export async function fetchProducts() {
    try {
        /* // --- JSON fetch (active for now)
        const response = await fetch('static/data/products.json');
        if (!response.ok) throw new Error('Failed to load products JSON');

        allProducts = await response.json(); */

        // Fetch products from the database
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to load products from DB');

        allProducts = await response.json();

        // Apply filters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const brandFilter = urlParams.get("brand");
        const styleFilter = urlParams.get("style");
        const categoryFilter = urlParams.get('category');
        filteredProducts = allProducts;

        if (brandFilter) {
            filteredProducts = filteredProducts.filter(p => p.brand.toLowerCase() === brandFilter.toLowerCase());
        }

        if (styleFilter) {
            filteredProducts = filteredProducts.filter(p => p.style.toLowerCase() === styleFilter.toLowerCase());
        }

        if (categoryFilter) {
            filteredProducts = filteredProducts.filter(p =>
                p.category && p.category.toLowerCase() === categoryFilter.toLowerCase()
            );
        }

        // Initial display
        currentIndex = 0;
        document.getElementById('load-more-btn').style.display = 'block';
        displayNextProductsChunk();

    } catch (err) {
        console.error(err);
        document.getElementById('product-list').innerHTML = '<p class="text-danger">Failed to load products.</p>';
    }
}

function displayProducts(products, append = false) {
    const container = document.getElementById('product-list');
    if (!append) container.innerHTML = '';

    if (products.length === 0 && !append) {
        container.innerHTML = '<p class="text-center">No products found.</p>';
        return;
    }

    products.forEach(product => {
        const productURL = `/product.html?id=${product.id}`;
        const productHTML = `
          <div class="col-12 col-sm-6 col-md-4 mb-4">
            <a href="${productURL}" class="text-decoration-none text-dark">
              <div class="card h-100 shadow-sm">
                <img src="${product.image}" class="card-img-top" alt="${product.model}" />
                <div class="card-body d-flex flex-column">
                  <h5 class="card-title">${product.brand} ${product.model}</h5>
                  <p class="card-text fw-bold">$${product.price}</p>
                  </div>
              </div>
            </a>
          </div>
        `;
        container.insertAdjacentHTML('beforeend', productHTML);
    });
}

function displayNextProductsChunk() {
    const nextProducts = filteredProducts.slice(currentIndex, currentIndex + itemsPerPage);
    displayProducts(nextProducts, true);
    currentIndex += itemsPerPage;

    if (currentIndex >= filteredProducts.length) {
        document.getElementById('load-more-btn').style.display = 'none';
    }
}

// Initial page setup
window.addEventListener('DOMContentLoaded', () => {
    fetchProducts();

    // Bind "Load More" button
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', displayNextProductsChunk);
    }

    // Bind category filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            selectedCategory = btn.getAttribute('data-filter').toLowerCase();

            filteredProducts = allProducts.filter(p =>
                p.category && p.category.toLowerCase() === selectedCategory
            );

            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentIndex = 0;
            document.getElementById('product-list').innerHTML = '';
            document.getElementById('load-more-btn').style.display = 'block';
            displayNextProductsChunk();
        });
    });
});

