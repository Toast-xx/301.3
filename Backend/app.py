from flask import Flask, render_template, jsonify, request

import json
import os

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/productlistings')
def product_listing():
    brand_filter = request.args.get('brand')
    style_filter = request.args.get('styles')
    category_filter = request.args.get('category')

    products_path = os.path.join(app.static_folder, 'data', 'products.json')
    with open(products_path, 'r') as f:
        products = json.load(f)

    if brand_filter or style_filter or category_filter:
        products = [
            p for p in products
            if (not brand_filter or p['brand'].lower() == brand_filter.lower()) and
               (not style_filter or p['style'].lower() == style_filter.lower()) and
               (not category_filter or p.get('category')and p.get('category').lower() == category_filter.lower())
        ]

    return render_template('productlisting.html', products=products)

 
@app.route('/api/products')
def api_products():
    products_path = os.path.join(app.static_folder, 'data', 'products.json')
    with open(products_path, 'r') as f:
        products = json.load(f)
    return jsonify(products)


if __name__ == '__main__':
    app.run(debug=True)
