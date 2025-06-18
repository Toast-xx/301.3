import { addToCart, setupCartClose } from './cartOverlay.js'; // Import cart overlay functions

document.addEventListener("DOMContentLoaded", () => { // Wait for the DOM to be fully loaded
    const container = document.getElementById("product-list"); // Get the product list container element
    const urlParams = new URLSearchParams(window.location.search); // Parse URL parameters
    const id = urlParams.get('id'); // Get the product id from URL
    let currentProduct = null; // Store the current product object
    let currentVariantKey = null; // Track selected color variant key
    let currentVariant = null;    // Track selected variant object

    if (!id) { // If no product id is present in the URL
        container.innerHTML = "<p class='text-center text-danger'>No product selected.</p>"; // Show error message
        return; // Stop further execution
    }

    fetch(`/api/product/${id}`) // Fetch product data from backend API
        .then(res => { // When response is received
            if (!res.ok) throw new Error("Product not found"); // If response is not ok, throw error
            return res.json(); // Parse response as JSON
        })
        .then(product => { // When product data is available
            currentProduct = product; // Store product data
            renderProduct(product, null, null); // Render the product details
            setupVariantSwatches(product); // Setup color swatches for variants
            renderRelatedProducts && renderRelatedProducts(relatedProducts); // Render related products if function exists
        })
        .catch(err => console.error("Error fetching product:", err)); // Log any errors

    document.addEventListener("click", function (event) { // Listen for click events on the document
        if (event.target.matches(".btn-primary.btn-lg")) { // If the clicked element is the Add to Cart button
            if (!currentProduct) return; // If no product loaded, do nothing
            // Use global window.currentVariantKey/currentVariant to ensure correct color
            const title = document.getElementById("product-title").textContent; // Get product title
            const price = getCurrentDisplayPrice(
                currentProduct,
                window.currentVariantKey,
                window.currentVariant
            ); // Get the correct price (sale or normal)
            const imageSrc = document.getElementById("main-shoe-img").src; // Get main image source
            const sizeBtn = document.querySelector(".size-btn.active"); // Get selected size button
            const size = sizeBtn ? sizeBtn.textContent : null; // Get selected size or null
            const color = window.currentVariantKey || "original"; // Get selected color or default
            addToCart({ id: currentProduct.id, title, price, imageSrc, size, color }); // Add product to cart
        }
    });

    setupCartClose(); // Setup cart overlay close button
});

// Helper: check if a product is on sale today
function isOnSale(product) { // Determine if the product is currently on sale
    if (!product.sale_price || !product.sale_start_date || !product.sale_end_date) return false; // If any sale info missing, not on sale
    const today = new Date(); // Get today's date
    const start = new Date(product.sale_start_date); // Parse sale start date
    const end = new Date(product.sale_end_date); // Parse sale end date
    return start <= today && today <= end; // Return true if today is within sale period
}

// Helper: get the price to use for cart (sale or normal)
function getCurrentDisplayPrice(product, variantKey, variant) { // Get the price to display (sale or normal)
    const sale_price = variant?.sale_price !== undefined ? variant.sale_price : product.sale_price; // Use variant sale price if available
    const sale_start_date = variant?.sale_start_date !== undefined ? variant.sale_start_date : product.sale_start_date; // Use variant sale start date if available
    const sale_end_date = variant?.sale_end_date !== undefined ? variant.sale_end_date : product.sale_end_date; // Use variant sale end date if available
    const price = variant?.price !== undefined ? variant.price : product.price; // Use variant price if available
    const onSale = sale_price && sale_start_date && sale_end_date &&
        (new Date(sale_start_date) <= new Date() && new Date() <= new Date(sale_end_date)); // Check if on sale
    return onSale ? parseFloat(sale_price) : parseFloat(price); // Return sale price if on sale, else normal price
}

