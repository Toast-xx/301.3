let currentIndex = 0;
const itemsPerPage = 6;
let allProducts = [];
let filteredProducts = [];
let selectedCategory = '';
let brandFilter, modelFilter, styleFilter, priceFilter, genderFilter, applyFiltersBtn;

// Utility: get unique sorted values by key from products
function getUniqueValues(products, key) {
    return [...new Set(products.map(p => p[key]).filter(Boolean))].sort();
}

// Helper: check if a product is on sale today
function isOnSale(product) {
    if (!product.sale_price || !product.sale_start_date || !product.sale_end_date) return false;
    const today = new Date();
    const start = new Date(product.sale_start_date);
    const end = new Date(product.sale_end_date);
    return start <= today && today <= end;
}

// Helper: check if a product is a new arrival (added within last 30 days)
function isNewArrival(product) {
    if (!product.date_added) return false;
    const today = new Date();
    const added = new Date(product.date_added);
    const diffDays = (today - added) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
}

// Populate select options dynamically, always keeping placeholder and restoring selection
function populateFilterOptions(selectEl, options, placeholderText = null, selectedValue = null) {
    // Remove all options
    selectEl.innerHTML = '';
    // Add placeholder if provided
    if (placeholderText) {
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = placeholderText;
        selectEl.appendChild(placeholder);
    }
    options.forEach(opt => {
        const optionEl = document.createElement('option');
        optionEl.value = opt;
        optionEl.textContent = opt;
        selectEl.appendChild(optionEl);
    });
    // Restore selection if possible
    if (selectedValue && Array.from(selectEl.options).some(o => o.value === selectedValue)) {
        selectEl.value = selectedValue;
    } else {
        selectEl.value = '';
    }
}

// Fetch product data from API
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to load products from DB');
        allProducts = await response.json();

        // Initialize brand filter on load and enable it
        const brands = getUniqueValues(allProducts, 'brand');
        populateFilterOptions(brandFilter, brands, 'All Brands', brandFilter.value);
        brandFilter.disabled = false;

        // Reset and disable model and style filters initially
        populateFilterOptions(modelFilter, [], 'All Models', '');
        populateFilterOptions(styleFilter, [], 'All Styles', '');
        modelFilter.disabled = true;
        styleFilter.disabled = true;

        // Apply filters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const urlBrand = urlParams.get("brand");
        const urlStyle = urlParams.get("style");
        const urlCategory = urlParams.get('category');
        filteredProducts = allProducts;

        if (urlBrand) {
            brandFilter.value = urlBrand;
            filteredProducts = filteredProducts.filter(p => p.brand.toLowerCase() === urlBrand.toLowerCase());
            updateDependentFilters();
        }
        if (urlStyle) {
            styleFilter.value = urlStyle;
            filteredProducts = filteredProducts.filter(p => p.style.toLowerCase() === urlStyle.toLowerCase());
            updateDependentFilters();
        }
        if (urlCategory) {
            selectedCategory = urlCategory.toLowerCase();
            filteredProducts = filteredProducts.filter(p =>
                p.category && p.category.toLowerCase() === selectedCategory
            );
        }

        // Initial display
        currentIndex = 0;
        showOrHideLoadMore();
        displayNextProductsChunk(true);

    } catch (err) {
        console.error(err);
        document.getElementById('product-list').innerHTML = '<p class="text-danger">Failed to load products.</p>';
    }
}

// Update model and style filters depending on current selections
function updateDependentFilters() {
    const selectedBrand = brandFilter.value;
    const selectedModel = modelFilter.value;
    const selectedStyle = styleFilter.value;

    // === MODEL OPTIONS ===
    let modelSource = allProducts;
    if (selectedBrand && selectedStyle) {
        modelSource = allProducts.filter(p => p.brand === selectedBrand && p.style === selectedStyle);
    } else if (selectedBrand) {
        modelSource = allProducts.filter(p => p.brand === selectedBrand);
    }
    const models = getUniqueValues(modelSource, 'model');
    populateFilterOptions(modelFilter, models, 'All Models', selectedModel);
    modelFilter.disabled = models.length === 0;

    // === STYLE OPTIONS ===
    let styleSource = allProducts;
    if (selectedBrand && selectedModel) {
        styleSource = allProducts.filter(p => p.brand === selectedBrand && p.model === selectedModel);
    } else if (selectedBrand) {
        styleSource = allProducts.filter(p => p.brand === selectedBrand);
    } else if (selectedModel) {
        styleSource = allProducts.filter(p => p.model === selectedModel);
    }
    const styles = getUniqueValues(styleSource, 'style');
    populateFilterOptions(styleFilter, styles, 'All Styles', selectedStyle);
    styleFilter.disabled = styles.length === 0;
}

// Filter products based on all filter selections including price, gender, and category
function filterProducts() {
    let result = allProducts;

    const brand = brandFilter.value;
    const model = modelFilter.value;
    const style = styleFilter.value;
    const price = priceFilter.value;
    const gender = genderFilter ? genderFilter.value : '';

    if (selectedCategory && selectedCategory !== 'sale') {
        result = result.filter(p => p.category && p.category.toLowerCase() === selectedCategory);
    }
    if (selectedCategory === 'sale') {
        result = result.filter(isOnSale);
    }
    if (brand) result = result.filter(p => p.brand === brand);
    if (model) result = result.filter(p => p.model === model);
    if (style) result = result.filter(p => p.style === style);
    if (gender) result = result.filter(p => p.gender && p.gender === gender);

    if (price) {
        if (price === '150+') {
            result = result.filter(p => p.price > 150);
        } else {
            const [min, max] = price.split('-').map(Number);
            result = result.filter(p => p.price >= min && p.price <= max);
        }
    }

    return result;
}

