// Add click event listeners to all size buttons
document.querySelectorAll('.size-button').forEach(swatch => {
    swatch.addEventListener('click', function () {
        // Remove 'active' class from all size buttons
        document.querySelectorAll('.size-button').forEach(btn => {
            btn.classList.remove('active');
        });

        // Add 'active' class to the clicked button
        this.classList.add('active');

        // Get the selected size and log it for debugging
        const selectedSize = this.textContent;
        console.log('Selected size:', selectedSize);
    });
});

// Add click event listeners to all "Add to Cart" buttons
document.querySelectorAll('.btn.btn-dark.mt-4.w-100').forEach(button => {
    button.addEventListener('click', () => {
        // Find the closest card element to the clicked button
        const card = button.closest('.card');
        // Get the selected size from the active size button within the card
        const selectedSize = card.querySelector('.size-button.active')?.textContent;

        // If no size is selected, alert the user and do not proceed
        if (!selectedSize) {
            alert('Please select a size before adding to cart.');
            return;
        }

        // Log the add-to-cart action for debugging
        console.log('Adding to cart with:', {
            size: selectedSize,
        });

        // Show a confirmation alert to the user
        alert(`Added to cart with size ${selectedSize}`);
    });
});