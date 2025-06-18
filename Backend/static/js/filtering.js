document.addEventListener('DOMContentLoaded', () => {
    const brandFilter = document.getElementById('brandFilter');
    const modelFilter = document.getElementById('modelFilter');
    const styleFilter = document.getElementById('styleFilter');
    const priceFilter = document.getElementById('priceFilter');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const productList = document.getElementById('product-list');

    let allProducts = [];
    let filteredProducts = [];
   


    // Utility: get unique sorted values by key from products
    function getUniqueValues(products, key) {
        return [...new Set(products.map(p => p[key]))].sort();
    }

    // Populate select options dynamically, keeping first option (placeholder)
    function populateFilterOptions(selectEl, options) {
        // Remove all except first placeholder option
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

    // Fetch your product data JSON (adjust path if different)
    async function fetchProducts() {
        try {
            const res = await fetch('/api/products');
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            allProducts = await res.json();

            // Initialize brand filter on load and enable it
            const brands = getUniqueValues(allProducts, 'brand');
            populateFilterOptions(brandFilter, brands);
            brandFilter.disabled = false;

            // Reset and disable model and style filters initially
            modelFilter.value = '';
            styleFilter.value = '';
            modelFilter.disabled = true;
            styleFilter.disabled = true;

            filteredProducts = allProducts; // initially no filters applied
            renderProducts(filteredProducts);
        } catch (err) {
            console.error('Failed to load products:', err);
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
        // If only style is selected, leave modelSource as allProducts

        const models = getUniqueValues(modelSource, 'model');
        populateFilterOptions(modelFilter, models);
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
        // If none selected, keep all styles

        const styles = getUniqueValues(styleSource, 'style');
        populateFilterOptions(styleFilter, styles);
        styleFilter.disabled = styles.length === 0;
    }

    // Filter products based on all filter selections including price
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
                result = result.filter(p => p.price > 150);
            } else {
                const [min, max] = price.split('-').map(Number);
                result = result.filter(p => p.price >= min && p.price <= max);
            }
        }

        return result;
    }

    // Basic product rendering to #product-list (you can expand)
    function renderProducts(products) {
        const container = document.getElementById('product-list');
        container.innerHTML = ''; // Clear existing content

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

    // Event listeners
    brandFilter.addEventListener('change', () => {
        modelFilter.value = '';
        styleFilter.value = '';
        updateDependentFilters();
    });

    modelFilter.addEventListener('change', () => {
        styleFilter.value = '';
        updateDependentFilters();
    });

    styleFilter.addEventListener('change', () => {
        // No further dependent filters after style
    });

    applyFiltersBtn.addEventListener('click', () => {
        filteredProducts = filterProducts();
        renderProducts(filteredProducts);
        // Optionally close offcanvas here:
        const offcanvasEl = document.getElementById('filterSidebar');
        const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
        offcanvas.hide();
    });

    // Initialize filters and products on page load
    fetchProducts();
});