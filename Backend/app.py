from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import String, Boolean, or_, cast
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.mutable import MutableDict
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from urllib.parse import urlparse, urljoin
from dotenv import load_dotenv
from datetime import datetime, date, timedelta
from weasyprint import HTML
from decimal import Decimal
import os
import logging
import json
import stripe
import io
import time  # For timing logs

# --- Flask-Mail configuration ---
from flask_mail import Mail, Message

load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure logging to DEBUG level
logging.basicConfig(level=logging.DEBUG)
app.logger.setLevel(logging.DEBUG)

# Secret key for session management 
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'fallback-default-key')

# PostgreSQL configuration
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:IylaRosa2549!@shoe-haven-db.czocwcgkqw0k.ap-northeast-2.rds.amazonaws.com:5432/shoe_haven_db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Stripe configuration
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', 'sk_test_...')

# --- Flask-Mail configuration ---
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER')

mail = Mail(app)

# Extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Flask-Login setup
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# User loader for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    app.logger.debug(f"Loading user with id: {user_id}")
    return User.query.get(int(user_id))

# Helper to check if a URL is safe for redirects
def is_safe_url(target):
    ref_url = urlparse(request.host_url)
    test_url = urlparse(urljoin(request.host_url, target))
    return test_url.scheme in ('http', 'https') and ref_url.netloc == test_url.netloc

# --- UTF-8 Data Sanitization Helper ---
def ensure_utf8(obj):
    if isinstance(obj, str):
        return obj.encode('utf-8', errors='replace').decode('utf-8')
    if isinstance(obj, list):
        return [ensure_utf8(x) for x in obj]
    if isinstance(obj, dict):
        return {k: ensure_utf8(v) for k, v in obj.items()}
    if hasattr(obj, '__table__'):
        data = {}
        for col in obj.__table__.columns:
            val = getattr(obj, col.name)
            data[col.name] = ensure_utf8(val)
        return type(obj)(**data)
    return obj

