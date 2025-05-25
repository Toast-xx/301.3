from flask import Flask, render_template, jsonify
import json
import os

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/productlisting')
def product_listing():
    return render_template('productlisting.html')

@app.route('/api/products')
def get_products():
    # Load products from JSON file
    products_path = os.path.join(app.static_folder, 'data', 'products.json')
    with open(products_path, 'r') as f:
        products = json.load(f)
    return jsonify(products)

if __name__ == '__main__':
    app.run(debug=True)
