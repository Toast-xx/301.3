from flask import Flask, render_template, request, jsonify
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import String
from sqlalchemy import Boolean


# Initialize Flask app
app = Flask(__name__)

# Configure PostgreSQL database
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:JaiKaia2549!@localhost:5432/shoe_haven_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Define the Shoes model
class Shoes(db.Model):
    __tablename__ = "Shoes"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Numeric, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    sizes = db.Column(db.String(100), nullable=False)
    model = db.Column(db.String(100), nullable=False)
    style = db.Column(db.String(100), nullable=False)
    brand = db.Column(db.String(100), nullable=False)
    main_image = db.Column(db.Text, nullable=False)
    gallery = db.Column(ARRAY(String))
    featured = db.Column(Boolean, default=False)  # <-- new column


# Routes
@app.route('/')
def home():
    return render_template("home.html")


@app.route('/product/<int:product_id>')
def product(product_id):
    shoe = Shoes.query.get_or_404(product_id)
    return render_template("product.html", shoe=shoe)

@app.route('/productlistings')
def product_listing():
    brand_filter = request.args.get('brand')
    style_filter = request.args.get('style')
    category_filter = request.args.get('category')

    query = Shoes.query

    if brand_filter:
        query = query.filter(Shoes.brand.ilike(brand_filter))
    if style_filter:
        query = query.filter(Shoes.style.ilike(style_filter))
    if category_filter:
        query = query.filter(Shoes.category.ilike(category_filter))

    shoes = query.all()

    products = []
    for i, shoe in enumerate(shoes, start=1):
        products.append({
            "id": f"p{i}",
            "title": shoe.title,
            "price": float(shoe.price),
            "category": shoe.category,
            "sizes": shoe.sizes,
            "model": shoe.model,
            "style": shoe.style,
            "brand": shoe.brand,
            "image": shoe.main_image,
            "featured": shoe.featured,  # ✅ Real DB featured status
        })

    return render_template('productlisting.html', products=products)


@app.route('/api/products')
def api_products():
    shoes = Shoes.query.all()

    result = []
    for shoe in shoes:
        result.append({
            "id": shoe.id,  # ✅ Real DB ID
            "title": shoe.title,
            "price": float(shoe.price),
            "category": shoe.category,
            "sizes": shoe.sizes,
            "model": shoe.model,
            "style": shoe.style,
            "brand": shoe.brand,
            "image": shoe.main_image,
            "featured": shoe.featured,  # ✅ Real DB featured status
        })

    return jsonify(result)

# Run the app
if __name__ == '__main__':
    app.run(debug=True)