// Product rendering to #product-list
function displayProducts(products, append = false) {
    const container = document.getElementById('product-list');
    if (!append) container.innerHTML = '';

    if (products.length === 0 && !append) {
        container.innerHTML = '<p class="text-center">No products found.</p>';
        return;
    }

    products.forEach(product => {
        const productURL = `/product.html?id=${product.id}`;
        const onSale = isOnSale(product);
        const isNew = isNewArrival(product);

        // Badges
        let badgeHTML = '';
        if (onSale) {
            badgeHTML = `<span class="badge bg-danger position-absolute top-0 start-0 m-2" style="z-index:2;">SALE</span>`;
        } else if (isNew) {
            badgeHTML = `<span class="badge bg-success position-absolute top-0 start-0 m-2" style="z-index:2;">NEW</span>`;
        }

        const priceHTML = onSale
            ? `<span class="text-danger fw-bold">NZD $${parseFloat(product.sale_price).toFixed(2)}</span>
               <span class="text-muted text-decoration-line-through ms-2">NZD $${parseFloat(product.price).toFixed(2)}</span>`
            : `<span class="fw-bold">NZD $${parseFloat(product.price).toFixed(2)}</span>`;

        const productHTML = `
          <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
            <div class="card h-100 shadow-sm position-relative">
              ${badgeHTML}
              <a href="${productURL}" class="text-decoration-none text-dark">
                <img src="${product.image_url || product.image}" class="card-img-top" alt="${product.model || product.name}" style="height: 250px; object-fit: cover;" />
                <div class="card-body d-flex flex-column">
                  <h5 class="card-title">${product.brand} ${product.model || product.name}</h5>
                  <p class="card-text mb-1">${priceHTML}</p>
                </div>
              </a>
              <div class="card-footer bg-transparent border-0"></div>
            </div>
          </div>
        `;
        container.insertAdjacentHTML('beforeend', productHTML);
    });
}

function displayNextProductsChunk(reset = false) {
    if (reset) {
        document.getElementById('product-list').innerHTML = '';
        currentIndex = 0;
    }
    const nextProducts = filteredProducts.slice(currentIndex, currentIndex + itemsPerPage);
    displayProducts(nextProducts, true);
    currentIndex += itemsPerPage;
    showOrHideLoadMore();
}

function showOrHideLoadMore() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (!loadMoreBtn) return;
    if (currentIndex >= filteredProducts.length) {
        loadMoreBtn.style.display = 'none';
    } else if (filteredProducts.length > itemsPerPage) {
        loadMoreBtn.style.display = 'block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

// Initial page setup
window.addEventListener('DOMContentLoaded', () => {
    // Get filter elements
    brandFilter = document.getElementById('brandFilter');
    modelFilter = document.getElementById('modelFilter');
    styleFilter = document.getElementById('styleFilter');
    priceFilter = document.getElementById('priceFilter');
    genderFilter = document.getElementById('genderFilter'); // Optional, if present
    applyFiltersBtn = document.getElementById('applyFiltersBtn');

    fetchProducts();

    // Bind "Load More" button
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => displayNextProductsChunk());
    }

    // Bind category filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            selectedCategory = btn.getAttribute('data-filter').toLowerCase();

            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Reset sidebar filters
            brandFilter.value = '';
            modelFilter.value = '';
            styleFilter.value = '';
            priceFilter.value = '';
            if (genderFilter) genderFilter.value = '';
            updateDependentFilters();

            filteredProducts = filterProducts();
            displayNextProductsChunk(true);
        });
    });

    // Sidebar filter event listeners
    if (brandFilter) {
        brandFilter.addEventListener('change', () => {
            modelFilter.value = '';
            styleFilter.value = '';
            updateDependentFilters();
            // Live filtering on brand change
            filteredProducts = filterProducts();
            displayNextProductsChunk(true);
        });
    }
    if (modelFilter) {
        modelFilter.addEventListener('change', () => {
            styleFilter.value = '';
            updateDependentFilters();
            // Live filtering on model change
            filteredProducts = filterProducts();
            displayNextProductsChunk(true);
        });
    }
    if (styleFilter) {
        styleFilter.addEventListener('change', () => {
            // Live filtering on style change
            filteredProducts = filterProducts();
            displayNextProductsChunk(true);
        });
    }
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            filteredProducts = filterProducts();
            displayNextProductsChunk(true);
            // Optionally close offcanvas here:
            const offcanvasEl = document.getElementById('filterSidebar');
            if (window.bootstrap && offcanvasEl) {
                const offcanvas = window.bootstrap.Offcanvas.getInstance(offcanvasEl);
                if (offcanvas) offcanvas.hide();
            }
        });
    }
    if (genderFilter) {
        genderFilter.addEventListener('change', () => {
            // Optionally update products live on gender change
            // filteredProducts = filterProducts();
            // displayNextProductsChunk(true);
        });
    }
});