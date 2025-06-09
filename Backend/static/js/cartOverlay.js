let cart = [];

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

// Remove a single item by its id and size
function removeCartItem(id, size) {
    cart = cart.filter(item => !(item.id === id && item.size === size));
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
export function addToCart({ id, title, price, imageSrc, size, quantity = 1 }) {
    loadCartFromLocalStorage();
    const existing = cart.find(item => item.id === id && item.size === size);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ id, title, price, imageSrc, size, quantity });
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
                ${item.size ? `<p class="mb-0">Size: ${item.size}</p>` : ""}
                <button class="btn btn-sm btn-outline-danger mt-1 remove-item-btn" data-id="${item.id}" data-size="${item.size}">Remove</button>
            </div>
        </div>
        `;
    });

    const totalElement = document.getElementById("cart-total");
    if (totalElement) totalElement.textContent = total.toFixed(2);

    // Attach remove event listeners
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = parseInt(this.getAttribute('data-id'));
            const size = this.getAttribute('data-size');
            removeCartItem(id, size);
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