import { addToCart, setupCartClose } from './cartOverlay.js';

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("productGrid");
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    let currentProduct = null;

    if (!id) {
        container.innerHTML = "<p class='text-center text-danger'>No product selected.</p>";
        return;
    }

    fetch(`/api/product/${id}`)
        .then(res => {
            if (!res.ok) throw new Error("Product not found");
            return res.json();
        })
        .then(product => {
            currentProduct = product; // Store for use in addToCart
            renderProduct(product);
            setupVariantSwatches(product);
            renderRelatedProducts(relatedProducts); // defined elsewhere
        })
        .catch(err => console.error("Error fetching product:", err));

    document.addEventListener("click", function (event) {
        if (event.target.matches(".btn-primary.btn-lg")) {
            if (!currentProduct) return; // Safety check
            const title = document.getElementById("product-title").textContent;
            const priceText = document.getElementById("product-price").textContent.replace('$', '');
            const price = parseFloat(priceText);
            const imageSrc = document.getElementById("main-shoe-img").src;
            // Get selected size
            const sizeBtn = document.querySelector(".size-btn.active");
            const size = sizeBtn ? sizeBtn.textContent : null;
            addToCart({ id: currentProduct.id, title, price, imageSrc,size });
        }
    });

    setupCartClose();
});

function renderProduct(product, variant = null) {
    const container = document.getElementById("productGrid");
    const mainImage = variant?.mainImg || product.main_image;
    const gallery = variant?.thumbnails || product.thumbnails;

    container.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <img id="main-shoe-img" src="${mainImage}" class="img-fluid rounded shadow-sm mb-3" alt="${product.title}" />
                <div id="thumbnails-container" class="d-flex flex-wrap gap-2">
                    ${gallery.map((thumb, i) => {
        const src = variant ? thumb : thumb.src;
        const large = variant ? thumb : thumb.src;
        const alt = variant ? `Variant image ${i + 1}` : (thumb.alt || `${product.title} thumbnail`);
        return `
                            <img src="${src}" data-large="${large}" class="thumbnail img-thumbnail ${i === 0 ? 'selected' : ''}" 
                                 alt="${alt}" data-index="${i}" 
                                 style="width: 60px; height: 60px; object-fit: cover;" />
                        `;
    }).join('')}
                </div>
            </div>
            <div class="col-md-6">
                <h2 id="product-title">${product.title}</h2>
                <h4 class="text-danger" id="product-price">$${product.price.toFixed(2)}</h4>
                <p class="text-muted" id="product-description">${product.description}</p>

                <h6>Select Size:</h6>
                <div id="sizes-container" class="d-flex flex-wrap gap-2 mb-3">
                    ${product.sizes.map(size => `
                        <button class="btn btn-outline-dark size-btn">${size}</button>
                    `).join('')}
                </div>

                <label class="form-label">Color:</label>
                <div class="d-flex gap-2 mb-3" id="color-options"></div>

                <div class="d-grid mb-3">
                    <button class="btn btn-primary btn-lg"><i class="bi bi-cart-plus me-2"></i>Add to Cart</button>
                </div>

                <div class="border-top pt-3">
                    <h6>Select Shipping Option:</h6>
                    <form>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="shippingOption" id="standardShipping" value="standard" checked>
                            <label class="form-check-label" for="standardShipping"><i class="bi bi-truck"></i> Free Standard Shipping</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="shippingOption" id="expressShipping" value="express">
                            <label class="form-check-label" for="expressShipping"><i class="bi bi-lightning"></i> Express Shipping $9.99</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="shippingOption" id="pickup" value="pickup">
                            <label class="form-check-label" for="pickup"><i class="bi bi-shop"></i> In-Store Pickup</label>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    setupThumbnailClicks(product, variant);
    setupSizeSelection();
}

function setupThumbnailClicks(product, variant = null) {
    const thumbnails = document.querySelectorAll("#thumbnails-container img.thumbnail");
    const mainImg = document.getElementById("main-shoe-img");

    thumbnails.forEach(thumb => {
        thumb.addEventListener("click", () => {
            thumbnails.forEach(t => t.classList.remove("selected"));
            thumb.classList.add("selected");
            mainImg.src = thumb.getAttribute("data-large") || thumb.src;
        });
    });
}

function setupSizeSelection() {
    const sizeBtns = document.querySelectorAll(".size-btn");
    sizeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            sizeBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });
}

function setupVariantSwatches(product) {
    const swatchContainer = document.getElementById("color-options");
    swatchContainer.innerHTML = "";

    const originalSwatch = document.createElement("img");
    originalSwatch.src = product.main_image;
    originalSwatch.alt = "Original";
    originalSwatch.className = "img-thumbnail border border-2 rounded p-1 color-option selected";
    originalSwatch.style.width = "60px";
    originalSwatch.style.height = "60px";
    originalSwatch.style.cursor = "pointer";
    originalSwatch.dataset.color = "original";

    originalSwatch.addEventListener("click", () => {
        renderProduct(product);
        setupVariantSwatches(product);
        [...swatchContainer.children].forEach(s => s.classList.remove("selected"));
        originalSwatch.classList.add("selected");
    });

    swatchContainer.appendChild(originalSwatch);

    Object.entries(product.variants).forEach(([colorKey, variant]) => {
        const swatch = document.createElement("img");
        swatch.src = variant.mainImg;
        swatch.alt = colorKey;
        swatch.className = "img-thumbnail border border-2 rounded p-1 color-option";
        swatch.style.width = "60px";
        swatch.style.height = "60px";
        swatch.style.cursor = "pointer";
        swatch.dataset.color = colorKey;

        swatch.addEventListener("click", () => {
            renderProduct(product, variant);
            setupVariantSwatches(product);
            [...swatchContainer.children].forEach(s => s.classList.remove("selected"));
            swatch.classList.add("selected");
        });

        swatchContainer.appendChild(swatch);
    });
}