function loadCart() {
    const storedCart = localStorage.getItem('cart');
    return storedCart ? JSON.parse(storedCart) : [];
}

function renderCheckoutItems() {
    const cart = loadCart();
    const container = document.getElementById('checkout-items');
    if (!cart.length) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }
    let html = '<ul class="list-group mb-3">';
    cart.forEach(item => {
        html += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <div>
                <strong>${item.title}</strong>
                <div class="small text-muted">Size: ${item.size}${item.color ? ', Color: ' + item.color : ''}</div>
            </div>
            <span>${item.quantity} x $${item.price.toFixed(2)}</span>
        </li>
        `;
    });
    html += '</ul>';
    container.innerHTML = html;
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

document.addEventListener('DOMContentLoaded', function () {
    renderCheckoutItems();
    renderOrderSummary();
    const shippingSelect = document.getElementById('shipping-select');
    if (shippingSelect) {
        shippingSelect.addEventListener('change', renderOrderSummary);
    }
    // Stripe payment button handler (replace with your own Stripe publishable key and backend integration)
    document.getElementById('stripe-checkout-btn').addEventListener('click', function () {
        alert('Stripe payment integration goes here.');
        // Example: collect form data, send to backend, create Stripe Checkout session, redirect to Stripe
    });
});