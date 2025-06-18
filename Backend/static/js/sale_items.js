
         document.querySelectorAll('.size-button').forEach(swatch => {
        swatch.addEventListener('click', function () {

            document.querySelectorAll('.size-button').forEach(btn => {
                btn.classList.remove('active');
            });

            this.classList.add('active');

            const selectedSize = this.textContent;
            console.log('Selected size:', selectedSize);

        });
});

document.querySelectorAll('.btn.btn-dark.mt-4.w-100').forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.card');
            const selectedSize = card.querySelector('.size-button.active')?.textContent;

            if (!selectedSize) {
                alert('Please select a size before adding to cart.');
                return;
            }

            console.log('Adding to cart with:', {
                size: selectedSize,
            });

            alert(`Added to cart with size ${selectedSize}`);
        });
});


