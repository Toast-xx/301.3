console.log('home.js loaded');

// Only keep cart-clearing logic and body text logging
window.addEventListener('DOMContentLoaded', () => {
    // Log the current body text for debugging
    console.log('Body innerText:', document.body.innerText);

    // Clear localStorage cart if order was placed successfully (after checkout redirect)
    if (document.body.innerText.includes("Order placed successfully!")) {
        console.log('Order success message detected!');
        localStorage.removeItem('cart');
        document.dispatchEvent(new Event('cart:cleared'));
        console.log("Cart cleared from localStorage after successful checkout.");
    }
});