function renderProduct(product, variantKey = null, variant = null) { // Render the product details on the page
    const container = document.getElementById("product-list"); // Get the product list container
    const mainImage = variant?.mainImg || product.main_image; // Use variant main image if available
    const gallery = variant?.thumbnails || product.thumbnails; // Use variant gallery if available
    const title = variant?.title || product.title; // Use variant title if available
    const price = variant?.price !== undefined ? variant.price : product.price; // Use variant price if available
    const sale_price = variant?.sale_price !== undefined ? variant.sale_price : product.sale_price; // Use variant sale price if available
    const sale_start_date = variant?.sale_start_date !== undefined ? variant.sale_start_date : product.sale_start_date; // Use variant sale start date if available
    const sale_end_date = variant?.sale_end_date !== undefined ? variant.sale_end_date : product.sale_end_date; // Use variant sale end date if available
    const description = product.description; // Get product description
    const sizes = variant?.sizes || product.sizes; // Use variant sizes if available

    // Sale logic for display
    const onSale = sale_price && sale_start_date && sale_end_date &&
        (new Date(sale_start_date) <= new Date() && new Date() <= new Date(sale_end_date)); // Check if on sale
    const priceHTML = onSale
        ? `<span class="text-danger fw-bold">NZD $${parseFloat(sale_price).toFixed(2)}</span>
           <span class="text-muted text-decoration-line-through ms-2">NZD $${parseFloat(price).toFixed(2)}</span>`
        : `<span class="fw-bold">NZD $${parseFloat(price).toFixed(2)}</span>`; // Format price HTML

    // Show selected color
    let colorDisplay = '';
    if (variantKey && variantKey !== "original") { // If a color variant is selected
        colorDisplay = `<div class="mb-2"><strong>Color:</strong> <span id="selected-color">${capitalize(variantKey)}</span></div>`; // Show selected color
    } else {
        colorDisplay = `<div class="mb-2"><strong>Color:</strong> <span id="selected-color">Default</span></div>`; // Show default color
    }

    container.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <img id="main-shoe-img" src="${mainImage}" class="img-fluid rounded shadow-sm mb-3" alt="${title}" />
                <div id="thumbnails-container" class="d-flex flex-wrap gap-2">
                    ${gallery.map((thumb, i) => {
        const src = variant ? thumb : thumb.src; // Get thumbnail src
        const large = variant ? thumb : thumb.src; // Get large image src
        const alt = variant ? `Variant image ${i + 1}` : (thumb.alt || `${title} thumbnail`); // Get alt text
        return `
                            <img src="${src}" data-large="${large}" class="thumbnail img-thumbnail ${i === 0 ? 'selected' : ''}" 
                                 alt="${alt}" data-index="${i}" 
                                 style="width: 60px; height: 60px; object-fit: cover;" />
                        `;
    }).join('')}
                </div>
            </div>
            <div class="col-md-6">
                <h2 id="product-title">${title}</h2>
                <h4 class="mb-2" id="product-price">${priceHTML}</h4>
                <p class="text-muted" id="product-description">${description}</p>
                ${colorDisplay}
                <label class="form-label">Color:</label>
                <div class="d-flex gap-2 mb-3" id="color-options"></div>
                <h6>Select Size:</h6>
                <div id="sizes-container" class="d-flex flex-wrap gap-2 mb-3">
                    ${sizes.map(size => `
                        <button class="btn btn-outline-dark size-btn">${size}</button>
                    `).join('')}
                </div>
                <div class="d-grid mb-3">
                    <button class="btn btn-primary btn-lg"><i class="bi bi-cart-plus me-2"></i>Add to Cart</button>
                </div>
            </div>
        </div>
    `; // Set the HTML content for the product

    setupThumbnailClicks(product, variant); // Setup thumbnail click events
    setupSizeSelection(); // Setup size selection buttons
    setupVariantSwatches(product, variantKey); // Setup color swatches
}

function setupThumbnailClicks(product, variant = null) { // Setup click events for thumbnails
    const thumbnails = document.querySelectorAll("#thumbnails-container img.thumbnail"); // Get all thumbnail images
    const mainImg = document.getElementById("main-shoe-img"); // Get main image element

    thumbnails.forEach(thumb => { // For each thumbnail
        thumb.addEventListener("click", () => { // Add click event
            thumbnails.forEach(t => t.classList.remove("selected")); // Remove selected class from all
            thumb.classList.add("selected"); // Add selected class to clicked thumbnail
            mainImg.src = thumb.getAttribute("data-large") || thumb.src; // Set main image to clicked thumbnail
        });
    });
}

function setupSizeSelection() { // Setup click events for size buttons
    const sizeBtns = document.querySelectorAll(".size-btn"); // Get all size buttons
    sizeBtns.forEach(btn => { // For each size button
        btn.addEventListener("click", () => { // Add click event
            sizeBtns.forEach(b => b.classList.remove("active")); // Remove active class from all
            btn.classList.add("active"); // Add active class to clicked button
        });
    });
}

function setupVariantSwatches(product, selectedKey = null) { // Setup color swatches for product variants
    const swatchContainer = document.getElementById("color-options"); // Get swatch container
    swatchContainer.innerHTML = ""; // Clear existing swatches

    // Original/default swatch
    const originalSwatch = document.createElement("img"); // Create image element for original color
    originalSwatch.src = product.main_image; // Set image source
    originalSwatch.alt = "Original"; // Set alt text
    originalSwatch.className = "img-thumbnail border border-2 rounded p-1 color-option" + ((selectedKey === null || selectedKey === "original") ? " selected" : ""); // Set class
    originalSwatch.style.width = "60px"; // Set width
    originalSwatch.style.height = "60px"; // Set height
    originalSwatch.style.cursor = "pointer"; // Set cursor
    originalSwatch.dataset.color = "original"; // Set data attribute

    originalSwatch.addEventListener("click", () => { // Add click event for original swatch
        window.currentVariantKey = null; // Reset variant key
        window.currentVariant = null; // Reset variant
        renderProduct(product, null, null); // Render product with default color
    });

    swatchContainer.appendChild(originalSwatch); // Add original swatch to container

    // Variant swatches
    Object.entries(product.variants).forEach(([colorKey, variant]) => { // For each variant color
        const swatch = document.createElement("img"); // Create image element for swatch
        swatch.src = variant.mainImg; // Set image source
        swatch.alt = colorKey; // Set alt text
        swatch.className = "img-thumbnail border border-2 rounded p-1 color-option" + (selectedKey === colorKey ? " selected" : ""); // Set class
        swatch.style.width = "60px"; // Set width
        swatch.style.height = "60px"; // Set height
        swatch.style.cursor = "pointer"; // Set cursor
        swatch.dataset.color = colorKey; // Set data attribute

        swatch.addEventListener("click", () => { // Add click event for swatch
            window.currentVariantKey = colorKey; // Set selected variant key
            window.currentVariant = variant; // Set selected variant
            renderProduct(product, colorKey, variant); // Render product with selected color
        });

        swatchContainer.appendChild(swatch); // Add swatch to container
    });
}

function capitalize(str) { // Capitalize the first letter of a string
    if (!str) return ''; // If string is empty, return empty string
    return str.charAt(0).toUpperCase() + str.slice(1); // Capitalize first letter
}