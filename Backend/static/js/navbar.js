document.addEventListener('DOMContentLoaded', () => {
    console.log("Navbar script loaded");

    document.addEventListener('cart:cleared', function () {
        if (typeof updateCartBadge === 'function') updateCartBadge();
    });

    const navContainer = document.querySelector('.navbar-nav.ms-auto');
    if (!navContainer) {
        console.error("Navbar container '.navbar-nav.ms-auto' NOT found");
        return;
    }

    console.log("Navbar container found:", navContainer);
    console.log("Current window.USER_EMAIL:", window.USER_EMAIL);

    navContainer.innerHTML = ''; // Clear current contents

    // Cart icon with badge
    const cartHTML =
        `
    <li class="nav-item position-relative">
        <a class="nav-link" href="/cart" title="Cart">
            <i class="bi bi-cart3"></i>
            <span id="cart-count-badge" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size:0.75em; display:none;">0</span>
        </a>
    </li>`;

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
        console.log("User is NOT logged in");
        navContainer.innerHTML += `
        <li class="nav-item">
            <a class="nav-link" href="login" title="Login" data-bs-toggle="modal" data-bs-target="#loginModal">
                <i class="bi bi-person-circle"></i>
            </a>
        </li>
    ` + cartHTML;
    }
    console.log("Navbar updated successfully");

    // --- Cart Badge Update Function ---
    function updateCartBadge() {
        const storedCart = localStorage.getItem('cart');
        const cart = storedCart ? JSON.parse(storedCart) : [];
        const itemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        const badge = document.getElementById('cart-count-badge');
        if (badge) {
            badge.textContent = itemCount;
            badge.style.display = itemCount > 0 ? 'inline-block' : 'none';
        }
    }

    updateCartBadge();
    window.addEventListener('storage', function (e) {
        if (e.key === 'cart') updateCartBadge();
    });
});