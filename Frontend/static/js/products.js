
    const relatedProducts = [
    {title: "Running Shoes", price: "$89.99", img: "https://via.placeholder.com/200x150", link: "product1.html" },
    {title: "High-Top Sneakers", price: "$74.99", img: "https://via.placeholder.com/200x150", link: "product2.html" },
    {title: "Leather Boots", price: "$129.99", img: "https://via.placeholder.com/200x150", link: "product3.html" },
    {title: "Slip-Ons", price: "$54.99", img: "https://via.placeholder.com/200x150", link: "product4.html" },
    {title: "Sports Trainers", price: "$69.99", img: "https://via.placeholder.com/200x150", link: "product5.html" }
    ];

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

