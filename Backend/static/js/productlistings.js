let currentPage = 1;
const itemsPerPage = 6;
let allProducts = [];
let filteredProducts = [];       // filtered products after category (and other) filters
let selectedCategory = '';       // current category filter from submenu buttons

export async function fetchProducts() {
    try {
       /* // --- JSON fetch (active for now) 
        const response = await fetch('static/data/products.json');
        if (!response.ok) throw new Error('Failed to load products JSON');

        allProducts = await response.json(); */

        // --- DB fetch (commented out for later) ---
        
        const response = await fetch('/api/products');  // Flask API endpoint here
        if (!response.ok) throw new Error('Failed to load products from DB');

        allProducts = await response.json();
        

        // --- NEW: Get URL filters and apply them ---
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
        if(categoryFilter) {
            filteredProducts = filteredProducts.filter(p =>
                p.category && p.category.toLowerCase() === categoryFilter.toLowerCase()
            );
        }

        // Render results
        renderPaginationControls(filteredProducts.length);
        displayProductsPage(currentPage);
    } catch (err) {
        console.error(err);
        document.getElementById('product-list').innerHTML = '<p class="text-danger">Failed to load products.</p>';
    }
}

function displayProducts(products) {
    const container = document.getElementById('product-list');
    container.innerHTML = ''; // Clear existing content

    if (products.length === 0) {
        container.innerHTML = '<p class="text-center">No products found.</p>';
        return;
    }

     products.forEach(product => {
        const productURL = `/product.html?id=${product.id}`; // Assuming product has an id field

        const productHTML = `
          <div class="col-12 col-sm-6 col-md-4 mb-4">
            <a href="${productURL}" class="text-decoration-none text-dark">
              <div class="card h-100 shadow-sm">
                <img src="${product.image}" class="card-img-top" alt="${product.model}" />
                <div class="card-body d-flex flex-column">
                  <h5 class="card-title">${product.brand} ${product.model}</h5>
                  <p class="card-text fw-bold">$${product.price}</p>
                  <button class="btn btn-light border mt-auto" type="button">Add to Cart</button>
                </div>
              </div>
            </a>
          </div>
        `;
        container.insertAdjacentHTML('beforeend', productHTML);
    });
}
function displayProductsPage(page) {
    currentPage = page;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pagedProducts = filteredProducts.slice(start, end);
    displayProducts(pagedProducts);
    updatePaginationButtons();
}

function renderPaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.getElementById('pagination');
    let buttonsHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        buttonsHTML += `<button class="btn btn-outline-primary mx-1" data-page="${i}">${i}</button>`;
    }

    paginationContainer.innerHTML = buttonsHTML;

    // Add event listeners for page buttons
    paginationContainer.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (e) => {
            const page = Number(e.target.getAttribute('data-page'));
            displayProductsPage(page);
        });
    });
}

function updatePaginationButtons() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.querySelectorAll('button').forEach(button => {
        button.classList.remove('active');
        const page = Number(button.getAttribute('data-page'));
        if (page === currentPage) {
            button.classList.add('active');
        }
    });
}


// --- Initial Load ---
window.addEventListener('DOMContentLoaded', () => {
    fetchProducts();

    // Ensure category filter buttons re-bind
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            selectedCategory = btn.getAttribute('data-filter').toLowerCase();

            filteredProducts = allProducts.filter(p => p.category && p.category.toLowerCase() === selectedCategory);

            const urlParams = new URLSearchParams(window.location.search);
            

            currentPage = 1;
            renderPaginationControls(filteredProducts.length);
            displayProductsPage(currentPage);

            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
});
