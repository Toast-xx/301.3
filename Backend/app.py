from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash, send_file  # Import Flask and related modules
from flask_sqlalchemy import SQLAlchemy  # Import SQLAlchemy for ORM
from flask_migrate import Migrate  # Import Flask-Migrate for migrations
from sqlalchemy.dialects.postgresql import ARRAY  # Import ARRAY type for PostgreSQL
from sqlalchemy import String, Boolean, or_, cast  # Import SQLAlchemy types and helpers
from sqlalchemy.dialects.postgresql import JSONB  # Import JSONB type for PostgreSQL
from sqlalchemy.ext.mutable import MutableDict  # Import MutableDict for mutable JSON columns
from werkzeug.security import generate_password_hash, check_password_hash  # Import password hashing utilities
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user  # Import Flask-Login for user session management
from urllib.parse import urlparse, urljoin  # Import URL parsing utilities
from dotenv import load_dotenv  # Import dotenv to load environment variables
from datetime import datetime, date, timedelta  # Import date/time utilities
from weasyprint import HTML  # Import WeasyPrint for PDF generation
from decimal import Decimal  # Import Decimal for precise currency calculations
import os  # Import os for environment variable access
import logging  # Import logging for application logging
import json  # Import json for JSON handling
import stripe  # Import Stripe for payment processing
import io  # Import io for in-memory file operations


# --- Flask-Mail configuration ---
from flask_mail import Mail, Message  # Import Flask-Mail for email sending

load_dotenv()  # Load environment variables from .env file

# Initialize Flask app
app = Flask(__name__)  # Create Flask application instance

# Configure logging to DEBUG level
logging.basicConfig(level=logging.DEBUG)  # Set logging level to DEBUG

# Secret key for session management 
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'fallback-default-key')  # Set secret key for sessions

# PostgreSQL configuration
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:IylaRosa2549!@shoe-haven-db.czocwcgkqw0k.ap-northeast-2.rds.amazonaws.com:5432/shoe_haven_db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Disable SQLAlchemy modification tracking

# Stripe configuration
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', 'sk_test_...')  # Set Stripe secret key

# --- Flask-Mail configuration ---
app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # Set mail server
app.config['MAIL_PORT'] = 587  # Set mail port
app.config['MAIL_USE_TLS'] = True  # Enable TLS for email
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')  # Set mail username from env
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')  # Set mail password from env
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER')  # Set default sender

mail = Mail(app)  # Initialize Flask-Mail

# Extensions
db = SQLAlchemy(app)  # Initialize SQLAlchemy
migrate = Migrate(app, db)  # Initialize Flask-Migrate

# Flask-Login setup
login_manager = LoginManager(app)  # Initialize Flask-Login
login_manager.login_view = 'login'  # Set login view

# User loader for Flask-Login
@login_manager.user_loader  # Decorator to register user loader
def load_user(user_id):  # Function to load user by ID
    return User.query.get(int(user_id))  # Query user from database

# Helper to check if a URL is safe for redirects
def is_safe_url(target):  # Function to check if URL is safe
    ref_url = urlparse(request.host_url)  # Parse host URL
    test_url = urlparse(urljoin(request.host_url, target))  # Parse target URL
    return test_url.scheme in ('http', 'https') and ref_url.netloc == test_url.netloc  # Check scheme and netloc

# --- UTF-8 Data Sanitization Helper ---
def ensure_utf8(obj):  # Function to ensure UTF-8 encoding
    if isinstance(obj, str):  # If object is string
        return obj.encode('utf-8', errors='replace').decode('utf-8')  # Encode and decode as UTF-8
    if isinstance(obj, list):  # If object is list
        return [ensure_utf8(x) for x in obj]  # Recursively ensure UTF-8 for list items
    if isinstance(obj, dict):  # If object is dict
        return {k: ensure_utf8(v) for k, v in obj.items()}  # Recursively ensure UTF-8 for dict values
    if hasattr(obj, '__table__'):  # If object is SQLAlchemy model
        data = {}  # Create data dict
        for col in obj.__table__.columns:  # For each column
            val = getattr(obj, col.name)  # Get column value
            data[col.name] = ensure_utf8(val)  # Ensure UTF-8 for value
        return type(obj)(**data)  # Return new instance with sanitized data
    return obj  # Return object as is

