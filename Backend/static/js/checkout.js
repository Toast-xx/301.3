function renderCheckoutItems() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
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
                <div class="small text-muted">
                    Size: ${item.size || '-'}, Color: ${item.color || '-'}
                </div>
            </div>
            <span>${item.quantity} x $${item.price.toFixed(2)}</span>
        </li>
        `;
    });
    html += '</ul>';
    container.innerHTML = html;
}

function renderOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
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

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async function (e) {
            e.preventDefault(); // Prevent default form submission

            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            document.getElementById('cart-data').value = JSON.stringify(cart);

            // Gather all form fields
            const formData = new FormData(checkoutForm);

            // Stripe integration
            const shippingSelect = document.getElementById('shipping-select');
            const selectedOption = shippingSelect.options[shippingSelect.selectedIndex];
            const shipping_method = selectedOption.text.split('-')[0].trim();
            const shipping_cost = shippingSelect.value;

            // Build data object to send to backend
            const data = {
                cart: cart,
                shipping_method: shipping_method,
                shipping_cost: shipping_cost,
                contactEmail: formData.get('contactEmail'),
                contactFirstName: formData.get('contactFirstName'),
                contactLastName: formData.get('contactLastName'),
                contactPhone: formData.get('contactPhone'),
                shippingFirstName: formData.get('shippingFirstName'),
                shippingLastName: formData.get('shippingLastName'),
                shippingAddress: formData.get('shippingAddress')
                // Add more fields if needed
            };

            // Call backend to create Stripe session
            const response = await fetch('/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const session = await response.json();

            if (!window.STRIPE_PUBLISHABLE_KEY) {
                alert('Stripe publishable key not set!');
                return;
            }
            const stripe = Stripe(window.STRIPE_PUBLISHABLE_KEY);
            await stripe.redirectToCheckout({ sessionId: session.id });
        });
    }

    // Log the current body text for debugging
    console.log('Body innerText:', document.body.innerText);

    // Clear cart and update badge after successful order
    if (document.body.innerText.includes("Order placed successfully!")) {
        console.log('Order success message detected!');
        console.log('Cart before clearing:', localStorage.getItem('cart'));
        localStorage.removeItem('cart');
        console.log('Cart after clearing:', localStorage.getItem('cart'));
        // Immediately update the badge in this tab
        if (typeof updateCartBadge === 'function') {
            console.log('Calling updateCartBadge...');
            updateCartBadge();
        } else {
            console.warn('updateCartBadge is not defined!');
        }
        // Also dispatch a custom event for other scripts if needed
        document.dispatchEvent(new Event('cart:cleared'));
        console.log("Cart cleared from localStorage after successful checkout.");
    } else {
        console.log('Order success message NOT found. Cart not cleared.');
    }
});