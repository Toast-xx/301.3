// static/js/productlistings.js

const products = [
    { title: "Nike Air Force 1", price: 200, image: "https://images.footlocker.com/is/image/FLEU/245345564602_01?wid=500&hei=500&fmt=png-alpha" }, 
    { title: "Nike Air Max 90", price: 180, image: "https://images.footlocker.com/is/image/FLEU/316705439004_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "Nike Air Max 270", price: 200, image:"https://images.footlocker.com/is/image/FLEU/316706357304_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "Nike Air Jordan", price: 210, image: "https://images.footlocker.com/is/image/FLEU/244105340004_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "Nike Dunk Low Retro", price: 190, image:"https://images.footlocker.com/is/image/FLEU/284105238204_01?wid=500&hei=500&fmt=png-alpha"},
    { title: "Nike Pegasus 41", price: 210, image:"https://images.footlocker.com/is/image/FLEU/244209668904_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "Adidas Samba OG", price: 200, image:"https://images.footlocker.com/is/image/FLEU/285346321602_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "Adidas Gazelle", price: 100, image:"https://images.footlocker.com/is/image/FLEU/246486299204_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "Adidas Stan Smith", price: 110, image:"https://images.footlocker.com/is/image/FLEU/316475371304_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "Adidas Superstar II", price: 190, image:"https://images.footlocker.com/is/image/FLEU/284310601204_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "Vans Old Skool", price: 139.99, image:"https://media.hypedc.com/cdn-cgi/image/fit=scale-down,f=auto,w=1280/products/2641c090/vn-0d3hy28_blk_01.jpg" },
    { title: "Vans Authentic", price: 109.99, image:"https://media.hypedc.com/cdn-cgi/image/fit=scale-down,f=auto,w=1280/products/34bd8bd4/vn-0ee3blk_blk_01.jpg" },
    { title: "Vans Sk8-Hi", price: 149.99, image:"https://media.hypedc.com/cdn-cgi/image/fit=scale-down,f=auto,w=1280/products/0e33818e/vn-0d5ib8c_blk_01.jpg" },
    { title: "Vans Slip-On", price: 79.99, image:"https://media.hypedc.com/cdn-cgi/image/fit=scale-down,f=auto,w=1280/products/a3de3ac4/vn00ubsarv_lav_01.jpg" },
    { title: "Etnies Marana", price: 127.99, image:"https://cdn2.n2erp.co.nz/hyp_19sj232-ask2-dfk2-am29-89fkl348fd/images/products/xlarge/d2661f264d044332a2cf_1sgmojtc.sim.webp" },
    { title: "Etnies Jameson Eco", price: 112.99, image:"https://cdn2.n2erp.co.nz/hyp_19sj232-ask2-dfk2-am29-89fkl348fd/images/products/xlarge/etnies0017lev4101000_n5aqv4ly.yva.jpg" },
    { title: "Etnies Scout XT", price: 104.99, image:"https://cdn2.n2erp.co.nz/hyp_19sj232-ask2-dfk2-am29-89fkl348fd/images/products/xlarge/etnies0004etnies-sco_11jqms2p.uac.jpg" },
    { title: "DC Court Graffik", price: 114.99, image:"https://cdn2.n2erp.co.nz/hyp_19sj232-ask2-dfk2-am29-89fkl348fd/images/products/xlarge/dcshoes0008300927xkg_v15lxmiz.tfu.jpg" },
    { title: "DC Lynx OG", price: 179.99, image:"https://cdn2.n2erp.co.nz/hyp_19sj232-ask2-dfk2-am29-89fkl348fd/images/products/xlarge/dcshoeslynxogshoeswh_iox3ti3e.pp5.jpg" },
    { title: "DC Manteca 4", price: 115.99, image:"https://cdn2.n2erp.co.nz/hyp_19sj232-ask2-dfk2-am29-89fkl348fd/images/products/xlarge/manteca4greenwhiteye_uz5s1ges.tbm.jpg" },
    { title: "New Balance 574", price: 170, image:"https://images.footlocker.com/is/image/FLEU/245240893502_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "New Balance 327", price: 180, image:"https://images.footlocker.com/is/image/FLEU/245240788702_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "New Balance 9060", price: 160, image:"https://images.footlocker.com/is/image/FLEU/246782582204_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "Converse Chuck Taylor All Star Top", price: 130, image:"https://images.footlocker.com/is/image/FLEU/285550062702_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "Converse Chuck 70 Low", price: 149.99, image:"https://media.hypedc.com/cdn-cgi/image/fit=scale-down,f=auto,w=1280/products/4456c267/162058_blk_01.jpg" },
    { title: "Dr. Martens 1460", price: 369.99, image:"https://www.boutiqueretailer.com.au/cdn/shop/files/DRM-1460ZNP_4512659a-6bd6-4f13-b4e6-bdda170b1425.jpg?v=1738333620&width=1214" },
    { title: "Dr. Martens 101", price: 267.00, image:"https://www.boutiqueretailer.com.au/cdn/shop/files/ARC_22701001_BLK-UK10.png?v=1742912547&width=1214" },
    { title: "Puma RS-X DRIFT PRM", price: 220, image:"https://images.footlocker.com/is/image/FLEU/244205134604_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "Reebok Classic Leather", price: 170, image:"https://media.hypedc.com/cdn-cgi/image/fit=scale-down,f=auto,w=1024/products/d3682d6e-e7cd-4a8e-95c9-a318175e19cd/gy0952_1_footwear_photography_side-lateral-center-view_white.jpg"},
    { title: "Reebok Club C 85", price: 170, image:"https://media.hypedc.com/cdn-cgi/image/fit=scale-down,f=auto,w=1280/products/cbbcf556/ar0459_wht_01.jpg" },
   
   
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
                    <img src="${product.image || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${product.title}" class="img-fluid">
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