# Shoe model
class Shoes(db.Model):  # Define Shoes model
    __tablename__ = "Shoes"  # Set table name

    id = db.Column(db.Integer, primary_key=True)  # Primary key
    title = db.Column(db.String(100), nullable=False)  # Shoe title
    price = db.Column(db.Numeric, nullable=False)  # Shoe price
    category = db.Column(db.String(100), nullable=False)  # Shoe category
    sizes = db.Column(db.String(100), nullable=False)  # Shoe sizes as comma-separated string
    model = db.Column(db.String(100), nullable=False)  # Shoe model
    style = db.Column(db.String(100), nullable=False)  # Shoe style
    brand = db.Column(db.String(100), nullable=False)  # Shoe brand
    main_image = db.Column(db.Text, nullable=False)  # Main image URL
    gallery = db.Column(ARRAY(String))  # Gallery images as array
    featured = db.Column(Boolean, default=False)  # Featured flag
    related_ids = db.Column(db.String)  # Related shoe IDs
    variants = db.Column(MutableDict.as_mutable(JSONB), default={})  # Shoe variants as JSONB
    description = db.Column(db.Text, nullable=True)  # Shoe description
    color = db.Column(db.String(50), nullable=True)  # Shoe color
    sale_price = db.Column(db.Numeric, nullable=True)  # Sale price
    sale_start_date = db.Column(db.Date, nullable=True)  # Sale start date
    sale_end_date = db.Column(db.Date, nullable=True)  # Sale end date
    date_added = db.Column(db.Date, nullable=False, default=datetime.utcnow)  # Date added

    def __repr__(self):  # String representation
        return f"<Shoe {self.id} - {self.title}>"  # Return formatted string

# User model
class User(UserMixin, db.Model):  # Define User model with Flask-Login mixin
    __tablename__ = "users"  # Set table name

    id = db.Column(db.Integer, primary_key=True)  # Primary key
    first_name = db.Column(db.String(80), nullable=False)  # First name
    last_name = db.Column(db.String(80), nullable=False)  # Last name
    email = db.Column(db.String(120), unique=True, nullable=False)  # Email (unique)
    phone = db.Column(db.String(20), nullable=False)  # Phone number
    address = db.Column(db.String(255))  # Address
    password = db.Column(db.String(512), nullable=False)  # Password hash

    def __repr__(self):  # String representation
        return f"<User {self.email}>"  # Return formatted string

class Order(db.Model):  # Define Order model
    __tablename__ = "orders"  # Set table name
    id = db.Column(db.Integer, primary_key=True)  # Primary key
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # Foreign key to user
    email = db.Column(db.String(120), nullable=False)  # Email
    address = db.Column(db.String(255), nullable=False)  # Address
    total = db.Column(db.Numeric, nullable=False)  # Order total
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Creation timestamp
    items = db.relationship('OrderItem', backref='order', lazy=True)  # Relationship to order items
    shipping_method = db.Column(  # Shipping method
        db.String(50),
        nullable=False,
        default='standard',
        server_default='standard'
    )
    shipping_cost = db.Column(  # Shipping cost
        db.Float,
        nullable=False,
        default=0.0,
        server_default='0'
    )
    
class OrderItem(db.Model):  # Define OrderItem model
    __tablename__ = "order_items"  # Set table name
    id = db.Column(db.Integer, primary_key=True)  # Primary key
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)  # Foreign key to order
    product_id = db.Column(db.Integer, nullable=False)  # Product ID
    title = db.Column(db.String(100), nullable=False)  # Product title
    price = db.Column(db.Numeric, nullable=False)  # Product price
    size = db.Column(db.String(20))  # Product size
    quantity = db.Column(db.Integer, default=1)  # Quantity
    image = db.Column(db.String(255))  # Image URL

# --- PDF Generation Helper ---
def generate_order_pdf(order, order_items):  # Function to generate PDF for order
    order = ensure_utf8(order)  # Ensure order data is UTF-8
    sanitized_items = []  # List for sanitized items
    for item in order_items:  # For each order item
        data = {}  # Data dict
        for col in item.__table__.columns:  # For each column
            val = getattr(item, col.name)  # Get value
            data[col.name] = ensure_utf8(val)  # Ensure UTF-8
        sanitized_items.append(type(item)(**data))  # Add sanitized item
    html = render_template('order_pdf.html', order=order, order_items=sanitized_items)  # Render HTML
    pdf_file = io.BytesIO()  # Create in-memory file
    HTML(string=html).write_pdf(pdf_file)  # Write PDF to file
    pdf_file.seek(0)  # Seek to start
    return pdf_file  # Return PDF file

