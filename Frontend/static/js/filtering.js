
function applyFilters() {
    const brand = document.getElementById('brandFilter').value.trim();
    const model = document.getElementById('modelFilter').value.trim();
    const style = document.getElementById('styleFilter').value.trim();
    const priceRange = document.getElementById('priceFilter').value;

    filteredProducts = products.filter(product => {
        let match = true;

        // Category filtering
        if (currentCategory && currentCategory !== 'all') {
            if (currentCategory === 'sale') {
                if (!product.onsale) match = false;
            } else if (product.category.toLowerCase() !== currentCategory) {
                match = true;
            }
        }

        if (brand && product.brand !== brand) match = false;
        if (model && product.model !== model) match = false;
        if (style && product.style !== style) match = false;

        if (priceRange) {
            if (priceRange === "150+" && product.price <= 150) match = false;
            else {
                const [min, max] = priceRange.split('-');
                if (max) {
                    if (product.price < +min || product.price > +max) match = false;
                } else {
                    if (product.price < +min) match = false;
                }
            }
        }

        return match;
    });

    currentPage = 1; // Reset to first page when filters applied
    displayProducts(filteredProducts, currentPage);
}


// Event listener for "Apply Filters" button
document.querySelector('.btn-primary.w-100').addEventListener('click', e => {
    e.preventDefault(); // Prevent form submit if inside a form
    applyFilters();
});

document.querySelectorAll('.brand-option').forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();
        const selectedBrand = this.getAttribute('data-brand');
        document.getElementById('brandFilter').value = selectedBrand;

        // Update dependent dropdowns (if brandData defined)
        if (brandData[selectedBrand]) {
            updateDropdown('modelFilter', brandData[selectedBrand].models);
            updateDropdown('styleFilter', brandData[selectedBrand].styles);
        } else {
            updateDropdown('modelFilter', []);
            updateDropdown('styleFilter', []);
        }

        applyFilters();
    });
});

document.querySelectorAll('.style-option').forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();
        const selectedStyle = this.getAttribute('data-style');
        document.getElementById('styleFilter').value = selectedStyle;
        applyFilters();
    });
});

document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', e => {
        e.preventDefault();
        currentCategory = button.dataset.filter.toLowerCase();

        // Highlight active category button
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        applyFilters();
    });
});

let brandData = {
    "Nike": {
        models: ["Air Force 1", "Air Max 90", "Air Max 95", "Air Jordan", "Dunk", "Pegasus"],
        styles: ["Sneakers", "Running Shoes", "Basketball Shoes", "Lifestyle Shoes"]
    },
    "Adidas": {
        models: ["Samba", "Gazelle", "Stan Smith", "Ultraboost"],
        styles: ["Sneakers", "Running Shoes", "Training Shoes"]
    },
    "Vans": {
        models: ["Old Skool", "Authentic", "Sk8-Hi", "Slip-On"],
        styles: ["Skate Shoes", "High Tops", "Slip-Ons"]
    },
    "Etnies": {
        models: ["Marana", "Jameson", "Scout"],
        styles: ["Skate Shoes", "Lifestyle Shoes"]
    },
    "DC Shoes": {
        models: ["Court Graffik", "Lynx OG", "Manteca"],
        styles: ["Skate Shoes", "Casual Sneakers"]
    },
    "New Balance": {
        models: ["574", "990", "9060"],
        styles: ["Running Shoes", "Lifestyle Sneakers"]
    },
    "Converse": {
        models: ["Chuck Taylor All Star", "Chuck 70", "One Star"],
        styles: ["High Tops", "Low Tops", "Slip-Ons"]
    },
    "Puma": {
        models: ["Suede Classic", "RS-X", "Clyde"],
        styles: ["Running Shoes", "Lifestyle Shoes"]
    },
    "Reebok": {
        models: ["Classic Leather", "Club C", "Nano"],
        styles: ["Running Shoes", "Lifestyle Sneakers"]
    }
};

