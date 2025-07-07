document.addEventListener('DOMContentLoaded', () => {
    // Get references to filter controls and product list container
    const brandFilter = document.getElementById('brandFilter');
    const modelFilter = document.getElementById('modelFilter');
    const styleFilter = document.getElementById('styleFilter');
    const priceFilter = document.getElementById('priceFilter');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const productList = document.getElementById('product-list');

    let allProducts = [];      // Holds all products fetched from the backend
    let filteredProducts = []; // Holds products after applying filters

    // Utility: Get unique, sorted values for a given key from a product array
    function getUniqueValues(products, key) {
        return [...new Set(products.map(p => p[key]))].sort();
    }

    // Populate a <select> element with options, keeping the first placeholder option
    function populateFilterOptions(selectEl, options) {
        // Remove all except the first (placeholder) option
        while (selectEl.options.length > 1) {
            selectEl.remove(1);
        }
        options.forEach(opt => {
            const optionEl = document.createElement('option');
            optionEl.value = opt;
            optionEl.textContent = opt;
            selectEl.appendChild(optionEl);
        });
    }

    // Fetch product data from the backend and initialize filters
    async function fetchProducts() {
        try {
            const res = await fetch('/api/products');
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            allProducts = await res.json();

            // Populate brand filter and enable it
            const brands = getUniqueValues(allProducts, 'brand');
            populateFilterOptions(brandFilter, brands);
            brandFilter.disabled = false;

            // Reset and disable model and style filters initially
            modelFilter.value = '';
            styleFilter.value = '';
            modelFilter.disabled = true;
            styleFilter.disabled = true;

            filteredProducts = allProducts; // No filters applied initially
            renderProducts(filteredProducts);
        } catch (err) {
            console.error('Failed to load products:', err);
        }
    }

    // Update model and style filter options based on current selections
    function updateDependentFilters() {
        const selectedBrand = brandFilter.value;
        const selectedModel = modelFilter.value;
        const selectedStyle = styleFilter.value;

        // === MODEL OPTIONS ===
        let modelSource = allProducts;
        if (selectedBrand && selectedStyle) {
            // Filter by both brand and style
            modelSource = allProducts.filter(p => p.brand === selectedBrand && p.style === selectedStyle);
        } else if (selectedBrand) {
            // Filter by brand only
            modelSource = allProducts.filter(p => p.brand === selectedBrand);
        }
        // If only style is selected, use allProducts

        const models = getUniqueValues(modelSource, 'model');
        populateFilterOptions(modelFilter, models);
        modelFilter.disabled = models.length === 0;

        // === STYLE OPTIONS ===
        let styleSource = allProducts;
        if (selectedBrand && selectedModel) {
            // Filter by both brand and model
            styleSource = allProducts.filter(p => p.brand === selectedBrand && p.model === selectedModel);
        } else if (selectedBrand) {
            // Filter by brand only
            styleSource = allProducts.filter(p => p.brand === selectedBrand);
        } else if (selectedModel) {
            // Filter by model only
            styleSource = allProducts.filter(p => p.model === selectedModel);
        }
        // If none selected, use allProducts

        const styles = getUniqueValues(styleSource, 'style');
        populateFilterOptions(styleFilter, styles);
        styleFilter.disabled = styles.length === 0;
    }

    // Filter products based on all selected filter values (brand, model, style, price)
    function filterProducts() {
        let result = allProducts;

        const brand = brandFilter.value;
        const model = modelFilter.value;
        const style = styleFilter.value;
        const price = priceFilter.value;

        if (brand) result = result.filter(p => p.brand === brand);
        if (model) result = result.filter(p => p.model === model);
        if (style) result = result.filter(p => p.style === style);

        if (price) {
            if (price === '150+') {
                // Filter for products over $150
                result = result.filter(p => p.price > 150);
            } else {
                // Filter for products within a price range
                const [min, max] = price.split('-').map(Number);
                result = result.filter(p => p.price >= min && p.price <= max);
            }
        }

        return result;
    }

    // Render the filtered products to the product list container
    function renderProducts(products) {
        const container = document.getElementById('product-list');
        container.innerHTML = ''; // Clear previous content

        if (products.length === 0) {
            container.innerHTML = '<p class="text-center">No products found.</p>';
            return;
        }

        products.forEach(product => {
            const productHTML = `
      <div class="col-12 col-sm-6 col-md-4 mb-4">
        <div class="card h-100 shadow-sm">
          <img src="${product.image_url || product.image}" class="card-img-top" alt="${product.model || product.name}" />
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${product.brand} ${product.model || product.name}</h5>
            <p class="card-text fw-bold">$${product.price.toFixed ? product.price.toFixed(2) : product.price}</p>
            <button class="btn btn-light border mt-auto">Add to Cart</button>
          </div>
        </div>
      </div>
    `;
            container.insertAdjacentHTML('beforeend', productHTML);
        });
    }

    // === Event listeners for filter controls ===

    // When brand changes, reset model and style, and update dependent filters
    brandFilter.addEventListener('change', () => {
        modelFilter.value = '';
        styleFilter.value = '';
        updateDependentFilters();
    });

    // When model changes, reset style, and update dependent filters
    modelFilter.addEventListener('change', () => {
        styleFilter.value = '';
        updateDependentFilters();
    });

    // When style changes, no further dependent filters to update
    styleFilter.addEventListener('change', () => {
        // No action needed
    });

    // When "Apply Filters" is clicked, filter and render products, then close the filter sidebar
    applyFiltersBtn.addEventListener('click', () => {
        filteredProducts = filterProducts();
        renderProducts(filteredProducts);
        // Optionally close the offcanvas sidebar if open
        const offcanvasEl = document.getElementById('filterSidebar');
        const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
        offcanvas.hide();
    });

    // Fetch products and initialize filters on page load
    fetchProducts();
});