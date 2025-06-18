document.addEventListener('DOMContentLoaded', () => {
    const loginModal = document.getElementById('loginModal');
    if (!loginModal) return;

    // Ensure the login form has a hidden 'next' input
    const loginForm = loginModal.querySelector('form#loginForm');
    if (!loginForm) return;

    let nextInput = loginForm.querySelector('input[name="next"]');
    if (!nextInput) {
        nextInput = document.createElement('input');
        nextInput.type = 'hidden';
        nextInput.name = 'next';
        loginForm.appendChild(nextInput);
    }

    // When the modal is shown, set the 'next' value to the current path + query
    loginModal.addEventListener('show.bs.modal', function () {
        nextInput.value = window.location.pathname + window.location.search;
    });
});