function applyFilters() {
    const brand = document.getElementById('brandFilter').value.trim();
    const model = document.getElementById('modelFilter').value.trim();
    const style = document.getElementById('styleFilter').value.trim();
    const priceRange = document.getElementById('priceFilter').value;

    filteredProducts = products.filter(product => {
        let match = true;

        if (currentCategory && currentCategory !== 'all') {
            if (currentCategory === 'sale') {
                if (!product.onsale) match = false;
            } else if (product.category.toLowerCase() !== currentCategory) {
                match = false;
            }
        }

        if (brand && product.brand !== brand) match = false;
        if (model && product.model !== model) match = false;
        if (style && product.style !== style) match = false;

        if (priceRange) {
            if (priceRange === "150+" && product.price <= 150) match = false;
            else {
                const [min, max] = priceRange.split('-');
                if (max) {
                    if (product.price < +min || product.price > +max) match = false;
                } else {
                    if (product.price < +min) match = false;
                }
            }
        }

        return match;
    });

    currentPage = 1;
    displayProducts(filteredProducts, currentPage);
}

document.querySelector('.btn-primary.w-100').addEventListener('click', e => {
    e.preventDefault();
    applyFilters();
});

document.querySelectorAll('.brand-option').forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();
        const selectedBrand = this.getAttribute('data-brand');
        document.getElementById('brandFilter').value = selectedBrand;

        if (brandData[selectedBrand]) {
            updateDropdown('modelFilter', brandData[selectedBrand].models);
            updateDropdown('styleFilter', brandData[selectedBrand].styles);
        } else {
            updateDropdown('modelFilter', []);
            updateDropdown('styleFilter', []);
        }

        applyFilters();
    });
});

document.querySelectorAll('.style-option').forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();
        const selectedStyle = this.getAttribute('data-style');
        document.getElementById('styleFilter').value = selectedStyle;
        applyFilters();
    });
});

document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', e => {
        e.preventDefault();
        currentCategory = button.dataset.filter.toLowerCase();

        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        applyFilters();
    });
});

document.addEventListener('DOMContentLoaded', function () {
    function updateDropdown(selectId, options) {
        const select = document.getElementById(selectId);
        select.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = `All ${selectId.replace('Filter', '')}s`;
        select.appendChild(defaultOption);

        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            select.appendChild(opt);
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const brand = urlParams.get("brand");
    const model = urlParams.get("model");
    const style = urlParams.get("style");
    const price = urlParams.get("price");
    const category = urlParams.get("category");

    if (brand) {
        document.getElementById('brandFilter').value = brand;
        if (brandData[brand]) {
            updateDropdown('modelFilter', brandData[brand].models);
            updateDropdown('styleFilter', brandData[brand].styles);
        }
    }

    if (model) {
        const brandForModel = document.getElementById('brandFilter').value;
        if (brandForModel && brandData[brandForModel]) {
            updateDropdown('modelFilter', brandData[brandForModel].models);
        }
        document.getElementById('modelFilter').value = model;
    }

    if (style) {
        const brandForStyle = document.getElementById('brandFilter').value;
        if (brandForStyle && brandData[brandForStyle]) {
            updateDropdown('styleFilter', brandData[brandForStyle].styles);
        }
        document.getElementById('styleFilter').value = style;
    }

    if (price) {
        document.getElementById('priceFilter').value = price;
    }

    if (category) {
        currentCategory = category.toLowerCase();
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter.toLowerCase() === currentCategory);
        });
    }

    document.getElementById('brandFilter').addEventListener('change', function () {
        const selectedBrand = this.value;
        if (selectedBrand && brandData[selectedBrand]) {
            updateDropdown('modelFilter', brandData[selectedBrand].models);
            updateDropdown('styleFilter', brandData[selectedBrand].styles);
        } else {
            updateDropdown('modelFilter', []);
            updateDropdown('styleFilter', []);
        }
        applyFilters();
    });

    document.getElementById('modelFilter').addEventListener('change', applyFilters);
    document.getElementById('styleFilter').addEventListener('change', applyFilters);

    if (!brand) {
        updateDropdown('modelFilter', []);
        updateDropdown('styleFilter', []);
    }

    applyFilters();
});
