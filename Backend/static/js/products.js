// Related products - remains hardcoded (can be replaced by server later)
const relatedProducts = [
    { title: "Nike Air Force 1 '07 Essentials", price: "$199.95", img: "https://culture-kings-nz.imgix.net/files/05012794-YX437_default_0040.jpg?v=1743116764&fit=crop&h=1000&w=800&auto=compress,format", link: "product1.html" },
    { title: "Nike Air Force 1 '07 Essentials", price: "$199.95", img: "https://culture-kings-nz.imgix.net/files/05012795-YW179_default_0040.jpg?v=1739316673&fit=crop&h=1000&w=800&auto=compress,format", link: "product2.html" },
    { title: "Nike Air Force '07 LV8", price: "$219.95", img: "https://culture-kings-nz.imgix.net/files/05012068-YP744_default_0040.jpg?v=1724203382&fit=crop&h=1000&w=800&auto=compress,format", link: "product3.html" },
    { title: "Air Force 1 '07 LV8 Brogue", price: "$219.95", img: "https://culture-kings-nz.imgix.net/files/05011689-YX782_default_0040.jpg?v=1717115045&fit=crop&h=1000&w=800&auto=compress,format", link: "product4.html" },
    { title: "Air Force 1 '07 Texture Carbon Fibre", price: "$219.95", img: "https://culture-kings-nz.imgix.net/files/05012799-YW240_default_0040.jpg?v=1743720068&fit=crop&h=1000&w=800&auto=compress,format", link: "product5.html" }
];

const relatedContainer = document.querySelector(".d-flex.overflow-auto");

products.forEach(product => {
  const productHTML = `
    <div class="col-12 col-sm-6 col-md-4 mb-4 product-card" data-product-id="${product.id}">
      <div class="card h-100 shadow-sm">
        <a href="#" class="product-link text-decoration-none text-dark">
          <img src="${product.image}" class="card-img-top" alt="${product.model}" />
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${product.brand} ${product.model}</h5>
            <p class="card-text fw-bold">$${product.price}</p>
          </div>
        </a>
        <button class="btn btn-light border mt-auto">Add to Cart</button>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', productHTML);
});
document.getElementById('product-list').addEventListener('click', function(event) {
  // Prevent redirect when clicking Add to Cart button
  if (event.target.closest('button')) return;

  const productCard = event.target.closest('.product-card');
  if (!productCard) return;

  const productId = productCard.getAttribute('data-product-id');
  if (!productId) return;

  const productUrl = `/product.html?id=${productId}`;
  window.location.href = productUrl;
});

// --- Dynamic product variants loading ---

let productVariants = {};  // Will store the loaded variants

async function loadProductVariants() {
    try {
        const response = await fetch('variants.json'); // your JSON file URL here
        if (!response.ok) throw new Error('Failed to load variants data');

        const data = await response.json();
        productVariants = data;

        setupColorOptions();
        // Initialize page with first variant (or a default variant)
        const firstVariantKey = Object.keys(productVariants)[0];
        if (firstVariantKey) updateProductDisplay(firstVariantKey);

    } catch (err) {
        console.error('Error loading product variants:', err);
    }
}

// Setup event listeners for color option thumbnails dynamically
function setupColorOptions() {
    // Assuming you have container or elements with class 'color-option' and data-color attribute
    document.querySelectorAll('.color-option').forEach(img => {
        img.addEventListener('click', () => {
            const colorKey = img.dataset.color;
            updateProductDisplay(colorKey);
        });
    });
}

// Update main image, title, price, and thumbnails for selected variant
function updateProductDisplay(variantKey) {
    const variant = productVariants[variantKey];
    if (!variant) {
        console.warn(`Variant key "${variantKey}" not found`);
        return;
    }

    // Update main product image
    const mainImgEl = document.getElementById("main-shoe-img");
    if (mainImgEl) mainImgEl.src = variant.img;

    // Update product title and price
    const titleEl = document.getElementById("product-title");
    if (titleEl) titleEl.textContent = variant.title;

    const priceEl = document.getElementById("product-price");
    if (priceEl) priceEl.textContent = variant.price;

    // Update thumbnails container (assuming container with class 'thumbnails')
    const thumbnailsContainer = document.querySelector('.thumbnails');
    if (thumbnailsContainer) {
        thumbnailsContainer.innerHTML = ''; // Clear existing thumbnails

        if (variant.thumbnails && Array.isArray(variant.thumbnails)) {
            variant.thumbnails.forEach(url => {
                const thumb = document.createElement('img');
                thumb.src = url;
                thumb.className = 'thumbnail';
                thumb.alt = variant.title + " thumbnail";
                thumb.setAttribute('data-large', url);

                thumb.addEventListener('click', () => {
                    if (mainImgEl) mainImgEl.src = url;

                    // Highlight active thumbnail
                    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('border-primary'));
                    thumb.classList.add('border-primary');
                });

                thumbnailsContainer.appendChild(thumb);
            });
        }
    }
}

// Run on page load
window.addEventListener('DOMContentLoaded', () => {
    loadProductVariants();
});
