from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash 
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import String, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.mutable import MutableDict
from werkzeug.security import generate_password_hash, check_password_hash
import os
from dotenv import load_dotenv
import logging

load_dotenv()

# Initialize Flask app
app = Flask(__name__)


# Configure logging to DEBUG level
logging.basicConfig(level=logging.DEBUG)

# Secret key for session management 
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'fallback-default-key')

# PostgreSQL configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:JaiKaia2549!@localhost:5432/shoe_haven_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Shoe model
class Shoes(db.Model):
    __tablename__ = "Shoes"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Numeric, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    sizes = db.Column(db.String(100), nullable=False)  # Stored as comma-separated string
    model = db.Column(db.String(100), nullable=False)
    style = db.Column(db.String(100), nullable=False)
    brand = db.Column(db.String(100), nullable=False)
    main_image = db.Column(db.Text, nullable=False)
    gallery = db.Column(ARRAY(String))  # PostgreSQL ARRAY of image URLs
    featured = db.Column(Boolean, default=False)
    related_ids = db.Column(db.String)  # Stored as comma-separated IDs
    variants = db.Column(MutableDict.as_mutable(JSONB), default={})
    description = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f"<Shoe {self.id} - {self.title}>"

# User model
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(255))
    password = db.Column(db.String(512), nullable=False)

    def __repr__(self):
        return f"<User {self.email}>"

@app.route('/')
def home():
    print("Session:", session) 
    return render_template("home.html")

@app.route('/productlistings')
def product_listing():
    brand_filter = request.args.get('brand')
    style_filter = request.args.get('style')
    category_filter = request.args.get('category')

    query = Shoes.query
    if brand_filter:
        app.logger.debug(f"Filtering by brand: {brand_filter}")
        query = query.filter(Shoes.brand.ilike(f'%{brand_filter}%'))
    if style_filter:
        app.logger.debug(f"Filtering by style: {style_filter}")
        query = query.filter(Shoes.style.ilike(f'%{style_filter}%'))
    if category_filter:
        app.logger.debug(f"Filtering by category: {category_filter}")
        query = query.filter(Shoes.category.ilike(f'%{category_filter}%'))

    shoes = query.all()
    app.logger.debug(f"Found {len(shoes)} shoes after filtering")

    products = []
    for shoe in shoes:
        products.append({
            "id": shoe.id,
            "title": shoe.title,
            "price": float(shoe.price),
            "category": shoe.category,
            "sizes": shoe.sizes,
            "model": shoe.model,
            "style": shoe.style,
            "brand": shoe.brand,
            "image": shoe.main_image,
            "featured": shoe.featured,
        })

    return render_template('productlisting.html', products=products)

@app.route('/product.html')
def product_page():
    shoe_id = request.args.get('id', type=int)
    app.logger.debug(f"Accessing product page with id={shoe_id}")
    if not shoe_id:
        app.logger.error("No product ID provided in query string")
        return "No product ID provided", 400

    shoe = Shoes.query.get(shoe_id)
    if not shoe:
        app.logger.warning(f"Product with id={shoe_id} not found")
        return "Product not found", 404

    app.logger.info(f"Rendering product page for shoe: {shoe}")

    return render_template('product.html', shoe=shoe)

@app.route('/api/product/<int:shoe_id>')
def get_product(shoe_id):
    app.logger.info(f"API request for product with shoe_id={shoe_id}")
    shoe = Shoes.query.get(shoe_id)

    if not shoe:
        app.logger.warning(f"Product with id={shoe_id} not found")
        return render_template('404.html'), 404  # Return a 404 page or any error page

    products = {
        "id": shoe.id,
        "title": shoe.title,
        "price": float(shoe.price),
        "description": shoe.description or "",
        "sizes": shoe.sizes.split(',') if shoe.sizes else [],
        "main_image": shoe.main_image,
        "thumbnails": [{"src": img_url, "alt": f"{shoe.title} thumbnail"} for img_url in (shoe.gallery or [])],
        "variants": shoe.variants or {}
    }
 
    return jsonify(products)

@app.route('/add-to-cart', methods=['POST'])
def add_to_cart():
    data = request.get_json()
    app.logger.debug(f"Add to Cart Request: {data}")

    product_id = data.get("id")
    size = data.get("size")
    quantity = data.get("quantity", 1)

    if not product_id or not size:
        app.logger.error("Missing product ID or size in Add to Cart")
        return jsonify({"error": "Missing product ID or size"}), 400
    
    # Initialize cart in session if not present
    if 'cart' not in session:
        session['cart'] = []

        # Add item to cart
    cart = session['cart']
    cart.append({
        "id": product_id,
        "size": size,
        "quantity": quantity
    })
    session['cart'] = cart  # Update session
    
    return jsonify({
        "message": "Product added to cart",
        "id": product_id,
        "size": size,
        "quantity": quantity
    }), 200

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        new_user = User(
            first_name=request.form['first_name'],
            last_name=request.form['last_name'],
            email=request.form['email'],
            phone=request.form['phone'],
            address=request.form['address'],
            password=generate_password_hash(request.form['password']),
        )
        db.session.add(new_user)
        db.session.commit()
        flash('Registration successful! Please log in.', 'success')
        return redirect(url_for('login'))  # Redirect to login page after registration

    return render_template('register.html')
# ========== LOGIN ==========
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')

        user = User.query.filter_by(email=email).first()
        if user:
            app.logger.debug(f"User found for email: {email}")
            if check_password_hash(user.password, password):
                session['user_id'] = user.id
                session['user_email'] = user.email
                app.logger.info(f"User {email} logged in successfully.")
                flash('Logged in successfully!', 'success')
                return redirect(url_for('home'))
            else:
                app.logger.warning(f"Password mismatch for user: {email}")
        else:
            app.logger.warning(f"No user found for email: {email}")

        flash('Invalid email or password', 'danger')
        return redirect(url_for('home'))

    # For GET requests, just render the home page (modal will be shown by JS if needed)
    return render_template('home.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('home'))


@app.context_processor
def inject_user():
    email = session.get('user_email')
    return {
        "user_email": email,
        
    }


@app.route('/api/products')
def api_products():
    shoes = Shoes.query.all()
    app.logger.debug(f"Returning all products: count={len(shoes)}")
    result = [{
        "id": shoe.id,
        "title": shoe.title,
        "price": float(shoe.price),
        "category": shoe.category,
        "sizes": shoe.sizes,
        "model": shoe.model,
        "style": shoe.style,
        "brand": shoe.brand,
        "image": shoe.main_image,
        "featured": shoe.featured,
    } for shoe in shoes]
    return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True)
