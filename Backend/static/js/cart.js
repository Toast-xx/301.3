// Listen for the custom 'cart:cleared' event and update cart UI components if their functions exist
document.addEventListener('cart:cleared', function () {
    if (typeof renderCartTable === 'function') renderCartTable();
    if (typeof renderOrderSummary === 'function') renderOrderSummary();
    if (typeof updateCartBadge === 'function') updateCartBadge();
});

// Load the cart from localStorage, or return an empty array if not present
function loadCart() {
    const storedCart = localStorage.getItem('cart');
    return storedCart ? JSON.parse(storedCart) : [];
}

// Save the cart array to localStorage as a JSON string
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Remove a specific item from the cart by id, size, and color, then update UI
function removeCartItem(id, size, color) {
    let cart = loadCart();
    cart = cart.filter(item => !(item.id === id && item.size === size && item.color === color));
    saveCart(cart);
    renderCartTable();
    renderOrderSummary();
}

// Update the quantity of a specific cart item, then update UI
function updateCartQuantity(id, size, color, quantity) {
    let cart = loadCart();
    cart.forEach(item => {
        if (item.id === id && item.size === size && item.color === color) {
            item.quantity = parseInt(quantity);
        }
    });
    saveCart(cart);
    renderCartTable();
    renderOrderSummary();
}

// Clear all items from the cart, update UI, and dispatch a custom event for other scripts
function clearCart() {
    saveCart([]);
    renderCartTable();
    renderOrderSummary();
    // Dispatch a custom event for other scripts (e.g., navbar badge)
    document.dispatchEvent(new Event('cart:cleared'));
}

// Render the cart table in the UI based on the current cart contents
function renderCartTable() {
    const cart = loadCart();
    const container = document.getElementById('cart-table-container');
    if (!container) return;
    if (!cart.length) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }
    let table = `
    <div class="table-responsive">
    <table class="table align-middle">
        <thead>
            <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Color</th>
                <th>Size</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Remove</th>
            </tr>
        </thead>
        <tbody>
    `;
    cart.forEach(item => {
        table += `
        <tr>
            <td><img src="${item.imageSrc || ''}" alt="${item.title}" style="width:60px;height:60px;object-fit:cover;"></td>
            <td>${item.title}</td>
            <td>${item.color || '-'}</td>
            <td>${item.size || '-'}</td>
            <td>
                <select class="form-select form-select-sm quantity-select" data-id="${item.id}" data-size="${item.size}" data-color="${item.color}">
                    ${[...Array(10).keys()].map(i => `<option value="${i + 1}"${item.quantity == i + 1 ? ' selected' : ''}>${i + 1}</option>`).join('')}
                </select>
            </td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-danger remove-btn" data-id="${item.id}" data-size="${item.size}" data-color="${item.color}">&times;</button>
            </td>
        </tr>
        `;
    });
    table += `
        </tbody>
    </table>
    </div>
    `;
    container.innerHTML = table;

    // Attach event listeners to remove buttons for deleting items from the cart
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = parseInt(this.getAttribute('data-id'));
            const size = this.getAttribute('data-size');
            const color = this.getAttribute('data-color');
            removeCartItem(id, size, color);
        });
    });

    // Attach event listeners to quantity selectors for updating item quantities
    document.querySelectorAll('.quantity-select').forEach(select => {
        select.addEventListener('change', function () {
            const id = parseInt(this.getAttribute('data-id'));
            const size = this.getAttribute('data-size');
            const color = this.getAttribute('data-color');
            const quantity = this.value;
            updateCartQuantity(id, size, color, quantity);
        });
    });
}

// Render the order summary (subtotal, item count, total) in the UI
function renderOrderSummary() {
    const cart = loadCart();
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const shipping = parseFloat(document.getElementById('shipping-select')?.value || 0);
    document.getElementById('summary-items').textContent = itemCount;
    document.getElementById('summary-subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('summary-total').textContent = (subtotal + shipping).toFixed(2);
}

// Initialize cart UI and event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    renderCartTable();
    renderOrderSummary();
    const shippingSelect = document.getElementById('shipping-select');
    if (shippingSelect) {
        shippingSelect.addEventListener('change', renderOrderSummary);
    }
    const clearBtn = document.getElementById('clear-cart-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearCart);
    }
});

// Listen for changes to the cart in localStorage (e.g., from other tabs) and update UI accordingly
window.addEventListener('storage', function (e) {
    if (e.key === 'cart') {
        renderCartTable();
        renderOrderSummary();
    }
});