let cart = []; // Array to hold cart items

document.addEventListener('cart:cleared', function () {
    // Listen for custom cart cleared event and refresh cart
    console.log('cart:cleared event received in cartOverlay.js');
    loadCartFromLocalStorage();
    renderCartItems();
    if (typeof updateCartBadge === 'function') updateCartBadge();
});
window.addEventListener('storage', function (e) {
    // Listen for storage changes (multi-tab sync)
    if (e.key === 'cart') {
        console.log('storage event received in cartOverlay.js');
        loadCartFromLocalStorage();
        renderCartItems();
        if (typeof updateCartBadge === 'function') updateCartBadge();
    }
});

// Load cart from localStorage
function loadCartFromLocalStorage() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
        try {
            cart = JSON.parse(storedCart);
        } catch {
            cart = [];
        }
    } else {
        cart = [];
    }
}

// Save cart to localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Clear the cart from memory and localStorage, then re-render
export function clearCart() {
    cart = [];
    saveCartToLocalStorage();
    renderCartItems();
}

// Remove a single item by its id, size, color, and variant
function removeCartItem(id, size, color, variant) {
    // Remove item matching id, size, color, and variant (variant can be undefined/empty)
    cart = cart.filter(item => {
        // If id, size, or color do not match, keep the item
        if (item.id !== id || item.size !== size || item.color !== color) return true;
        // If both variant and item.variant are undefined/empty, remove (return false)
        if ((!item.variant && !variant) || (item.variant === "" && (variant === undefined || variant === ""))) return false;
        // If both are defined and equal, remove (return false)
        if (item.variant === variant) return false;
        // Otherwise, keep the item
        return true;
    });
    saveCartToLocalStorage();
    renderCartItems();
}

// Initialize cart from localStorage and render on page load
document.addEventListener("DOMContentLoaded", () => {
    loadCartFromLocalStorage();
    renderCartItems();
    const clearBtn = document.getElementById('clear-cart-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearCart);
    }
});

// Add to cart and persist only to localStorage
export function addToCart({ id, title, price, imageSrc, size, color, variant, quantity = 1 }) {
    loadCartFromLocalStorage();
    const existing = cart.find(item =>
        item.id === id &&
        item.size === size &&
        item.color === color &&
        item.variant === variant
    );
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ id, title, price, imageSrc, size, color, variant, quantity });
    }
    saveCartToLocalStorage();
    renderCartItems();
    showCartOverlay();
}

function renderCartItems() {
    const cartItemsContainer = document.getElementById("cart-items");
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        total += item.price * (item.quantity || 1);
        cartItemsContainer.innerHTML += `
        <div class="d-flex align-items-center mb-3">
            <img src="${item.imageSrc || ''}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; margin-right: 10px;">
            <div>
                <p class="mb-0"><strong>${item.title}</strong></p>
                <p class="mb-0 text-muted">$${item.price.toFixed(2)} x ${item.quantity || 1}</p>
                ${item.color ? `<p class="mb-0">Color: ${item.color}</p>` : ""}
                ${item.size ? `<p class="mb-0">Size: ${item.size}</p>` : ""}
                ${item.variant ? `<p class="mb-0">Variant: ${item.variant}</p>` : ""}
                <button class="btn btn-sm btn-outline-danger mt-1 remove-item-btn" 
                    data-id="${item.id}" 
                    data-size="${item.size}" 
                    data-color="${item.color ? item.color : ''}"
                    data-variant="${item.variant ? item.variant : ''}">
                    Remove
                </button>
            </div>
        </div>
        `;
    });

    const totalElement = document.getElementById("cart-total");
    if (totalElement) totalElement.textContent = total.toFixed(2);

    // Attach remove event listeners for all remove buttons, including variant
    cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = parseInt(this.getAttribute('data-id'));
            const size = this.getAttribute('data-size');
            const color = this.getAttribute('data-color');
            const variant = this.getAttribute('data-variant');
            removeCartItem(id, size, color, variant);
        });
    });
}

function showCartOverlay() {
    const cartElement = document.getElementById("cartOverlay");
    if (!cartElement) return;

    const bsOffcanvas = new bootstrap.Offcanvas(cartElement);
    bsOffcanvas.show();
}

export function setupCartClose() {
    const closeCartBtn = document.getElementById("close-cart");
    const cartOverlay = document.getElementById("cart-overlay");
    if (closeCartBtn && cartOverlay) {
        closeCartBtn.addEventListener("click", () => {
            cartOverlay.classList.add("d-none");
        });
    }
}