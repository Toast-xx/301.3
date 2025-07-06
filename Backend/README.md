# 👟 Shoe Haven – E-Commerce Web Application

**Shoe Haven** is a full-stack e-commerce platform for footwear, featuring a modern, responsive frontend and a robust Flask backend. It supports user authentication, product browsing and filtering, shopping cart, checkout with Stripe payments, order management, and automated order confirmation via email with PDF receipts.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Bootstrap 5, JavaScript
- **Icons:** Bootstrap Icons
- **Design Tools:** Adobe XD (for prototyping)
- **Backend:** Python 3, Flask, Flask-SQLAlchemy, Flask-Migrate, Flask-Login, Flask-Mail
- **Database:** PostgreSQL (hosted)
- **Payments:** Stripe API
- **PDF Generation:** WeasyPrint
- **Email:** Flask-Mail (SMTP)
- **Other:** dotenv for config, logging for debug

---

## 🌐 Features

### User-Facing

- **Product Listings:**  
  - Browse, search, and filter shoes by brand, model, style, category, and price.
  - Sale and new arrival badges, paginated results.
- **Product Details:**  
  - View detailed product info, images, available sizes, and variants.
- **Shopping Cart:**  
  - Add, update, and remove items. Cart persists in session.
- **Checkout:**  
  - Guest and registered user checkout.
  - Shipping method and cost selection.
  - Stripe payment integration.
- **Order Confirmation:**  
  - Order summary page.
  - PDF receipt generation and email delivery.
- **User Authentication:**  
  - Register, login, logout.
  - Session management with Flask-Login.
- **Informational Pages:**  
  - Size guide, shipping info, returns, privacy policy, terms of service, cookie policy, FAQ, contact, order status.

### Admin/Developer

- **Database Models:**  
  - Shoes, User, Order, OrderItem (see below for schema).
- **Logging:**  
  - Debug-level logging for all major actions and errors.
- **Email:**  
  - Order confirmation with PDF attachment sent via SMTP.

---

## 📦 API Endpoints

| Route                              | Method | Description                                 |
|-------------------------------------|--------|---------------------------------------------|
| `/`                                | GET    | Home page                                   |
| `/productlistings`                 | GET    | Product listing with filters                |
| `/product.html?id=<id>`            | GET    | Product detail page                         |
| `/api/products`                    | GET    | JSON list of all products                   |
| `/api/product/<shoe_id>`           | GET    | JSON details for a single product           |
| `/add-to-cart`                     | POST   | Add product to cart (JSON)                  |
| `/api/cart`                        | POST   | Update/get cart (JSON)                      |
| `/cart`                            | GET    | Cart page                                   |
| `/checkout`                        | GET/POST| Checkout page and order creation            |
| `/create-checkout-session`         | POST   | Create Stripe checkout session (JSON)       |
| `/order/confirmation`              | GET    | Order confirmation page                     |
| `/order/<order_id>/pdf`            | GET    | Download order PDF (login required)         |
| `/register`                        | GET/POST| User registration                           |
| `/login`                           | GET/POST| User login                                  |
| `/logout`                          | GET    | User logout                                 |
| `/search`                          | GET    | Product search                              |
| `/sales`                           | GET    | Sale items                                  |
| `/new-arrivals`                    | GET    | New arrivals                                |
| `/size-guide`, `/shipping-info`, etc.| GET  | Informational pages                         |

---

## 🗄️ Database Models

### Shoes

| Field           | Type         | Description                |
|-----------------|--------------|----------------------------|
| id              | Integer      | Primary key                |
| title           | String       | Product name               |
| price           | Numeric      | Price                      |
| category        | String       | men/women/kids             |
| sizes           | String       | CSV of available sizes     |
| model           | String       | Model name                 |
| style           | String       | Style (e.g., Running)      |
| brand           | String       | Brand name                 |
| main_image      | Text         | Main image URL             |
| gallery         | ARRAY(String)| Gallery image URLs         |
| featured        | Boolean      | Featured product           |
| related_ids     | String       | Related product IDs        |
| variants        | JSONB        | Variant info               |
| description     | Text         | Product description        |
| color           | String       | Color                      |
| sale_price      | Numeric      | Sale price (if any)        |
| sale_start_date | Date         | Sale start                 |
| sale_end_date   | Date         | Sale end                   |
| date_added      | Date         | Date added                 |

### User

| Field      | Type    | Description         |
|------------|---------|---------------------|
| id         | Integer | Primary key         |
| first_name | String  | First name          |
| last_name  | String  | Last name           |
| email      | String  | Unique, login email |
| phone      | String  | Phone number        |
| address    | String  | Address             |
| password   | String  | Hashed password     |

### Order

| Field           | Type    | Description         |
|-----------------|---------|---------------------|
| id              | Integer | Primary key         |
| user_id         | Integer | FK to User (nullable)|
| email           | String  | Customer email      |
| address         | String  | Shipping address    |
| total           | Numeric | Order total         |
| created_at      | DateTime| Order date          |
| shipping_method | String  | Shipping type       |
| shipping_cost   | Float   | Shipping cost       |

### OrderItem

| Field      | Type    | Description         |
|------------|---------|---------------------|
| id         | Integer | Primary key         |
| order_id   | Integer | FK to Order         |
| product_id | Integer | FK to Shoes         |
| title      | String  | Product title       |
| price      | Numeric | Price at purchase   |
| size       | String  | Size                |
| quantity   | Integer | Quantity            |
| image      | String  | Image URL           |

---

## 🧩 Design & UX

- **Responsive:** Mobile-first, Bootstrap grid, offcanvas filters.
- **Filtering:** Dynamic filtering by brand, model, style, price, and category.
- **Badges:** "SALE" and "NEW" badges on product cards.
- **Accessibility:** Color contrast, semantic HTML, ARIA labels.
- **Consistent Branding:** Dark theme with vibrant imagery.

---

## ⚡ Quick Start

1. **Clone the repository**
2. **Install Python dependencies**
3. **Set environment variables** (see `.env.example`)
   - `FLASK_SECRET_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_DEFAULT_SENDER`
4. **Run database migrations**   
5. **Start the Flask server**
6. **Access the app** at [http://localhost:5000](http://localhost:5000)

---

## 🧪 Testing & Development

- **Frontend:**  
  - Edit HTML/CSS/JS in `Frontend/templates` and `Frontend/static`.
  - Use Flask's `url_for` for static asset paths when running backend.
- **Backend:**  
  - All routes and models in `Backend/app.py`.
  - Logging enabled for debugging.
- **Database:**  
  - PostgreSQL connection string in `app.config['SQLALCHEMY_DATABASE_URI']`.
- **Stripe:**  
  - Test mode enabled by default.

---

## 📁 File Structure

---

## 🔒 Security Notes

- Passwords are hashed using Werkzeug.
- Sensitive keys and credentials should be set via environment variables.
- Stripe and email credentials must **never** be committed to source control.

---

## 📜 License

This project is created for educational purposes.

---

## 🙏 Acknowledgments

- Bootstrap, Flask, Stripe, WeasyPrint, and the open-source community.