# --- Models ---
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
    featured = db.Column(Boolean, default=False)
    related_ids = db.Column(db.String)
    variants = db.Column(MutableDict.as_mutable(JSONB), default={})
    description = db.Column(db.Text, nullable=True)
    color = db.Column(db.String(50), nullable=True)
    sale_price = db.Column(db.Numeric, nullable=True)
    sale_start_date = db.Column(db.Date, nullable=True)
    sale_end_date = db.Column(db.Date, nullable=True)
    date_added = db.Column(db.Date, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f"<Shoe {self.id} - {self.title}>"

class User(UserMixin, db.Model):
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

class Order(db.Model):
    __tablename__ = "orders"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    email = db.Column(db.String(120), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    total = db.Column(db.Numeric, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    items = db.relationship('OrderItem', backref='order', lazy=True)
    shipping_method = db.Column(db.String(50), nullable=False, default='standard', server_default='standard')
    shipping_cost = db.Column(db.Float, nullable=False, default=0.0, server_default='0')

class OrderItem(db.Model):
    __tablename__ = "order_items"
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Numeric, nullable=False)
    size = db.Column(db.String(20))
    quantity = db.Column(db.Integer, default=1)
    image = db.Column(db.String(255))

# --- PDF Generation Helper ---
def generate_order_pdf(order, order_items):
    app.logger.debug(f"Generating PDF for order {order.id}")
    order = ensure_utf8(order)
    sanitized_items = []
    for item in order_items:
        data = {}
        for col in item.__table__.columns:
            val = getattr(item, col.name)
            data[col.name] = ensure_utf8(val)
        sanitized_items.append(type(item)(**data))
    html = render_template('order_pdf.html', order=order, order_items=sanitized_items)
    pdf_file = io.BytesIO()
    HTML(string=html).write_pdf(pdf_file)
    pdf_file.seek(0)
    app.logger.debug(f"PDF generation complete for order {order.id}")
    return pdf_file

# --- Email Sending Helper ---
def send_order_pdf_email(order, order_items):
    app.logger.debug(f"Preparing to send order confirmation email for order {order.id}")
    pdf_file = generate_order_pdf(order, order_items)
    msg = Message(
        subject=f"Your Shoe Haven Order #{order.id}",
        recipients=[order.email],
        body="Thank you for your order! Please find your order confirmation attached as a PDF."
    )
    msg.attach(
        filename=f"order_{order.id}.pdf",
        content_type="application/pdf",
        data=pdf_file.read()
    )
    app.logger.debug(f"Sending email to {order.email} for order {order.id}")
    mail.send(msg)
    app.logger.info(f"Order confirmation email sent to {order.email} for order {order.id}")

# --- ROUTES ---

@app.route('/')
def home():
    app.logger.debug("Home page accessed")
    app.logger.debug(f"Session: {session}")
    return render_template("home.html")

@app.route('/productlistings')
def product_listing():
    app.logger.debug("Product listings page accessed")
    brand_filter = request.args.get('brand')
    style_filter = request.args.get('style')
    category_filter = request.args.get('category')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

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

    try:
        start = time.time()
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        shoes = pagination.items
        app.logger.debug(f"Product listings query took {time.time() - start:.2f} seconds")
    except Exception as e:
        app.logger.error(f"Error querying shoes: {e}")
        return "Internal Server Error", 500

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

    return render_template('productlisting.html', products=products, pagination=pagination)

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
    return render_template('product.html', shoe=shoe, variants=shoe.variants or {}, today=date.today())

@app.route('/api/product/<int:shoe_id>')
def get_product(shoe_id):
    app.logger.info(f"API request for product with shoe_id={shoe_id}")
    shoe = Shoes.query.get(shoe_id)

    if not shoe:
        app.logger.warning(f"Product with id={shoe_id} not found")
        return render_template('404.html'), 404

    products = {
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
    return jsonify(products)

@app.route('/add-to-cart', methods=['POST'])
def add_to_cart():
    app.logger.debug("Add to cart endpoint hit")
    data = request.get_json()
    product_id = data.get("id")
    size = data.get("size")
    quantity = data.get("quantity", 1)

    if not product_id or not size:
        app.logger.error("Missing product ID or size in add-to-cart")
        return jsonify({"error": "Missing product ID or size"}), 400

    shoe = Shoes.query.get(product_id)
    if not shoe:
        app.logger.error(f"Product not found for add-to-cart: {product_id}")
        return jsonify({"error": "Product not found"}), 404

    if 'cart' not in session:
        session['cart'] = []

    cart = session['cart']
    cart.append({
        "id": product_id,
        "title": shoe.title,
        "price": float(shoe.price),
        "size": size,
        "quantity": quantity,
        "imageSrc": shoe.main_image
    })
    session['cart'] = cart

    app.logger.debug(f"Product {product_id} added to cart")
    return jsonify({"message": "Product added to cart"}), 200

@app.route('/api/cart', methods=['POST'])
def get_cart():
    data = request.get_json()
    app.logger.debug(f"Received data for cart: {data}")
    if not data or 'id' not in data:
        app.logger.error("Invalid data in /api/cart")
        return jsonify({'error': 'Invalid data'}), 400

    cart = session.get('cart', [])
    for item in cart:
        if item.get('id') == data['id']:
            item['quantity'] += data.get('quantity', 1)
            break
    else:
        cart.append({
            'id': data.get('id'),
            'title': data.get('title'),
            'price': data.get('price'),
            'quantity': data.get('quantity', 1),
            'imageSrc': data.get('imageSrc'),
            'size': data.get('size')
        })
    session['cart'] = cart
    app.logger.debug(f"Cart updated: {cart}")
    return jsonify({'cart': cart})

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        app.logger.debug("Register POST request received")
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
        app.logger.info(f"New user registered: {new_user.email}")
        flash('Registration successful! Please log in.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    app.logger.debug("Stripe checkout session creation started")
    data = request.get_json()
    cart = data.get('cart', [])
    shipping_method = data.get('shipping_method', 'Free Shipping')
    shipping_cost = float(data.get('shipping_cost', 0.0))

    # Extract additional fields from JSON
    contact_email = data.get('contactEmail', '')
    contact_first_name = data.get('contactFirstName', '')
    contact_last_name = data.get('contactLastName', '')
    contact_phone = data.get('contactPhone', '')
    shipping_first_name = data.get('shippingFirstName', '')
    shipping_last_name = data.get('shippingLastName', '')
    shipping_address = data.get('shippingAddress', '')

    # Calculate total
    total = sum(float(item['price']) * int(item['quantity']) for item in cart) + shipping_cost

    # Get user info if available
    user_id = None
    email = contact_email
    address = shipping_address

    if current_user.is_authenticated:
        user_id = current_user.id
        if not email:
            email = current_user.email
        if not address:
            address = current_user.address

    # 1. Create order in DB
    order = Order(
        user_id=user_id,
        email=email,
        address=address,
        total=total,
        shipping_method=shipping_method,
        shipping_cost=shipping_cost
    )
    db.session.add(order)
    db.session.flush()  # get order.id

    # 2. Add order items
    for item in cart:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item['id'],
            title=item['title'],
            price=item['price'],
            size=item.get('size'),
            quantity=item['quantity'],
            image=item.get('imageSrc')
        )
        db.session.add(order_item)

    db.session.commit()
    app.logger.info(f"Order {order.id} created for checkout session")

    # 3. Build line items for Stripe
    line_items = []
    for item in cart:
        line_items.append({
            'price_data': {
                'currency': 'usd',
                'product_data': {
                    'name': item['title'],
                },
                'unit_amount': int(float(item['price']) * 100),
            },
            'quantity': item['quantity'],
        })
    if shipping_cost > 0:
        line_items.append({
            'price_data': {
                'currency': 'usd',
                'product_data': {
                    'name': f"Shipping ({shipping_method})",
                },
                'unit_amount': int(float(shipping_cost) * 100),
            },
            'quantity': 1,
        })

    # 4. Create Stripe session
    app.logger.debug("[STRIPE] Creating checkout session. Setting success_url to /order/confirmation")
    session_obj = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=line_items,
        mode='payment',
        success_url=url_for('order_confirmation', _external=True) + '?session_id={CHECKOUT_SESSION_ID}',
        cancel_url=url_for('checkout', _external=True) + '?canceled=true',
        metadata={'order_id': order.id}
    )
    app.logger.info(f"Stripe checkout session created for order {order.id}")
    return jsonify({'id': session_obj.id})

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        next_page = request.args.get('next') or request.form.get('next')

        user = User.query.filter_by(email=email).first()
        if user:
            app.logger.debug(f"User found for email: {email}")
            if check_password_hash(user.password, password):
                login_user(user)
                session['user_email'] = user.email
                app.logger.info(f"User {email} logged in successfully.")
                flash('Logged in successfully!', 'success')
                if next_page and is_safe_url(next_page):
                    return redirect(next_page)
                return redirect(url_for('home'))
            else:
                app.logger.warning(f"Password mismatch for user: {email}")
        else:
            app.logger.warning(f"No user found for email: {email}")

        flash('Invalid email or password', 'danger')
        return redirect(url_for('home'))

    return render_template('home.html')

@app.route('/logout')
def logout():
    app.logger.info("User logged out")
    logout_user()
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('home'))

@app.context_processor
def inject_user():
    app.logger.debug(f"Injecting user: {getattr(current_user, 'is_authenticated', False)}")
    if hasattr(current_user, "is_authenticated") and current_user.is_authenticated:
        return {
            "user": current_user,
            "user_email": current_user.email,
        }
    else:
        return {
            "user": None,
            "user_email": None,
        }

@app.route('/cart')
def cart_page():
    app.logger.debug("Cart page accessed")
    return render_template('cart.html')

@app.route('/checkout', methods=['GET', 'POST'])
def checkout():
    if request.method == 'POST':
        cart_data = request.form.get('cart_data')
        if cart_data:
            cart = json.loads(cart_data)
        else:
            cart = session.get('cart', [])

        app.logger.debug(f"[CHECKOUT] cart_data: {cart_data}")
        app.logger.debug(f"[CHECKOUT] cart before processing: {cart}")

        if not cart:
            flash('Your cart is empty.', 'danger')
            return redirect(url_for('cart_page'))

        if current_user.is_authenticated:
            email = current_user.email
            address = request.form.get('shippingAddress') or current_user.address
            user_id = current_user.id
        else:
            email = request.form.get('contactEmail')
            address = request.form.get('shippingAddress')
            user_id = None

        total = sum(item['price'] * item['quantity'] for item in cart)

        order = Order(
            user_id=user_id,
            email=email,
            address=address,
            total=total
        )
        db.session.add(order)
        db.session.flush()

        for item in cart:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item['id'],
                title=item['title'],
                price=item['price'],
                size=item.get('size'),
                quantity=item['quantity'],
                image=item.get('imageSrc')
            )
            db.session.add(order_item)

        db.session.commit()
        app.logger.info(f"[CHECKOUT] Order {order.id} committed. Clearing cart.")
        session['cart'] = []
        session['last_order_id'] = order.id
        app.logger.debug(f"[CHECKOUT] Cart after clearing: {session.get('cart')}")
        order_items = OrderItem.query.filter_by(order_id=order.id).all()
        try:
            send_order_pdf_email(order, order_items)
            app.logger.info(f"Order confirmation email with PDF sent to {order.email}")
        except Exception as e:
            app.logger.error(f"Failed to send order confirmation email: {e}")
        flash('Order placed successfully!', 'success')
        app.logger.debug(f"[CHECKOUT] Redirecting to order_confirmation for order {order.id}")
        return redirect(url_for('order_confirmation'))

    stripe_publishable_key = os.environ.get('STRIPE_PUBLISHABLE_KEY', '')
    return render_template('checkout.html', stripe_publishable_key=stripe_publishable_key)

