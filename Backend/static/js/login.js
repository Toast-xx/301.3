
    const expandBtn = document.getElementById('expandLoginBtn');
    const loginModal = document.getElementById('loginModal');
    const fullPageLogin = document.getElementById('fullPageLogin');

  expandBtn.addEventListener('click', () => {
    // Hide modal
    const modal = bootstrap.Modal.getInstance(loginModal);
    modal.hide();

    // Show full page login
    fullPageLogin.style.display = 'block';
  });
