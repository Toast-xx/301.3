function loadCart() {
    const storedCart = localStorage.getItem('cart');
    return storedCart ? JSON.parse(storedCart) : [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function removeCartItem(id, size) {
    let cart = loadCart();
    cart = cart.filter(item => !(item.id === id && item.size === size));
    saveCart(cart);
    renderCartTable();
    renderOrderSummary();
}

function updateCartQuantity(id, size, quantity) {
    let cart = loadCart();
    cart.forEach(item => {
        if (item.id === id && item.size === size) {
            item.quantity = parseInt(quantity);
        }
    });
    saveCart(cart);
    renderCartTable();
    renderOrderSummary();
}

function clearCart() {
    saveCart([]);
    renderCartTable();
    renderOrderSummary();
}

function renderCartTable() {
    const cart = loadCart();
    const container = document.getElementById('cart-table-container');
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
            <td>${item.size}</td>
            <td>
                <select class="form-select form-select-sm quantity-select" data-id="${item.id}" data-size="${item.size}">
                    ${[...Array(10).keys()].map(i => `<option value="${i + 1}"${item.quantity == i + 1 ? ' selected' : ''}>${i + 1}</option>`).join('')}
                </select>
            </td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-danger remove-btn" data-id="${item.id}" data-size="${item.size}">&times;</button>
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

    // Attach remove event listeners
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = parseInt(this.getAttribute('data-id'));
            const size = this.getAttribute('data-size');
            removeCartItem(id, size);
        });
    });

    // Attach quantity change event listeners
    document.querySelectorAll('.quantity-select').forEach(select => {
        select.addEventListener('change', function () {
            const id = parseInt(this.getAttribute('data-id'));
            const size = this.getAttribute('data-size');
            const quantity = this.value;
            updateCartQuantity(id, size, quantity);
        });
    });
}

function renderOrderSummary() {
    const cart = loadCart();
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const shipping = parseFloat(document.getElementById('shipping-select')?.value || 0);
    document.getElementById('summary-items').textContent = itemCount;
    document.getElementById('summary-subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('summary-total').textContent = (subtotal + shipping).toFixed(2);
}

// Update order summary when shipping option changes
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