@app.route('/order/confirmation')
def order_confirmation():
    app.logger.debug("Order confirmation page accessed")
    session.pop('cart', None)
    session_id = request.args.get('session_id')
    if not session_id:
        flash('No session ID found.', 'warning')
        return redirect(url_for('home'))

    try:
        checkout_session = stripe.checkout.Session.retrieve(session_id)
        order_id = checkout_session.metadata.get('order_id') if checkout_session.metadata else None
    except Exception as e:
        app.logger.error(f"Stripe session retrieval failed: {e}")
        flash('Order not found.', 'danger')
        return redirect(url_for('home'))

    if not order_id:
        flash('Order not found.', 'danger')
        return redirect(url_for('home'))

    order = Order.query.get(order_id)
    if not order:
        flash('Order not found.', 'danger')
        return redirect(url_for('home'))

    order_items = OrderItem.query.filter_by(order_id=order.id).all()
    try:
        send_order_pdf_email(order, order_items)
        app.logger.info(f"Order confirmation email with PDF sent to {order.email}")
    except Exception as e:
        app.logger.error(f"Failed to send order confirmation email: {e}")

    return render_template(
        'orderConfirmation.html',
        order_id=order.id,
        user_email=order.email,
        total=order.total,
        order_date=order.created_at.strftime('%Y-%m-%d %H:%M')
    )

