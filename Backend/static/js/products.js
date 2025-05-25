
    const relatedProducts = [
        { title: "Nike Air Force 1 '07 Essentials", price: "$199.95", img: "https://culture-kings-nz.imgix.net/files/05012794-YX437_default_0040.jpg?v=1743116764&fit=crop&h=1000&w=800&auto=compress,format", link: "product1.html" },
        { title: "Nike Air Force 1 '07 Essentials", price: "$199.95", img: "https://culture-kings-nz.imgix.net/files/05012795-YW179_default_0040.jpg?v=1739316673&fit=crop&h=1000&w=800&auto=compress,format", link: "product2.html" },
        { title: "Nike Air Force '07 LV8", price: "$219.95", img: "https://culture-kings-nz.imgix.net/files/05012068-YP744_default_0040.jpg?v=1724203382&fit=crop&h=1000&w=800&auto=compress,format", link: "product3.html" },
        { title: "Air Force 1 '07 LV8 Brogue", price: "$219.95", img: "https://culture-kings-nz.imgix.net/files/05011689-YX782_default_0040.jpg?v=1717115045&fit=crop&h=1000&w=800&auto=compress,format", link: "product4.html" },
        { title: "Air Force 1 '07 Texture Carbon Fibre", price: "$219.95", img: "https://culture-kings-nz.imgix.net/files/05012799-YW240_default_0040.jpg?v=1743720068&fit=crop&h=1000&w=800&auto=compress,format", link: "product5.html" }
];
// -- Uncomment this block for Flask integration later --
// Flask will inject JSON string here and we parse it to JS object
// const relatedProducts = JSON.parse('{{ related_products_json | tojson | safe }}');

    const container = document.querySelector(".d-flex.overflow-auto");

    relatedProducts.forEach(p => {
        container.innerHTML += `
        <div class="card" style="min-width: 200px;">
            <a href="${p.link}" class="text-decoration-none text-dark">
                <img src="${p.img}" class="card-img-top" alt="${p.title}">
                <div class="card-body text-center">
                    <h6 class="card-title mb-1">${p.title}</h6>
                    <p class="text-danger mb-0">${p.price}</p>
                </div>
            </a>
        </div>`;
    });
// Map of color options to product details
const productVariants = {
    "white/black": {
        img: "https://culture-kings-nz.imgix.net/files/05008948-YW986_default_0010.jpg?v=1743984723&fit=crop&h=1000&w=800&auto=compress,format",
        title: "Nike Air Force 1 '07 - White/Black",
        price: "$115.00"
    },
    "black/white": {
        img: "https://culture-kings-nz.imgix.net/files/194499062899_default_0010.jpg?v=1698299819&fit=crop&h=1000&w=800&auto=compress,format",
        title: "Nike Air Force 1 '07 - Black/White",
        price: "$115.00"
    },
    "black": {
        img: "https://culture-kings-nz.imgix.net/files/194954083278_default_0010.jpg?v=1705956928&fit=crop&h=1000&w=800&auto=compress,format",
        title: "Nike Air Force 1 '07 - Black",
        price: "$115.00"
    },
    "tan/brown": {
        img: "https://culture-kings-nz.imgix.net/files/05013129-YP276_default_0010.jpg?v=1745893567&fit=crop&h=1000&w=800&auto=compress,format",
        title: "Nike Air Force 1 '07 - Tan/Brown",
        price: "$115.00"
    },
    "panda": {
        img: "https://culture-kings-nz.imgix.net/files/196153294493_default_0010.jpg?v=1722898025&fit=crop&h=1000&w=800&auto=compress,format",
        title: "Nike Air Force 1 '07 - Panda",
        price: "$115.00"
    }
};

// Handle color thumbnail click
document.querySelectorAll('.color-option').forEach(img => {
    img.addEventListener('click', () => {
        const color = img.dataset.color;
        const variant = productVariants[color];

        if (variant) {
            document.getElementById("main-shoe-img").src = variant.img;
            document.getElementById("product-title").textContent = variant.title;
            document.getElementById("product-price").textContent = variant.price;
        }
    });
});
// Handle thumbnail click to update main image
document.querySelectorAll('.thumbnail').forEach(thumb => {
    thumb.addEventListener('click', () => {
        const largeImg = thumb.getAttribute('data-large');
        if (largeImg) {
            document.getElementById('main-shoe-img').src = largeImg;

            // Optional: highlight active thumbnail
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('border-primary'));
            thumb.classList.add('border-primary');
        }
    });
});

  

