document.addEventListener('DOMContentLoaded', () => {
    // Log that the navbar script has loaded
    console.log("Navbar script loaded");

    // Listen for the custom 'cart:cleared' event and update the cart badge if the function exists
    document.addEventListener('cart:cleared', function () {
        if (typeof updateCartBadge === 'function') updateCartBadge();
    });

    // Find the navbar container for right-aligned navigation items
    const navContainer = document.querySelector('.navbar-nav.ms-auto');
    if (!navContainer) {
        // If the navbar container is not found, log an error and exit
        console.error("Navbar container '.navbar-nav.ms-auto' NOT found");
        return;
    }

    // Log the found navbar container and current user email (if any)
    console.log("Navbar container found:", navContainer);
    console.log("Current window.USER_EMAIL:", window.USER_EMAIL);

    // Clear any existing navbar content before rebuilding
    navContainer.innerHTML = '';

    // HTML for the cart icon with a badge to show the cart item count
    const cartHTML =
        `
    <li class="nav-item position-relative">
        <a class="nav-link" href="/cart" title="Cart">
            <i class="bi bi-cart3"></i>
            <span id="cart-count-badge" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size:0.75em; display:none;">0</span>
        </a>
    </li>`;

    // If the user is logged in, show a welcome message, logout link, and cart
    if (window.USER_EMAIL && window.USER_EMAIL.trim() !== '') {
        console.log("User is logged in:", window.USER_EMAIL);
        navContainer.innerHTML += `
        <li class="nav-item d-flex align-items-center">
            <span class="nav-link">Welcome, ${window.USER_FIRSTNAME}</span>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="/logout" title="Logout">
                <i class="bi bi-box-arrow-right"></i>
            </a>
        </li>
    ` + cartHTML;

    } else {
        // If the user is not logged in, show a login link and cart
        console.log("User is NOT logged in");
        navContainer.innerHTML += `
        <li class="nav-item">
            <a class="nav-link" href="login" title="Login" data-bs-toggle="modal" data-bs-target="#loginModal">
                <i class="bi bi-person-circle"></i>
            </a>
        </li>
    ` + cartHTML;
    }
    // Log that the navbar has been updated
    console.log("Navbar updated successfully");

    // --- Cart Badge Update Function ---
    // Updates the cart badge to reflect the current number of items in the cart
    function updateCartBadge() {
        const storedCart = localStorage.getItem('cart');
        const cart = storedCart ? JSON.parse(storedCart) : [];
        // Sum the quantity of all items in the cart
        const itemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        const badge = document.getElementById('cart-count-badge');
        if (badge) {
            badge.textContent = itemCount;
            // Show the badge only if there are items in the cart
            badge.style.display = itemCount > 0 ? 'inline-block' : 'none';
        }
    }

    // Initialize the cart badge on page load
    updateCartBadge();

    // Listen for changes to the cart in localStorage (e.g., from other tabs) and update the badge
    window.addEventListener('storage', function (e) {
        if (e.key === 'cart') updateCartBadge();
    });
});