# --- Email Sending Helper ---
def send_order_pdf_email(order, order_items):  # Function to send order PDF by email
    pdf_file = generate_order_pdf(order, order_items)  # Generate PDF
    msg = Message(  # Create email message
        subject=f"Your Shoe Haven Order #{order.id}",  # Email subject
        recipients=[order.email],  # Recipient list
        body="Thank you for your order! Please find your order confirmation attached as a PDF."  # Email body
    )
    msg.attach(  # Attach PDF to email
        filename=f"order_{order.id}.pdf",  # Filename
        content_type="application/pdf",  # Content type
        data=pdf_file.read()  # PDF data
    )
    app.logger.debug(f"Email subject: {msg.subject}")  # Log subject
    app.logger.debug(f"Email recipients: {msg.recipients}")  # Log recipients
    app.logger.debug(f"Email sender: {msg.sender}")  # Log sender
    app.logger.debug(f"Email body: {msg.body}")  # Log body
    app.logger.debug(f"Sending order confirmation to: {order.email}")  # Log sending
    mail.send(msg)  # Send email

@app.route('/')  # Home page route
def home():
    print("Session:", session)  # Print session info
    return render_template("home.html")  # Render home page

# --- UPDATED PRODUCT LISTINGS ROUTE WITH PAGINATION AND ERROR HANDLING ---
@app.route('/productlistings')  # Product listings route
def product_listing():
    brand_filter = request.args.get('brand')  # Get brand filter
    style_filter = request.args.get('style')  # Get style filter
    category_filter = request.args.get('category')  # Get category filter
    page = request.args.get('page', 1, type=int)  # Get page number
    per_page = request.args.get('per_page', 20, type=int)  # Get items per page

    query = Shoes.query  # Start query
    if brand_filter:  # If brand filter present
        app.logger.debug(f"Filtering by brand: {brand_filter}")  # Log filter
        query = query.filter(Shoes.brand.ilike(f'%{brand_filter}%'))  # Filter by brand
    if style_filter:  # If style filter present
        app.logger.debug(f"Filtering by style: {style_filter}")  # Log filter
        query = query.filter(Shoes.style.ilike(f'%{style_filter}%'))  # Filter by style
    if category_filter:  # If category filter present
        app.logger.debug(f"Filtering by category: {category_filter}")  # Log filter
        query = query.filter(Shoes.category.ilike(f'%{category_filter}%'))  # Filter by category

    try:
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        shoes = pagination.items
    except Exception as e:
        app.logger.error(f"Error querying shoes: {e}")
        return "Internal Server Error", 500

    app.logger.debug(f"Found {len(shoes)} shoes after filtering")  # Log count

    products = []  # List for products
    for shoe in shoes:  # For each shoe
        products.append({  # Add product dict
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

    return render_template('productlisting.html', products=products, pagination=pagination)  # Render product listing

# --- END UPDATED ROUTE ---

@app.route('/product.html')  # Product page route
def product_page():
    shoe_id = request.args.get('id', type=int)  # Get shoe ID from query
    app.logger.debug(f"Accessing product page with id={shoe_id}")  # Log access
    if not shoe_id:  # If no ID provided
        app.logger.error("No product ID provided in query string")  # Log error
        return "No product ID provided", 400  # Return error

    shoe = Shoes.query.get(shoe_id)  # Get shoe by ID
    if not shoe:  # If shoe not found
        app.logger.warning(f"Product with id={shoe_id} not found")  # Log warning
        return "Product not found", 404  # Return error

    app.logger.info(f"Rendering product page for shoe: {shoe}")  # Log info

    from datetime import date  # Import date
    return render_template('product.html', shoe=shoe, variants=shoe.variants or {}, today=date.today())  # Render product page

@app.route('/api/product/<int:shoe_id>')  # API route for product
def get_product(shoe_id):
    app.logger.info(f"API request for product with shoe_id={shoe_id}")  # Log API request
    shoe = Shoes.query.get(shoe_id)  # Get shoe by ID

    if not shoe:  # If shoe not found
        app.logger.warning(f"Product with id={shoe_id} not found")  # Log warning
        return render_template('404.html'), 404  # Return 404 page

    products = {  # Build product dict
        "id": shoe.id,
        "title": shoe.title,
        "price": float(shoe.price),
        "description": shoe.description or "",
        "sizes": shoe.sizes.split(',') if shoe.sizes else [],
        "main_image": shoe.main_image,
        "thumbnails": [{"src": img_url, "alt": f"{shoe.title} thumbnail"} for img_url in (shoe.gallery or [])],
        "variants": shoe.variants or {},
        "color": shoe.color,
        "sale_price": float(shoe.sale_price) if shoe.sale_price is not None else None,
        "sale_start_date": shoe.sale_start_date.isoformat() if shoe.sale_start_date else None,
        "sale_end_date": shoe.sale_end_date.isoformat() if shoe.sale_end_date else None
     }
    return jsonify(products)  # Return product as JSON

@app.route('/add-to-cart', methods=['POST'])  # Add to cart route
def add_to_cart():
    data = request.get_json()  # Get JSON data
    product_id = data.get("id")  # Get product ID
    size = data.get("size")  # Get size
    quantity = data.get("quantity", 1)  # Get quantity

    if not product_id or not size:  # If missing data
        return jsonify({"error": "Missing product ID or size"}), 400  # Return error

    shoe = Shoes.query.get(product_id)  # Get shoe by ID
    if not shoe:  # If shoe not found
        return jsonify({"error": "Product not found"}), 404  # Return error

    if 'cart' not in session:  # If cart not in session
        session['cart'] = []  # Initialize cart

    cart = session['cart']  # Get cart
    cart.append({  # Add item to cart
        "id": product_id,
        "title": shoe.title,
        "price": float(shoe.price),
        "size": size,
        "quantity": quantity,
        "imageSrc": shoe.main_image
    })
    session['cart'] = cart  # Save cart to session

    return jsonify({"message": "Product added to cart"}), 200  # Return success

@app.route('/api/cart', methods=['POST'])  # API route for cart
def get_cart():
    data = request.get_json()  # Get JSON data
    app.logger.debug(f"Received data for cart: {data}")  # Log data
    if not data or 'id' not in data:  # If invalid data
        return jsonify({'error': 'Invalid data'}), 400  # Return error

    cart = session.get('cart', [])  # Get cart from session
    for item in cart:  # For each item in cart
        if item.get('id') == data['id']:  # If item matches
            item['quantity'] += data.get('quantity', 1)  # Increment quantity
            break
    else:  # If not found
        cart.append({  # Add new item
            'id': data.get('id'),
            'title': data.get('title'),
            'price': data.get('price'),
            'quantity': data.get('quantity', 1),
            'imageSrc': data.get('imageSrc'),
            'size': data.get('size')
        })
    session['cart'] = cart  # Save cart to session
    return jsonify({'cart': cart})  # Return cart

@app.route('/register', methods=['GET', 'POST'])  # Register route
def register():
    if request.method == 'POST':  # If POST request
        new_user = User(  # Create new user
            first_name=request.form['first_name'],
            last_name=request.form['last_name'],
            email=request.form['email'],
            phone=request.form['phone'],
            address=request.form['address'],
            password=generate_password_hash(request.form['password']),
        )
        db.session.add(new_user)  # Add user to session
        db.session.commit()  # Commit to DB
        flash('Registration successful! Please log in.', 'success')  # Flash message
        return redirect(url_for('login'))  # Redirect to login

    return render_template('register.html')  # Render register page

# ========== STRIPE CHECKOUT SESSION ROUTE ==========
@app.route('/create-checkout-session', methods=['POST'])  # Stripe checkout session route
def create_checkout_session():
    data = request.get_json()  # Get JSON data
    cart = data.get('cart', [])  # Get cart
    shipping_method = data.get('shipping_method', 'Free Shipping')  # Get shipping method
    shipping_cost = float(data.get('shipping_cost', 0.0))  # Get shipping cost

    # Extract additional fields from JSON
    contact_email = data.get('contactEmail', '')  # Get contact email
    contact_first_name = data.get('contactFirstName', '')  # Get contact first name
    contact_last_name = data.get('contactLastName', '')  # Get contact last name
    contact_phone = data.get('contactPhone', '')  # Get contact phone
    shipping_first_name = data.get('shippingFirstName', '')  # Get shipping first name
    shipping_last_name = data.get('shippingLastName', '')  # Get shipping last name
    shipping_address = data.get('shippingAddress', '')  # Get shipping address

    # Calculate total
    total = sum(float(item['price']) * int(item['quantity']) for item in cart) + shipping_cost  # Calculate total

    # Get user info if available
    user_id = None  # Initialize user_id
    email = contact_email  # Set email
    address = shipping_address  # Set address

    if current_user.is_authenticated:  # If user is authenticated
        user_id = current_user.id  # Set user_id
        if not email:  # If no email
            email = current_user.email  # Use current user's email
        if not address:  # If no address
            address = current_user.address  # Use current user's address

    # 1. Create order in DB
    order = Order(  # Create order
        user_id=user_id,
        email=email,
        address=address,
        total=total,
        shipping_method=shipping_method,
        shipping_cost=shipping_cost
    )
    db.session.add(order)  # Add order to session
    db.session.flush()  # get order.id

    # 2. Add order items
    for item in cart:  # For each item in cart
        order_item = OrderItem(  # Create order item
            order_id=order.id,
            product_id=item['id'],
            title=item['title'],
            price=item['price'],
            size=item.get('size'),
            quantity=item['quantity'],
            image=item.get('imageSrc')
        )
        db.session.add(order_item)  # Add order item to session

    db.session.commit()  # Commit to DB

    # 3. Build line items for Stripe
    line_items = []  # List for Stripe line items
    for item in cart:  # For each item in cart
        line_items.append({  # Add line item
            'price_data': {
                'currency': 'usd',
                'product_data': {
                    'name': item['title'],
                },
                'unit_amount': int(float(item['price']) * 100),  # Stripe expects cents
            },
            'quantity': item['quantity'],
        })
    # Add shipping as a line item if needed
    if shipping_cost > 0:  # If shipping cost > 0
        line_items.append({  # Add shipping line item
            'price_data': {
                'currency': 'usd',
                'product_data': {
                    'name': f"Shipping ({shipping_method})",
                },
                'unit_amount': int(float(shipping_cost) * 100),
            },
            'quantity': 1,
        })

    # 4. Create Stripe session with metadata and correct success_url
    app.logger.debug("[STRIPE] Creating checkout session. Setting success_url to /order/confirmation")  # Log debug
    session_obj = stripe.checkout.Session.create(  # Create Stripe session
        payment_method_types=['card'],
        line_items=line_items,
        mode='payment',
        success_url=url_for('order_confirmation', _external=True) + '?session_id={CHECKOUT_SESSION_ID}',
        cancel_url=url_for('checkout', _external=True) + '?canceled=true',
        metadata={'order_id': order.id}
    )
    return jsonify({'id': session_obj.id})  # Return session ID

# ========== LOGIN ==========
@app.route('/login', methods=['GET', 'POST'])  # Login route
def login():
    if request.method == 'POST':  # If POST request
        email = request.form.get('email', '').strip()  # Get email
        password = request.form.get('password', '')  # Get password
        next_page = request.args.get('next') or request.form.get('next')  # Get next page

        user = User.query.filter_by(email=email).first()  # Query user by email
        if user:  # If user found
            app.logger.debug(f"User found for email: {email}")  # Log debug
            if check_password_hash(user.password, password):  # Check password
                login_user(user)  # Log in user
                session['user_email'] = user.email  # Set session email
                app.logger.info(f"User {email} logged in successfully.")  # Log info
                flash('Logged in successfully!', 'success')  # Flash message
                if next_page and is_safe_url(next_page):  # If next page is safe
                    return redirect(next_page)  # Redirect to next page
                return redirect(url_for('home'))  # Redirect to home
            else:
                app.logger.warning(f"Password mismatch for user: {email}")  # Log warning
        else:
            app.logger.warning(f"No user found for email: {email}")  # Log warning

        flash('Invalid email or password', 'danger')  # Flash error
        return redirect(url_for('home'))  # Redirect to home

    return render_template('home.html')  # Render home page

@app.route('/logout')  # Logout route
def logout():
    logout_user()  # Log out user
    session.clear()  # Clear session
    flash('You have been logged out.', 'info')  # Flash message
    return redirect(url_for('home'))  # Redirect to home

@app.context_processor  # Context processor for templates
def inject_user():
    print("Injecting user:", current_user.is_authenticated)  # Print user status
    if hasattr(current_user, "is_authenticated") and current_user.is_authenticated:  # If user is authenticated
        return {
            "user": current_user,
            "user_email": current_user.email,
        }
    else:
        return {
            "user": None,
            "user_email": None,
        }

@app.route('/cart')  # Cart page route
def cart_page():
    return render_template('cart.html')  # Render cart page

@app.route('/checkout', methods=['GET', 'POST'])  # Checkout route
def checkout():
    if request.method == 'POST':  # If POST request
        cart_data = request.form.get('cart_data')  # Get cart data

        if cart_data:  # If cart data present
            cart = json.loads(cart_data)  # Load cart from JSON
        else:
            cart = session.get('cart', [])  # Get cart from session

        app.logger.debug(f"[CHECKOUT] cart_data: {cart_data}")  # Log cart data
        app.logger.debug(f"[CHECKOUT] cart before processing: {cart}")  # Log cart

        if not cart:  # If cart is empty
            flash('Your cart is empty.', 'danger')  # Flash error
            return redirect(url_for('cart_page'))  # Redirect to cart

        if current_user.is_authenticated:  # If user is authenticated
            email = current_user.email  # Get email
            address = request.form.get('shippingAddress') or current_user.address  # Get address
            user_id = current_user.id  # Get user ID
        else:
            email = request.form.get('contactEmail')  # Get email
            address = request.form.get('shippingAddress')  # Get address
            user_id = None  # No user ID

        total = sum(item['price'] * item['quantity'] for item in cart)  # Calculate total

        order = Order(  # Create order
            user_id=user_id,
            email=email,
            address=address,
            total=total
        )
        db.session.add(order)  # Add order to session
        db.session.flush()  # Get order ID

        for item in cart:  # For each item in cart
            order_item = OrderItem(  # Create order item
                order_id=order.id,
                product_id=item['id'],
                title=item['title'],
                price=item['price'],
                size=item.get('size'),
                quantity=item['quantity'],
                image=item.get('imageSrc')
            )
            db.session.add(order_item)  # Add order item to session

        db.session.commit()  # Commit to DB
        app.logger.debug(f"[CHECKOUT] Order {order.id} committed. Clearing cart.")  # Log commit
        session['cart'] = []  # Clear cart
        session['last_order_id'] = order.id  # Set last order ID
        app.logger.debug(f"[CHECKOUT] Cart after clearing: {session.get('cart')}")  # Log cart
        order_items = OrderItem.query.filter_by(order_id=order.id).all()  # Get order items
        try:
            send_order_pdf_email(order, order_items)  # Send order email
            app.logger.info(f"Order confirmation email with PDF sent to {order.email}")  # Log info
        except Exception as e:
            app.logger.error(f"Failed to send order confirmation email: {e}")  # Log error
        flash('Order placed successfully!', 'success')  # Flash success
        app.logger.debug(f"[CHECKOUT] Redirecting to order_confirmation for order {order.id}")  # Log redirect
        return redirect(url_for('order_confirmation'))  # Redirect to confirmation

    stripe_publishable_key = os.environ.get('STRIPE_PUBLISHABLE_KEY', '')  # Get Stripe key
    return render_template('checkout.html', stripe_publishable_key=stripe_publishable_key)  # Render checkout

# --- Order Confirmation Route ---
@app.route('/order/confirmation')  # Order confirmation route
def order_confirmation():
    session.pop('cart', None)  # Remove cart from session
    session_id = request.args.get('session_id')  # Get session ID
    if not session_id:  # If no session ID
        flash('No session ID found.', 'warning')  # Flash warning
        return redirect(url_for('home'))  # Redirect to home

    checkout_session = stripe.checkout.Session.retrieve(session_id)  # Retrieve Stripe session
    order_id = checkout_session.metadata.get('order_id') if checkout_session.metadata else None  # Get order ID

    if not order_id:  # If no order ID
        flash('Order not found.', 'danger')  # Flash error
        return redirect(url_for('home'))  # Redirect to home

    order = Order.query.get(order_id)  # Get order
    if not order:  # If order not found
        flash('Order not found.', 'danger')  # Flash error
        return redirect(url_for('home'))  # Redirect to home

    order_items = OrderItem.query.filter_by(order_id=order.id).all()  # Get order items
    try:
        send_order_pdf_email(order, order_items)  # Send order email
        app.logger.info(f"Order confirmation email with PDF sent to {order.email}")  # Log info
    except Exception as e:
        app.logger.error(f"Failed to send order confirmation email: {e}")  # Log error

    return render_template(
        'orderConfirmation.html',
        order_id=order.id,
        user_email=order.email,
        total=order.total,
        order_date=order.created_at.strftime('%Y-%m-%d %H:%M')
    )  # Render confirmation

@app.route('/order/<int:order_id>/pdf')  # Download order PDF route
@login_required  # Require login
def download_order_pdf(order_id):
    order = Order.query.get_or_404(order_id)  # Get order or 404
    order_items = OrderItem.query.filter_by(order_id=order.id).all()  # Get order items
    pdf_file = generate_order_pdf(order, order_items)  # Generate PDF
    return send_file(
        pdf_file,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'order_{order.id}.pdf'
    )  # Send PDF file

@app.route('/search')  # Search route
def search():
    query = request.args.get('query', '').strip()  # Get search query

    if not query:  # If no query
        return render_template("search_results.html", results=[], message="Please enter a search term.")  # Prompt for search

    results = Shoes.query.filter(  # Search shoes
        or_(
            Shoes.title.ilike(f"%{query}%"),
            Shoes.model.ilike(f"%{query}%"),
            Shoes.brand.ilike(f"%{query}%"),
            Shoes.sizes.ilike(f"%{query}%"),
            cast(Shoes.price, String).ilike(f"%{query}%"),
            Shoes.main_image.ilike(f"%{query}%"),
            Shoes.style.ilike(f"%{query}%"),
            Shoes.category.ilike(f"%{query}%")
        )
    ).all()
       
    if not results:  # If no results
        return render_template("search_results.html", results=[], message="No matching shoes found.")  # No results

    return render_template("search_results.html", results=results, message=f"Results for '{query}'")  # Show results

@app.route('/sales')  # Sales page route
def sales_page():
    today = date.today()  # Get today
    sales = Shoes.query.filter(  # Get sales
        Shoes.sale_price.isnot(None),
        Shoes.sale_start_date <= today,
        Shoes.sale_end_date >= today
    ).all()
    return render_template('sale_items.html', sales=sales, today=today)  # Render sales

from datetime import date, timedelta  # Import date and timedelta

@app.route('/new-arrivals')
def new_arrivals():
      today = date.today()
      cutoff = today - timedelta(days=30)
      page = request.args.get('page', 1, type=int)
      per_page = request.args.get('per_page', 20, type=int)
      pagination = Shoes.query.filter(Shoes.date_added >= cutoff).paginate(page=page, per_page=per_page, error_out=False)
      arrivals = pagination.items
      return render_template('new_arrivals.html', arrivals=arrivals, today=today, pagination=pagination)
  

@app.route('/size-guide')  # Size guide route
def size_guide():
    return render_template('size-guide.html')  # Render size guide

@app.route('/shipping-info')  # Shipping info route
def shipping_info():
    return render_template('shipping_info.html')  # Render shipping info

@app.route('/returns')  # Returns route
def returns():
    return render_template('returns.html')  # Render returns

@app.route('/privacy-policy')  # Privacy policy route
def privacy_policy():
    return render_template('privacy_policy.html')  # Render privacy policy

@app.route('/terms-of-service')  # Terms of service route
def terms_of_service():
    return render_template('terms_of_service.html')  # Render terms of service

@app.route('/cookie-policy')  # Cookie policy route
def cookie_policy():
    return render_template('cookie_policy.html')  # Render cookie policy

@app.route('/faq')  # FAQ route
def faq():
    return render_template('faq.html')  # Render FAQ

@app.route('/contact-us')  # Contact us route
def contact_us():
    return render_template('contact_us.html')  # Render contact us

@app.route('/order-status')  # Order status route
def order_status():
    return render_template('order_status.html')  # Render order status

@app.route('/api/products')  # API route for all products
def api_products():
    shoes = Shoes.query.all()  # Get all shoes
    app.logger.debug(f"Returning all products: count={len(shoes)}")  # Log count
    result = [{  # Build result list
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
        "sale_price": float(shoe.sale_price) if shoe.sale_price is not None else None,
        "sale_start_date": shoe.sale_start_date.isoformat() if shoe.sale_start_date else None,
        "sale_end_date": shoe.sale_end_date.isoformat() if shoe.sale_end_date else None,
        "date_added": shoe.date_added.isoformat() if shoe.date_added else None 
    } for shoe in shoes]
    return jsonify(result)  # Return products as JSON

    application = app

if __name__ == '__main__':  # Main entry point
    app.run(debug=True)  # Run Flask app in debug mode

    
 