@app.route('/order/<int:order_id>/pdf')
@login_required
def download_order_pdf(order_id):
    app.logger.debug(f"PDF download requested for order {order_id}")
    order = Order.query.get_or_404(order_id)
    order_items = OrderItem.query.filter_by(order_id=order.id).all()
    pdf_file = generate_order_pdf(order, order_items)
    return send_file(
        pdf_file,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'order_{order.id}.pdf'
    )

@app.route('/search')
def search():
    query = request.args.get('query', '').strip()
    app.logger.debug(f"Search requested: '{query}'")

    if not query:
        return render_template("search_results.html", results=[], message="Please enter a search term.")

    start = time.time()
    results = Shoes.query.filter(
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
    app.logger.debug(f"Search query took {time.time() - start:.2f} seconds")

    if not results:
        return render_template("search_results.html", results=[], message="No matching shoes found.")

    return render_template("search_results.html", results=results, message=f"Results for '{query}'")

@app.route('/sales')
def sales_page():
    today = date.today()
    app.logger.debug("Sales page accessed")
    start = time.time()
    sales = Shoes.query.filter(
        Shoes.sale_price.isnot(None),
        Shoes.sale_start_date <= today,
        Shoes.sale_end_date >= today
    ).all()
    app.logger.debug(f"Sales query took {time.time() - start:.2f} seconds")
    return render_template('sale_items.html', sales=sales, today=today)

@app.route('/new-arrivals')
def new_arrivals():
    app.logger.debug("New arrivals page accessed")
    today = date.today()
    cutoff = today - timedelta(days=30)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    start = time.time()
    pagination = Shoes.query.filter(Shoes.date_added >= cutoff).paginate(page=page, per_page=per_page, error_out=False)
    arrivals = pagination.items
    elapsed = time.time() - start
    app.logger.debug(f"/new-arrivals query took {elapsed:.2f} seconds, found {len(arrivals)} items")
    return render_template('new_arrivals.html', arrivals=arrivals, today=today, pagination=pagination)

@app.route('/size-guide')
def size_guide():
    app.logger.debug("Size guide page accessed")
    return render_template('size-guide.html')

@app.route('/shipping-info')
def shipping_info():
    app.logger.debug("Shipping info page accessed")
    return render_template('shipping_info.html')

@app.route('/returns')
def returns():
    app.logger.debug("Returns page accessed")
    return render_template('returns.html')

@app.route('/privacy-policy')
def privacy_policy():
    app.logger.debug("Privacy policy page accessed")
    return render_template('privacy_policy.html')

@app.route('/terms-of-service')
def terms_of_service():
    app.logger.debug("Terms of service page accessed")
    return render_template('terms_of_service.html')

@app.route('/cookie-policy')
def cookie_policy():
    app.logger.debug("Cookie policy page accessed")
    return render_template('cookie_policy.html')

@app.route('/faq')
def faq():
    app.logger.debug("FAQ page accessed")
    return render_template('faq.html')

@app.route('/contact-us')
def contact_us():
    app.logger.debug("Contact us page accessed")
    return render_template('contact_us.html')

@app.route('/order-status')
def order_status():
    app.logger.debug("Order status page accessed")
    return render_template('order_status.html')

@app.route('/api/products')
def api_products():
    app.logger.debug("API products endpoint hit")
    start = time.time()
    shoes = Shoes.query.all()
    app.logger.debug(f"Returning all products: count={len(shoes)}, query took {time.time() - start:.2f} seconds")
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
        "sale_price": float(shoe.sale_price) if shoe.sale_price is not None else None,
        "sale_start_date": shoe.sale_start_date.isoformat() if shoe.sale_start_date else None,
        "sale_end_date": shoe.sale_end_date.isoformat() if shoe.sale_end_date else None,
        "date_added": shoe.date_added.isoformat() if shoe.date_added else None 
    } for shoe in shoes]
    return jsonify(result)

    application = app

if __name__ == '__main__':
    app.run(debug=True)