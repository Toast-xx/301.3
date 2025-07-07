// Render the list of checkout items from the cart and display them in the checkout summary
function renderCheckoutItems() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]'); // Retrieve cart from localStorage or use empty array
    const container = document.getElementById('checkout-items');
    if (!cart.length) {
        // If cart is empty, show a message
        container.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }
    // Build HTML for each cart item
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

// Render the order summary (subtotal, item count, total) based on cart and shipping selection
function renderOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]'); // Retrieve cart from localStorage or use empty array
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0); // Calculate subtotal
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0); // Calculate total item count
    const shipping = parseFloat(document.getElementById('shipping-select')?.value || 0); // Get shipping cost from select
    document.getElementById('summary-items').textContent = itemCount; // Update item count in summary
    document.getElementById('summary-subtotal').textContent = subtotal.toFixed(2); // Update subtotal in summary
    document.getElementById('summary-total').textContent = (subtotal + shipping).toFixed(2); // Update total in summary
}

// When the DOM is fully loaded, initialize checkout page logic
document.addEventListener('DOMContentLoaded', function () {
    renderCheckoutItems(); // Show cart items in checkout summary
    renderOrderSummary();  // Show order summary

    // Update order summary when shipping option changes
    const shippingSelect = document.getElementById('shipping-select');
    if (shippingSelect) {
        shippingSelect.addEventListener('change', renderOrderSummary);
    }

    // Handle checkout form submission and Stripe integration
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async function (e) {
            e.preventDefault(); // Prevent default form submission

            // Get current cart and set it in a hidden input for backend processing
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            document.getElementById('cart-data').value = JSON.stringify(cart);

            // Gather all form fields into a FormData object
            const formData = new FormData(checkoutForm);

            // Get selected shipping method and cost
            const shippingSelect = document.getElementById('shipping-select');
            const selectedOption = shippingSelect.options[shippingSelect.selectedIndex];
            const shipping_method = selectedOption.text.split('-')[0].trim();
            const shipping_cost = shippingSelect.value;

            // Build data object to send to backend for Stripe session creation
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

            // Send data to backend to create a Stripe checkout session
            const response = await fetch('/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const session = await response.json();

            // Ensure Stripe publishable key is available
            if (!window.STRIPE_PUBLISHABLE_KEY) {
                alert('Stripe publishable key not set!');
                return;
            }
            // Redirect to Stripe Checkout
            const stripe = Stripe(window.STRIPE_PUBLISHABLE_KEY);
            await stripe.redirectToCheckout({ sessionId: session.id });
        });
    }

    // Log the current body text for debugging purposes
    console.log('Body innerText:', document.body.innerText);

    // If the order was placed successfully, clear the cart and update the cart badge
    if (document.body.innerText.includes("Order placed successfully!")) {
        console.log('Order success message detected!');
        console.log('Cart before clearing:', localStorage.getItem('cart'));
        localStorage.removeItem('cart');
        console.log('Cart after clearing:', localStorage.getItem('cart'));
        // Update the cart badge in this tab if the function exists
        if (typeof updateCartBadge === 'function') {
            console.log('Calling updateCartBadge...');
            updateCartBadge();
        } else {
            console.warn('updateCartBadge is not defined!');
        }
        // Dispatch a custom event for other scripts (e.g., to update cart in other tabs)
        document.dispatchEvent(new Event('cart:cleared'));
        console.log("Cart cleared from localStorage after successful checkout.");
    } else {
        console.log('Order success message NOT found. Cart not cleared.');
    }
});