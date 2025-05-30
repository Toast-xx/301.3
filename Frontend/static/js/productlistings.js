

// Uncomment below to load products from Flask template variable (when Flask renders the page):
// products = {{ products|tojson|safe }};

/*const staticProducts = [
    { title: "Nike Air Force 1", brand: "Nike", model: "Air Force 1", style: "Lifestyle Shoes", price: 200, category: "men", sizes: [6, 7, 8, 9, 10, 11, 12, 13, 14], image: "https://images.footlocker.com/is/image/FLEU/245345564602_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "Nike Pegasus 41", brand: "Nike", model: "Pegasus 41", style: "Running Shoes", price: 210, category: "men", sizes: [6, 7, 8, 9, 10, 11, 12], image: "https://images.footlocker.com/is/image/FLEU/244209668904_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "Adidas Stan Smith", brand: "Adidas", model: "Stan Smith", style: "Lifestyle Shoes", price: 110, category: "kids", sizes: [5, 6, 7, 8, 9, 10], image: "https://images.footlocker.com/is/image/FLEU/316475371304_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "Vans Authentic", brand: "Vans", model: "Authentic", style: "Skate Shoes", price: 109.99, category: "women", sizes: [5, 6, 7, 8, 9, 10], image: "https://media.hypedc.com/cdn-cgi/image/fit=scale-down,f=auto,w=1280/products/34bd8bd4/vn-0ee3blk_blk_01.jpg" },
    { title: "Etnies Marana", brand: "Etnies", model: "Marana", style: "Skate Shoes", price: 127.99, category: "men", sizes: [6, 7, 8, 9, 10, 11], image: "https://cdn2.n2erp.co.nz/hyp_19sj232-ask2-dfk2-am29-89fkl348fd/images/products/xlarge/d2661f264d044332a2cf_1sgmojtc.sim.webp" },
    { title: "DC Court Graffik", brand: "DC", model: "Court Graffik", style: "Skate Shoes", price: 114.99, category: "men", sizes: [7, 8, 9, 10, 11], image: "https://cdn2.n2erp.co.nz/hyp_19sj232-ask2-dfk2-am29-89fkl348fd/images/products/xlarge/dcshoes0008300927xkg_v15lxmiz.tfu.jpg" },
    { title: "New Balance 574", brand: "New Balance", model: "574", style: "Running Shoes", price: 170, category: "men", sizes: [7, 8, 9, 10, 11, 12, 13], image: "https://images.footlocker.com/is/image/FLEU/245240893502_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "Converse Chuck Taylor All Star Top", brand: "Converse", model: "Chuck Taylor All Star Top", style: "Lifestyle Shoes", price: 130, category: "men", sizes: [6, 7, 8, 9, 10, 11], image: "https://images.footlocker.com/is/image/FLEU/285550062702_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "Puma RS-X DRIFT PRM", brand: "Puma", model: "RS-X DRIFT PRM", style: "Lifestyle Shoes", price: 220, category: "men", sizes: [7, 8, 9, 10, 11, 12], image: "https://images.footlocker.com/is/image/FLEU/244205134604_01?wid=500&hei=500&fmt=png-alpha" },
    { title: "Reebok Classic Leather", brand: "Reebok", model: "Classic Leather", style: "Lifestyle Shoes", price: 170, category: "men", sizes: [7, 8, 9, 10, 11, 12], image: "https://media.hypedc.com/cdn-cgi/image/fit=scale-down,f=auto,w=1024/products/d3682d6e-e7cd-4a8e-95c9-a318175e19cd/gy0952_1_footwear_photography_side-lateral-center-view_white.jpg" },
 
];*/
async function fetchProducts() {
    try {
        const response = await fetch('static/data/products.json');z  // adjust path if needed
        if (!response.ok) throw new Error('Failed to load products JSON');

        const products = await response.json();
        displayProducts(products);
    } catch (err) {
        console.error(err);
        document.getElementById('product-list').innerHTML = '<p class="text-danger">Failed to load products.</p>';
    }
}

function displayProducts(products) {
    const container = document.getElementById('product-list');
    container.innerHTML = ''; // Clear existing content

    products.forEach(product => {
        const productHTML = `
      <div class="col-sm-6 col-md-4 col-lg-3 mb-4">
        <div class="card h-100 shadow-sm">
          <img src="${product.image}" class="card-img-top" alt="${product.model}" />
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${product.brand} ${product.model}</h5>
            <p class="card-text text-muted">${product.style}</p>
            <p class="card-text">Color: ${product.color}</p>
            <p class="card-text fw-bold">$${product.price}</p>
            <button class="btn btn-primary mt-auto">Add to Cart</button>
          </div>
        </div>
      </div>
    `;
        container.insertAdjacentHTML('beforeend', productHTML);
    });
}

// Run fetchProducts on page load
window.addEventListener('DOMContentLoaded', fetchProducts);