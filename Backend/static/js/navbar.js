document.addEventListener('DOMContentLoaded', () => {
    console.log("Navbar script loaded");

    const navContainer = document.querySelector('.navbar-nav.ms-auto');
    if (!navContainer) {
        console.error("Navbar container '.navbar-nav.ms-auto' NOT found");
        return;
    }

    console.log("Navbar container found:", navContainer);
    console.log("Current window.USER_EMAIL:", window.USER_EMAIL);

    navContainer.innerHTML = ''; // Clear current contents

    const cartHTML =
        `
    <li class="nav-item">
        <a class="nav-link" href="/cart" title="Cart">
            <i class="bi bi-cart3"></i>
        </a>
    </li>`;

    if (window.USER_EMAIL && window.USER_EMAIL.trim() !== '') {
        console.log("User is logged in:", window.USER_EMAIL);
        navContainer.innerHTML += `
        <li class="nav-item d-flex align-items-center">
            <span class="nav-link">Welcome, ${window.USER_EMAIL}</span>
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

    
});