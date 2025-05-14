// static/js/productlistings.js

const products = [
    { title: "Nike Air Force 1", price: 90 },
    { title: "Nike Air Max 90", price: 110 },
    { title: "Nike Air Max 95", price: 120 },
    { title: "Nike Air Jordan", price: 150 },
    { title: "Nike Dunk", price: 100 },
    { title: "Nike Pegasus", price: 95 },
    { title: "Adidas Samba", price: 85 },
    { title: "Adidas Gazelle", price: 90 },
    { title: "Adidas Stan Smith", price: 95 },
    { title: "Adidas Ultraboost", price: 140 },
    { title: "Adidas Superstar", price: 100 },
    { title: "Vans Old Skool", price: 70 },
    { title: "Vans Authentic", price: 65 },
    { title: "Vans Sk8-Hi", price: 80 },
    { title: "Vans Slip-On", price: 60 },
    { title: "Etnies Marana", price: 75 },
    { title: "Etnies Jameson", price: 70 },
    { title: "Etnies Scout", price: 65 },
    { title: "DC Court Graffik", price: 80 },
    { title: "DC Lynx OG", price: 90 },
    { title: "DC Manteca", price: 85 },
    { title: "Skechers GOwalk", price: 75 },
    { title: "Skechers D'Lites", price: 85 },
    { title: "Skechers Arch Fit", price: 95 },
    { title: "New Balance 574", price: 80 },
    { title: "New Balance 990", price: 140 },
    { title: "New Balance 9060", price: 150 },
    { title: "Converse Chuck Taylor All Star", price: 65 },
    { title: "Converse Chuck 70", price: 85 },
    { title: "Converse One Star", price: 70 },
    { title: "Dr. Martens 1460", price: 150 },
    { title: "Dr. Martens 2976", price: 160 },
    { title: "Dr. Martens 101", price: 140 },
    { title: "Puma Suede Classic", price: 75 },
    { title: "Puma RS-X", price: 110 },
    { title: "Puma Clyde", price: 85 },
    { title: "Reebok Classic Leather", price: 80 },
    { title: "Reebok Club C", price: 75 },
    { title: "Reebok Nano", price: 130 },
    { title: "Crocs Classic Clog", price: 45 },
    { title: "Crocs Mellow Slide", price: 50 },
    { title: "Crocs Brooklyn Low Wedge", price: 55 }
];

const productsPerPage = 12;
let currentPage = 1;

function renderProducts() {
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const container = document.getElementById('product-list');
    let cardsHtml = '';

    products.slice(start, end).forEach(product => {
        cardsHtml += `
            <div class="col-md-3 mb-4">
                <div class="product-card">
                    <img src="https://via.placeholder.com/300x200?text=No+Image" alt="${product.title}">
                    <div class="card-body">
                        <h5 class="card-title">${product.title}</h5>
                        <p class="card-text">NZD $${product.price.toFixed(2)}</p>
                        <a href="#" class="btn-buy">Buy Now</a>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = cardsHtml;
    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(products.length / productsPerPage);
    const pagination = document.getElementById('pagination');
    let buttons = '';

    buttons += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <button class="page-link" onclick="goToPage(${currentPage - 1})">Previous</button>
        </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
        buttons += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <button class="page-link" onclick="goToPage(${i})">${i}</button>
            </li>
        `;
    }

    buttons += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <button class="page-link" onclick="goToPage(${currentPage + 1})">Next</button>
        </li>
    `;

    pagination.innerHTML = buttons;
}

function goToPage(page) {
    const totalPages = Math.ceil(products.length / productsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderProducts();
    }
}

document.addEventListener("DOMContentLoaded", renderProducts);
