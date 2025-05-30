const imageVariants = {
    // {% for variant in product.variants %}
    // "{{ variant.color }}": {
    //     mainImg: "{{ variant.main_img_url }}",
    //     thumbnails: [
    //         {% for img in variant.thumbnail_urls %}"{{ img }}"{% if not loop.last %}, {% endif %}{% endfor %}
    //     ],
    //     title: "{{ variant.title }}",
    //     price: "{{ variant.price }}"
    // },
    // {% endfor %}
    "white": {
        mainImg: "static\images\Nike Air Force 1 '07-White_Men.webp",
        thumbnails: [
            "",
            "",
            "https://culture-kings-nz.imgix.net/files/05006169-YW240_default_0023.jpg?v=1737503187&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/05006169-YW240_default_0024.jpg?v=1737503187&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/05006169-YW240_default_0025.jpg?v=1737503187&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/05006169-YW240_default_0026.jpg?v=1737503187&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/05006169-YW240_default_0027.jpg?v=1737503187&auto=compress,format"
        ],
        title: "Nike Air Force 1 '07 - White/Black",
        price: "$115.00"
    },
    "white/black": {
        mainImg: "https://culture-kings-nz.imgix.net/files/05008948-YW986_default_0010.jpg?v=1743984723&fit=crop&h=1000&w=800&auto=compress,format",
        thumbnails: [
            "https://culture-kings-nz.imgix.net/files/05008948-YW986_default_0010.jpg?v=1743984723&fit=crop&h=1000&w=800&auto=compress,format",
            "https://images.footlocker.com/is/image/FLEU/314102199404_02?wid=500&hei=500&fmt=png-alpha",
            "https://images.footlocker.com/is/image/FLEU/314102199404_03?wid=500&hei=500&fmt=png-alpha",
            "https://images.footlocker.com/is/image/FLEU/314102199404_04?wid=500&hei=500&fmt=png-alpha",
            "https://images.footlocker.com/is/image/FLEU/314102199404_05?wid=500&hei=500&fmt=png-alpha",
            "https://images.footlocker.com/is/image/FLEU/314102199404_06?wid=500&hei=500&fmt=png-alpha",
            "https://images.footlocker.com/is/image/FLEU/314102199404_07?wid=500&hei=500&fmt=png-alpha"
        ],
        title: "Nike Air Force 1 '07 - White/Black",
        price: "$115.00"
    },
    "black/white": {
        mainImg: "https://culture-kings-nz.imgix.net/files/194499062899_default_0010.jpg?v=1698299819&fit=crop&h=1000&w=800&auto=compress,format",
        thumbnails: [
            "https://culture-kings-nz.imgix.net/files/194499062899_default_0020.jpg?v=1698299822&fit=crop&h=1000&w=800&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/194499062899_default_0030.jpg?v=1698299820&fit=crop&h=1000&w=800&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/194499062899_default_0040.jpg?v=1698299821&fit=crop&h=1000&w=800&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/194499062899_default_0050.jpg?v=1698299820&fit=crop&h=1000&w=800&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/194499062899_default_0060.jpg?v=1698299820&fit=crop&h=1000&w=800&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/194499062899_default_0070.jpg?v=1698299822&fit=crop&h=1000&w=800&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/194499062899_default_0080.jpg?v=1698299821&fit=crop&h=1000&w=800&auto=compress,format"
        ],
        title: "Nike Air Force 1 '07 - Black/White",
        price: "$115.00"
    },
    "black": {
        mainImg: "https://culture-kings-nz.imgix.net/files/194500874725_default_0010_add4e395-f232-484c-95d8-01ef01927772.jpg?v=1721366399&fit=crop&h=1000&w=800&auto=compress,format",
        thumbnails: [
            "https://culture-kings-nz.imgix.net/files/194500874725_default_0020.jpg?v=1721366398&fit=crop&h=1000&w=800&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/194500874725_default_0030.jpg?v=1721366399&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/194500874725_default_0040.jpg?v=1721366399&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/194500874725_default_0050.jpg?v=1721366398&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/194500874725_default_0060.jpg?v=1721366398&auto=compress,format"
        ],
        title: "Nike Air Force 1 '07 - Black",
        price: "$115.00"
    },
     "tan/brown": {
         mainImg: "https://culture-kings-nz.imgix.net/files/05013129-YP276_default_0010.jpg?v=1745893567&fit=crop&h=1000&w=800&auto=compress,format",
        thumbnails: [
            "https://culture-kings-nz.imgix.net/files/05013129-YP276_default_0020.jpg?v=1745893567&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/05013129-YP276_default_0030.jpg?v=1745893567&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/05013129-YP276_default_0040.jpg?v=1745893567&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/05013129-YP276_default_0050.jpg?v=1745893567&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/05013129-YP276_default_0060.jpg?v=1745893567&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/05013129-YP276_default_0070.jpg?v=1745893567&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/05013129-YP276_default_0080.jpg?v=1745893567&auto=compress,format"
        ],
        title: "Nike Air Force 1 '07 - Tan/Brown",
        price: "$115.00"
    },
     "panda": {
         mainImg: "https://culture-kings-nz.imgix.net/files/196153294493_default_0010.jpg?v=1722898025&fit=crop&h=1000&w=800&auto=compress,format",
        thumbnails: [
            "https://culture-kings-nz.imgix.net/files/196153294493_default_0020.jpg?v=1722898025&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/196153294493_default_0030.jpg?v=1722898025&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/196153294493_default_0040.jpg?v=1722898025&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/196153294493_default_0050.jpg?v=1722898025&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/196153294493_default_0065.jpg?v=1722898025&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/196153294493_default_0070.jpg?v=1722898025&auto=compress,format",
            "https://culture-kings-nz.imgix.net/files/196153294493_default_0080.jpg?v=1722898025&auto=compress,format"
        ],
        title: "Nike Air Force 1 '07 - Panda",
        price: "$115.00"
    }
};

function setupProductImages() {
    const mainImg = document.getElementById('main-shoe-img');
    const thumbnailsContainer = document.getElementById('thumbnails-container');
    const productTitle = document.getElementById('product-title');
    const productPrice = document.getElementById('product-price');

    function renderThumbnails(thumbnails) {
        thumbnailsContainer.innerHTML = '';
        thumbnails.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.className = 'thumbnail img-thumbnail me-2 mb-2';
            img.style.width = '60px';
            img.style.height = '60px';
            img.style.cursor = 'pointer';
            thumbnailsContainer.appendChild(img);

            img.addEventListener('click', () => {
                mainImg.src = src;
                document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('border-primary'));
                img.classList.add('border-primary');
            });
        });
    }

    document.querySelectorAll('.color-option').forEach(img => {
        img.addEventListener('click', () => {
            const color = img.dataset.color;
            const variant = imageVariants[color];
            if (variant) {
                mainImg.src = variant.mainImg;
                productTitle.textContent = variant.title;
                productPrice.textContent = variant.price;
                renderThumbnails(variant.thumbnails);
            }
        });
    });

    // Initial load
   
    if (imageVariants[defaultColor]) {
        // const defaultColor = '{{ product.default_color }}';
        const defaultColor = 'white/black'; // fallback for now
        const variant = imageVariants[defaultColor];
        mainImg.src = variant.mainImg;
        productTitle.textContent = variant.title;
        productPrice.textContent = variant.price;
        renderThumbnails(variant.thumbnails);
    }
}

document.addEventListener('DOMContentLoaded', setupProductImages);
