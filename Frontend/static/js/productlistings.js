

// Uncomment below to load products from Flask template variable (when Flask renders the page):
// products = {{ products|tojson|safe }};

const staticProducts = [
    { title: "Nike Air Force 1", brand: "Nike", model: "Air Force 1", style: "Lifestyle Shoes", price: 200, category: "men", sizes: [6, 7, 8, 9, 10, 11, 12, 13, 14], image: "https://images.footlocker.com/is/image/FLEU/245345564602_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "Nike Pegasus 41", brand: "Nike", model: "Pegasus 41", style: "Running Shoes", price: 210, category: "men", sizes: [6, 7, 8, 9, 10, 11, 12], image: "https://images.footlocker.com/is/image/FLEU/244209668904_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "Adidas Stan Smith", brand: "Adidas", model: "Stan Smith", style: "Lifestyle Shoes", price: 110, category: "kids", sizes: [5, 6, 7, 8, 9, 10], image: "https://images.footlocker.com/is/image/FLEU/316475371304_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "Vans Authentic", brand: "Vans", model: "Authentic", style: "Skate Shoes", price: 109.99, category: "women", sizes: [5, 6, 7, 8, 9, 10], image: "https://media.hypedc.com/cdn-cgi/image/fit=scale-down,f=auto,w=1280/products/34bd8bd4/vn-0ee3blk_blk_01.jpg" },
    { title: "Etnies Marana", brand: "Etnies", model: "Marana", style: "Skate Shoes", price: 127.99, category: "men", sizes: [6, 7, 8, 9, 10, 11], image: "https://cdn2.n2erp.co.nz/hyp_19sj232-ask2-dfk2-am29-89fkl348fd/images/products/xlarge/d2661f264d044332a2cf_1sgmojtc.sim.webp" },
    { title: "DC Court Graffik", brand: "DC", model: "Court Graffik", style: "Skate Shoes", price: 114.99, category: "men", sizes: [7, 8, 9, 10, 11], image: "https://cdn2.n2erp.co.nz/hyp_19sj232-ask2-dfk2-am29-89fkl348fd/images/products/xlarge/dcshoes0008300927xkg_v15lxmiz.tfu.jpg" },
    { title: "New Balance 574", brand: "New Balance", model: "574", style: "Running Shoes", price: 170, category: "men", sizes: [7, 8, 9, 10, 11, 12, 13], image: "https://images.footlocker.com/is/image/FLEU/245240893502_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "Converse Chuck Taylor All Star Top", brand: "Converse", model: "Chuck Taylor All Star Top", style: "Lifestyle Shoes", price: 130, category: "men", sizes: [6, 7, 8, 9, 10, 11], image: "https://images.footlocker.com/is/image/FLEU/285550062702_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "Puma RS-X DRIFT PRM", brand: "Puma", model: "RS-X DRIFT PRM", style: "Lifestyle Shoes", price: 220, category: "men", sizes: [7, 8, 9, 10, 11, 12], image: "https://images.footlocker.com/is/image/FLEU/244205134604_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "Reebok Classic Leather", brand: "Reebok", model: "Classic Leather", style: "Lifestyle Shoes", price: 170, category: "men", sizes: [7, 8, 9, 10, 11, 12], image: "https://media.hypedc.com/cdn-cgi/image/fit=scale-down,f=auto,w=1024/products/d3682d6e-e7cd-4a8e-95c9-a318175e19cd/gy0952_1_footwear_photography_side-lateral-center-view_white.jpg" },
 
];

// Declare 'products' here, so all code below can use it
let products = [];  // Will hold all products (from Flask or fallback)

const pageSize = 6;  // Number of products per page  
let currentPage = 1;  // Current page number
let filteredProducts = []; // Will hold filtered results
// Full product list, load from backend when flask integrated 
let currentCategory = null;  // Track currently selected category filter (null means no category filter)

// Fetch product data from backend API, fallback to staticProducts if fail
async function loadProducts() {
    // Commenting out Flask API fetch until backend is ready
    /*
    try {
        const response = await fetch('/api/products');  // Flask endpoint expected to return JSON array
        if (!response.ok) throw new Error('Network response was not ok');
        products = await response.json();

        // Ensure products is an array
        if (!Array.isArray(products)) throw new Error('Invalid data format');
    } catch (error) {
        console.error('Failed to load products, using static data:', error);
        products = staticProducts;  // Fallback
    }
    */

    // Directly use static product data
    products = staticProducts;
    filteredProducts = products;
    displayProducts(filteredProducts, currentPage);
}


// Function to display products inside #product-list container with pagination
function displayProducts(productList, page = 1) {
    const container = document.getElementById('product-list');
    container.innerHTML = ''; // Clear current products

    if (productList.length === 0) {
        container.innerHTML = '<p class="text-center">No products match the filter criteria.</p>';
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = productList.slice(startIndex, endIndex);

    paginatedProducts.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('col-md-4', 'mb-4', 'product-card');

        card.setAttribute('data-category', product.category.toLowerCase());
        if (product.onsale) {
            card.setAttribute('data-onsale', 'true');
        }

        card.innerHTML = `
            <div class="card h-100">
                <img src="${product.image}" class="card-img-top" alt="${product.model}">
                <div class="card-body">
                    <h5 class="card-title">${product.brand} - ${product.model}</h5>
                    <p class="card-text">${product.style}</p>
                    <p class="card-text fw-bold">$${product.price}</p>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    renderPagination(productList.length, page);
}
window.addEventListener('DOMContentLoaded', () => {
    currentCategory = null;
    loadProducts();
});
document.getElementById('category-filter').addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        const selectedCategory = e.target.getAttribute('data-category');
        currentCategory = selectedCategory === 'all' ? null : selectedCategory;

        // Apply category filter
        if (currentCategory) {
            filteredProducts = products.filter(product => product.category.toLowerCase() === currentCategory);
        } else {
            filteredProducts = products;
        }

        currentPage = 1;
        displayProducts(filteredProducts, currentPage);
    }
});
// Function to render pagination buttons
function renderPagination(totalItems, page) {
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return; // No pagination needed

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Prev';
    prevBtn.disabled = page === 1;
    prevBtn.classList.add('btn', 'btn-secondary', 'me-2');
    prevBtn.addEventListener('click', () => {
        if (page > 1) {
            currentPage = page - 1;
            displayProducts(filteredProducts, currentPage);
        }
    });
    paginationContainer.appendChild(prevBtn);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.classList.add('btn', 'me-1');
        if (i === page) pageBtn.classList.add('btn-primary');
        else pageBtn.classList.add('btn-outline-primary');

        pageBtn.addEventListener('click', () => {
            currentPage = i;
            displayProducts(filteredProducts, currentPage);
        });
        paginationContainer.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.disabled = page === totalPages;
    nextBtn.classList.add('btn', 'btn-secondary', 'ms-2');
    nextBtn.addEventListener('click', () => {
        if (page < totalPages) {
            currentPage = page + 1;
            displayProducts(filteredProducts, currentPage);
        }
    });
    paginationContainer.appendChild(nextBtn);
}
// Initial load of products on page load
window.addEventListener('DOMContentLoaded', () => {
    currentCategory = null;
    loadProducts();
});
// Load filter sidebar dynamically
fetch("filter-sidebar.html")
    .then(res => res.text())
    .then(data => {
        document.getElementById("filter-container").innerHTML = data;
    })
    .catch(err => console.error("Error loading sidebar:", err));

