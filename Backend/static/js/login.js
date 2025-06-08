const loginModal = document.getElementById('loginModal');

if (loginModal) {
    const modal = bootstrap.Modal.getInstance(loginModal);
    if (modal) {
        modal.hide(); // This safely hides it
    }
}
