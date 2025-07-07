document.addEventListener('DOMContentLoaded', () => {
    // Get the login modal element by its ID
    const loginModal = document.getElementById('loginModal');
    if (!loginModal) return; // Exit if the modal is not present on the page

    // Find the login form inside the modal by its ID
    const loginForm = loginModal.querySelector('form#loginForm');
    if (!loginForm) return; // Exit if the form is not found

    // Ensure the login form contains a hidden 'next' input for redirecting after login
    let nextInput = loginForm.querySelector('input[name="next"]');
    if (!nextInput) {
        // If not present, create and append the hidden input
        nextInput = document.createElement('input');
        nextInput.type = 'hidden';
        nextInput.name = 'next';
        loginForm.appendChild(nextInput);
    }

    // When the login modal is shown, set the 'next' input value to the current URL path and query string
    loginModal.addEventListener('show.bs.modal', function () {
        nextInput.value = window.location.pathname + window.location.search;
    });
});