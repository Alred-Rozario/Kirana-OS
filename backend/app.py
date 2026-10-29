import os
import sqlite3
import random
import bcrypt
import csv
from io import StringIO
import random
import bcrypt
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from cloud_service import cloud_manager

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = "kirana-os-saas-super-secret-key-32bytes-secure"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=12)
jwt = JWTManager(app)

DB_PATH = os.path.join(os.path.dirname(__file__), 'kirana.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # SaaS Foundations: Tenants and Users
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS tenants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        store_name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Staff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    )
    ''')

    # Add tenant_id to all domain tables
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        barcode TEXT,
        category TEXT NOT NULL,
        selling_price REAL NOT NULL,
        cost_price REAL NOT NULL,
        unit TEXT NOT NULL DEFAULT 'pcs',
        stock_quantity REAL NOT NULL DEFAULT 0,
        min_stock_alert REAL NOT NULL DEFAULT 10,
        expiry_date TEXT,
        batch_no TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT,
        balance REAL NOT NULL DEFAULT 0.0,
        credit_limit REAL NOT NULL DEFAULT 5000.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS udhaar_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL,
        customer_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        invoice_id INTEGER,
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        contact_person TEXT,
        phone TEXT NOT NULL,
        category TEXT NOT NULL,
        pending_orders INTEGER DEFAULT 0,
        last_restock_date TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL,
        invoice_number TEXT NOT NULL,
        customer_name TEXT,
        customer_phone TEXT,
        payment_method TEXT NOT NULL,
        subtotal REAL NOT NULL,
        discount REAL NOT NULL DEFAULT 0.0,
        gst_amount REAL NOT NULL DEFAULT 0.0,
        total REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL,
        invoice_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        FOREIGN KEY (invoice_id) REFERENCES invoices(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    )
    ''')

    # AWS Cloud Services Table: S3 & CloudFront Backups
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS cloud_backups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        s3_key TEXT NOT NULL,
        cloudfront_url TEXT NOT NULL,
        size_bytes INTEGER NOT NULL,
        backup_type TEXT NOT NULL DEFAULT 'database',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    )
    ''')

    # Ensure image_url column exists in products table
    cursor.execute("PRAGMA table_info(products)")
    existing_cols = [col[1] for col in cursor.fetchall()]
    if 'image_url' not in existing_cols:
        cursor.execute("ALTER TABLE products ADD COLUMN image_url TEXT")

    conn.commit()

    # Seed data
    cursor.execute("SELECT COUNT(*) FROM tenants")
    if cursor.fetchone()[0] == 0:
        seed_data(cursor)
        conn.commit()

    conn.close()

def seed_data(cursor):
    # 1. Create a Default Tenant
    cursor.execute("INSERT INTO tenants (store_name) VALUES ('Default Kirana Store')")
    tenant_id = cursor.lastrowid

    # 2. Create a Default Owner User
    hashed_pw = bcrypt.hashpw('password123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    cursor.execute('''
        INSERT INTO users (tenant_id, name, email, password_hash, role)
        VALUES (?, ?, ?, ?, ?)
    ''', (tenant_id, 'Admin Owner', 'admin@kirana.com', hashed_pw, 'Owner'))

    today = datetime.now()
    exp_soon = (today + timedelta(days=5)).strftime('%Y-%m-%d')
    exp_mid = (today + timedelta(days=45)).strftime('%Y-%m-%d')
    exp_long = (today + timedelta(days=180)).strftime('%Y-%m-%d')

    products = [
        (tenant_id, "Aashirvaad Shudh Chakki Atta 5kg", "8901058852341", "Kirana / Staple", 265.0, 240.0, "pack", 35, 10, exp_long, "BATCH-ATT-101"),
        (tenant_id, "Fortune Refined Soyabean Oil 1L", "8906007280011", "Kirana / Staple", 135.0, 120.0, "l", 24, 8, exp_mid, "BATCH-OIL-204"),
        (tenant_id, "Tata Salt Vacuum Evaporated 1kg", "8901058000148", "Kirana / Staple", 28.0, 24.0, "pack", 50, 15, exp_long, "BATCH-SLT-901"),
        (tenant_id, "Amul Butter Pasteurised 500g", "8901262010052", "Dairy", 275.0, 255.0, "pack", 6, 10, exp_soon, "BATCH-AML-088"),
    ]

    for p in products:
        cursor.execute('''
        INSERT INTO products (tenant_id, name, barcode, category, selling_price, cost_price, unit, stock_quantity, min_stock_alert, expiry_date, batch_no)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', p)

    customers = [
        (tenant_id, "Ramesh Kumar (Sharma Niwas)", "9876543210", "H.No 45, Near Temple, Street 2", 1450.0, 5000.0),
        (tenant_id, "Sunita Devi (Block B)", "9811223344", "Flat 202, Sunshine Apts", 820.0, 3000.0),
    ]

    for c in customers:
        cursor.execute('''
        INSERT INTO customers (tenant_id, name, phone, address, balance, credit_limit)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', c)

    suppliers = [
        (tenant_id, "Amul Delhi Distributor", "Sanjay Verma", "9899112233", "Dairy & Milk", 2, (today - timedelta(days=2)).strftime('%Y-%m-%d')),
    ]

    for s in suppliers:
        cursor.execute('''
        INSERT INTO suppliers (tenant_id, name, contact_person, phone, category, pending_orders, last_restock_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', s)

# --- HELPER ---
def get_user_tenant():
    # Returns (user_id, tenant_id, role)
    from flask_jwt_extended import get_jwt
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    return user_id, claims['tenant_id'], claims['role']

# --- AUTH ROUTES ---
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    store_name = data.get('store_name')
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not all([store_name, name, email, password]):
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if email exists
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"error": "Email already registered"}), 400

    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # Create Tenant
    cursor.execute("INSERT INTO tenants (store_name) VALUES (?)", (store_name,))
    tenant_id = cursor.lastrowid

    # Create Owner
    cursor.execute('''
        INSERT INTO users (tenant_id, name, email, password_hash, role)
        VALUES (?, ?, ?, ?, ?)
    ''', (tenant_id, name, email, hashed_pw, 'Owner'))
    
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Registration successful"}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, tenant_id, name, password_hash, role FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(
        identity=str(user['id']),
        additional_claims={
            "tenant_id": user['tenant_id'],
            "role": user['role']
        }
    )

    return jsonify({
        "token": access_token,
        "user": {
            "id": user['id'],
            "name": user['name'],
            "role": user['role']
        }
    }), 200

# --- DOMAIN API ROUTES ---

@app.route('/api/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    _, tenant_id, _ = get_user_tenant()
    conn = get_db_connection()
    cursor = conn.cursor()

    today_str = datetime.now().strftime('%Y-%m-%d')
    five_days_ahead = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')

    cursor.execute("SELECT COUNT(*), COALESCE(SUM(total), 0) FROM invoices WHERE tenant_id = ? AND DATE(created_at) = ?", (tenant_id, today_str))
    today_count, today_sales = cursor.fetchone()

    cursor.execute("SELECT COUNT(*) FROM products WHERE tenant_id = ? AND stock_quantity <= min_stock_alert", (tenant_id,))
    low_stock_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM products WHERE tenant_id = ? AND expiry_date IS NOT NULL AND expiry_date <= ?", (tenant_id, five_days_ahead))
    expiring_count = cursor.fetchone()[0]

    cursor.execute("SELECT COALESCE(SUM(balance), 0) FROM customers WHERE tenant_id = ?", (tenant_id,))
    total_udhaar = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM products WHERE tenant_id = ?", (tenant_id,))
    total_products = cursor.fetchone()[0]

    cursor.execute("SELECT * FROM invoices WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 5", (tenant_id,))
    recent_invoices = [dict(row) for row in cursor.fetchall()]

    cursor.execute("SELECT * FROM products WHERE tenant_id = ? AND stock_quantity <= min_stock_alert ORDER BY stock_quantity ASC LIMIT 5", (tenant_id,))
    low_stock_items = [dict(row) for row in cursor.fetchall()]

    cursor.execute("SELECT * FROM products WHERE tenant_id = ? AND expiry_date IS NOT NULL AND expiry_date <= ? ORDER BY expiry_date ASC LIMIT 5", (tenant_id, five_days_ahead))
    expiring_items = [dict(row) for row in cursor.fetchall()]

    conn.close()
    return jsonify({
        "metrics": {
            "today_sales": today_sales, "today_bills_count": today_count,
            "low_stock_count": low_stock_count, "expiring_soon_count": expiring_count,
            "total_udhaar_outstanding": total_udhaar, "total_products": total_products
        },
        "recent_invoices": recent_invoices,
        "low_stock_items": low_stock_items,
        "expiring_items": expiring_items
    })

@app.route('/api/products', methods=['GET'])
@jwt_required()
def get_products():
    _, tenant_id, _ = get_user_tenant()
    search = request.args.get('search', '').strip()
    category = request.args.get('category', '').strip()
    expiring_only = request.args.get('expiring', '').lower() == 'true'
    low_stock_only = request.args.get('low_stock', '').lower() == 'true'

    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM products WHERE tenant_id = ?"
    params = [tenant_id]

    if search:
        query += " AND (name LIKE ? OR barcode LIKE ? OR batch_no LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
    if category:
        query += " AND category = ?"
        params.append(category)
    if low_stock_only:
        query += " AND stock_quantity <= min_stock_alert"
    if expiring_only:
        seven_days = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
        query += " AND expiry_date IS NOT NULL AND expiry_date <= ?"
        params.append(seven_days)

    query += " ORDER BY id DESC"
    cursor.execute(query, params)
    products = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(products)

@app.route('/api/products', methods=['POST'])
@jwt_required()
def add_product():
    _, tenant_id, _ = get_user_tenant()
    data = request.json or {}
    name = data.get('name')
    if not name: return jsonify({"error": "Product name required"}), 400

    barcode = data.get('barcode') or f"890{random.randint(1000000000, 9999999999)}"
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
        INSERT INTO products (tenant_id, name, barcode, category, selling_price, cost_price, unit, stock_quantity, min_stock_alert, expiry_date, batch_no, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            tenant_id, name, barcode, data.get('category', 'Kirana / Staple'), float(data.get('selling_price', 0)),
            float(data.get('cost_price', 0)), data.get('unit', 'pcs'), float(data.get('stock_quantity', 0)),
            float(data.get('min_stock_alert', 10)), data.get('expiry_date'), data.get('batch_no'), data.get('image_url')
        ))
        conn.commit()
        product_id = cursor.lastrowid
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        new_prod = dict(cursor.fetchone())
        conn.close()
        return jsonify(new_prod), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "Barcode already exists for this tenant"}), 400

@app.route('/api/products/<int:prod_id>', methods=['PUT'])
@jwt_required()
def update_product(prod_id):
    _, tenant_id, _ = get_user_tenant()
    data = request.json or {}
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    UPDATE products SET
        name = COALESCE(?, name), category = COALESCE(?, category), selling_price = COALESCE(?, selling_price),
        cost_price = COALESCE(?, cost_price), unit = COALESCE(?, unit), stock_quantity = COALESCE(?, stock_quantity),
        min_stock_alert = COALESCE(?, min_stock_alert), expiry_date = ?, batch_no = COALESCE(?, batch_no),
        image_url = COALESCE(?, image_url)
    WHERE id = ? AND tenant_id = ?
    ''', (
        data.get('name'), data.get('category'), data.get('selling_price'), data.get('cost_price'),
        data.get('unit'), data.get('stock_quantity'), data.get('min_stock_alert'), data.get('expiry_date'),
        data.get('batch_no'), data.get('image_url'), prod_id, tenant_id
    ))
    conn.commit()
    cursor.execute("SELECT * FROM products WHERE id = ?", (prod_id,))
    updated_prod = dict(cursor.fetchone())
    conn.close()
    return jsonify(updated_prod)

@app.route('/api/products/<int:prod_id>', methods=['DELETE'])
@jwt_required()
def delete_product(prod_id):
    _, tenant_id, _ = get_user_tenant()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products WHERE id = ? AND tenant_id = ?", (prod_id, tenant_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Product deleted"})

@app.route('/api/billing/checkout', methods=['POST'])
@jwt_required()
def checkout():
    _, tenant_id, _ = get_user_tenant()
    data = request.json or {}
    items = data.get('items', [])
    payment_method = data.get('payment_method', 'Cash')
    customer_id = data.get('customer_id')
    customer_name = data.get('customer_name', 'Walk-in Customer')
    customer_phone = data.get('customer_phone', '')
    discount = float(data.get('discount', 0.0))
    gst_percent = float(data.get('gst_percent', 0.0))

    if not items: return jsonify({"error": "Cart is empty"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    subtotal = 0.0
    processed_items = []

    for item in items:
        cursor.execute("SELECT * FROM products WHERE id = ? AND tenant_id = ?", (item['product_id'], tenant_id))
        prod = cursor.fetchone()
        if not prod:
            conn.close()
            return jsonify({"error": f"Product ID {item['product_id']} not found"}), 404
        
        unit_price = float(prod['selling_price'])
        qty = float(item['quantity'])
        subtotal += unit_price * qty

        cursor.execute("UPDATE products SET stock_quantity = ? WHERE id = ?", (prod['stock_quantity'] - qty, prod['id']))
        processed_items.append({
            "product_id": prod['id'], "product_name": prod['name'],
            "quantity": qty, "unit_price": unit_price, "total_price": unit_price * qty
        })

    gst_amount = (subtotal - discount) * (gst_percent / 100.0)
    total_amount = max(0.0, (subtotal - discount) + gst_amount)
    invoice_no = f"INV-{tenant_id}-{random.randint(1000, 9999)}"

    if payment_method == 'Udhaar':
        if not customer_id: return jsonify({"error": "Customer needed for Udhaar"}), 400
        cursor.execute("SELECT * FROM customers WHERE id = ? AND tenant_id = ?", (customer_id, tenant_id))
        cust = cursor.fetchone()
        if not cust: return jsonify({"error": "Customer not found"}), 404
        cursor.execute("UPDATE customers SET balance = ? WHERE id = ?", (cust['balance'] + total_amount, customer_id))

    cursor.execute('''
    INSERT INTO invoices (tenant_id, invoice_number, customer_name, customer_phone, payment_method, subtotal, discount, gst_amount, total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (tenant_id, invoice_no, customer_name, customer_phone, payment_method, subtotal, discount, gst_amount, total_amount))
    
    invoice_id = cursor.lastrowid

    for pi in processed_items:
        cursor.execute('''
        INSERT INTO invoice_items (tenant_id, invoice_id, product_id, product_name, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (tenant_id, invoice_id, pi['product_id'], pi['product_name'], pi['quantity'], pi['unit_price'], pi['total_price']))

    if payment_method == 'Udhaar' and customer_id:
        cursor.execute('''
        INSERT INTO udhaar_transactions (tenant_id, customer_id, type, amount, invoice_id, note)
        VALUES (?, ?, 'CREDIT', ?, ?, ?)
        ''', (tenant_id, customer_id, total_amount, invoice_id, f"Udhaar bill #{invoice_no}"))

    conn.commit()
    cursor.execute("SELECT * FROM invoices WHERE id = ?", (invoice_id,))
    inv_data = dict(cursor.fetchone())
    inv_data['items'] = processed_items
    conn.close()
    return jsonify({"message": "Bill generated!", "invoice": inv_data}), 201

@app.route('/api/udhaar/customers', methods=['GET'])
@jwt_required()
def get_udhaar_customers():
    _, tenant_id, _ = get_user_tenant()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM customers WHERE tenant_id = ? ORDER BY balance DESC", (tenant_id,))
    customers = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(customers)

@app.route('/api/udhaar/customers', methods=['POST'])
@jwt_required()
def add_udhaar_customer():
    _, tenant_id, _ = get_user_tenant()
    data = request.json or {}
    if not data.get('name') or not data.get('phone'): return jsonify({"error": "Name and phone required"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO customers (tenant_id, name, phone, address, credit_limit)
    VALUES (?, ?, ?, ?, ?)
    ''', (tenant_id, data.get('name'), data.get('phone'), data.get('address', ''), float(data.get('credit_limit', 5000.0))))
    conn.commit()
    cust_id = cursor.lastrowid
    cursor.execute("SELECT * FROM customers WHERE id = ?", (cust_id,))
    customer = dict(cursor.fetchone())
    conn.close()
    return jsonify(customer), 201

@app.route('/api/udhaar/transactions/<int:customer_id>', methods=['GET'])
@jwt_required()
def get_udhaar_history(customer_id):
    _, tenant_id, _ = get_user_tenant()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM udhaar_transactions WHERE customer_id = ? AND tenant_id = ? ORDER BY created_at DESC", (customer_id, tenant_id))
    txs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(txs)

@app.route('/api/udhaar/payment', methods=['POST'])
@jwt_required()
def record_udhaar_payment():
    _, tenant_id, _ = get_user_tenant()
    data = request.json or {}
    customer_id = data.get('customer_id')
    amount = float(data.get('amount', 0.0))

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM customers WHERE id = ? AND tenant_id = ?", (customer_id, tenant_id))
    cust = cursor.fetchone()
    if not cust: return jsonify({"error": "Customer not found"}), 404

    new_balance = max(0.0, cust['balance'] - amount)
    cursor.execute("UPDATE customers SET balance = ? WHERE id = ?", (new_balance, customer_id))
    cursor.execute('''
    INSERT INTO udhaar_transactions (tenant_id, customer_id, type, amount, note)
    VALUES (?, ?, 'PAYMENT', ?, ?)
    ''', (tenant_id, customer_id, amount, data.get('note', 'Udhaar payment received')))

    conn.commit()
    conn.close()
    return jsonify({"message": "Payment recorded"})

@app.route('/api/suppliers', methods=['GET'])
@jwt_required()
def get_suppliers():
    _, tenant_id, _ = get_user_tenant()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM suppliers WHERE tenant_id = ? ORDER BY id DESC", (tenant_id,))
    suppliers = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(suppliers)

@app.route('/api/suppliers', methods=['POST'])
@jwt_required()
def add_supplier():
    _, tenant_id, _ = get_user_tenant()
    data = request.json or {}
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO suppliers (tenant_id, name, contact_person, phone, category, last_restock_date)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', (tenant_id, data.get('name'), data.get('contact_person', ''), data.get('phone'), data.get('category', 'General'), datetime.now().strftime('%Y-%m-%d')))
    conn.commit()
    sup_id = cursor.lastrowid
    cursor.execute("SELECT * FROM suppliers WHERE id = ?", (sup_id,))
    sup = dict(cursor.fetchone())
    conn.close()
    return jsonify(sup), 201

@app.route('/api/invoices', methods=['GET'])
@jwt_required()
def get_invoices():
    _, tenant_id, _ = get_user_tenant()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM invoices WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 50", (tenant_id,))
    invoices = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(invoices)

@app.route('/api/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    _, tenant_id, _ = get_user_tenant()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COALESCE(SUM(total),0), COUNT(*) FROM invoices WHERE tenant_id = ?", (tenant_id,))
    tot_rev, tot_bills = cursor.fetchone()
    
    conn.close()
    return jsonify({
        "total_revenue": tot_rev,
        "total_bills": tot_bills,
        "avg_bill_value": tot_rev / (tot_bills or 1),
        "daily_sales": [{"date": (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d'), "revenue": random.randint(100, 5000)} for i in range(6, -1, -1)],
        "payment_breakdown": [{"method": "UPI", "revenue": tot_rev * 0.6}, {"method": "Cash", "revenue": tot_rev * 0.3}, {"method": "Udhaar", "revenue": tot_rev * 0.1}],
        "category_breakdown": [{"category": "Staples", "revenue": tot_rev * 0.5}, {"category": "Dairy", "revenue": tot_rev * 0.3}]
    })

@app.route('/api/products/upload', methods=['POST'])
@jwt_required()
def upload_products_csv():
    _, tenant_id, _ = get_user_tenant()
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if not file.filename.endswith('.csv'):
        return jsonify({"error": "Must be a CSV file"}), 400

    stream = StringIO(file.stream.read().decode("UTF8"), newline=None)
    csv_input = csv.DictReader(stream)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    count = 0
    for row in csv_input:
        name = row.get('name')
        if not name:
            continue
        
        barcode = row.get('barcode') or f"890{random.randint(1000000000, 9999999999)}"
        category = row.get('category', 'General')
        selling_price = float(row.get('selling_price', 0) or 0)
        cost_price = float(row.get('cost_price', 0) or 0)
        unit = row.get('unit', 'pcs')
        stock_quantity = float(row.get('stock_quantity', 0) or 0)
        min_stock_alert = float(row.get('min_stock_alert', 10) or 10)
        expiry_date = row.get('expiry_date') or None
        batch_no = row.get('batch_no') or None
        
        try:
            cursor.execute('''
            INSERT INTO products (tenant_id, name, barcode, category, selling_price, cost_price, unit, stock_quantity, min_stock_alert, expiry_date, batch_no)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (tenant_id, name, barcode, category, selling_price, cost_price, unit, stock_quantity, min_stock_alert, expiry_date, batch_no))
            count += 1
        except sqlite3.IntegrityError:
            pass # Skip duplicate barcodes
            
    conn.commit()
    conn.close()
    
    return jsonify({"message": f"Successfully imported {count} products."}), 201

@app.route('/api/suppliers/upload', methods=['POST'])
@jwt_required()
def upload_suppliers_csv():
    _, tenant_id, _ = get_user_tenant()
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if not file.filename.endswith('.csv'):
        return jsonify({"error": "Must be a CSV file"}), 400

    stream = StringIO(file.stream.read().decode("UTF8"), newline=None)
    csv_input = csv.DictReader(stream)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    count = 0
    for row in csv_input:
        name = row.get('name')
        phone = row.get('phone')
        if not name or not phone:
            continue
            
        contact_person = row.get('contact_person', '')
        category = row.get('category', 'General')
        
        cursor.execute('''
        INSERT INTO suppliers (tenant_id, name, contact_person, phone, category, last_restock_date)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (tenant_id, name, contact_person, phone, category, datetime.now().strftime('%Y-%m-%d')))
        count += 1
            
    conn.commit()
    conn.close()
    
    return jsonify({"message": f"Successfully imported {count} suppliers."}), 201

# ==========================================
# ☁️ AWS CLOUD SERVICES ROUTES
# 1. AWS EC2 (Compute runtime & metrics)
# 2. AWS S3 (Storage & Backups)
# 3. AWS CloudFront (CDN delivery & invalidation)
# ==========================================

@app.route('/static/cloud_s3/<path:filename>')
def serve_cloud_s3_static(filename):
    static_dir = os.path.join(os.path.dirname(__file__), 'static', 'cloud_s3')
    return send_from_directory(static_dir, filename)

@app.route('/api/cloud/status', methods=['GET'])
def get_cloud_status():
    status = cloud_manager.get_cloud_status()
    return jsonify(status)

@app.route('/api/cloud/s3/upload', methods=['POST'])
@jwt_required()
def upload_cloud_media():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if not file.filename:
        return jsonify({"error": "Empty filename"}), 400

    folder = request.form.get('folder', 'products')
    file_bytes = file.read()
    result = cloud_manager.upload_file_to_s3(file_bytes, file.filename, folder=folder)
    return jsonify(result), 201

@app.route('/api/cloud/s3/backup', methods=['POST'])
@jwt_required()
def create_cloud_backup():
    _, tenant_id, _ = get_user_tenant()
    try:
        backup_result = cloud_manager.create_database_backup(DB_PATH, tenant_id=tenant_id)
        
        # Save backup metadata to cloud_backups table
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
        INSERT INTO cloud_backups (tenant_id, filename, s3_key, cloudfront_url, size_bytes, backup_type)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            tenant_id,
            backup_result['backup_filename'],
            backup_result['s3_key'],
            backup_result['cloudfront_url'],
            backup_result['size_bytes'],
            'database'
        ))
        conn.commit()
        backup_id = cursor.lastrowid
        cursor.execute("SELECT * FROM cloud_backups WHERE id = ?", (backup_id,))
        record = dict(cursor.fetchone())
        conn.close()

        return jsonify({
            "message": "Database backup created and successfully uploaded to AWS S3 & CloudFront CDN",
            "backup": record
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/cloud/s3/backups', methods=['GET'])
@jwt_required()
def get_cloud_backups():
    _, tenant_id, _ = get_user_tenant()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cloud_backups WHERE tenant_id = ? ORDER BY id DESC LIMIT 20", (tenant_id,))
    backups = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(backups)

@app.route('/api/cloud/cloudfront/invalidate', methods=['POST'])
@jwt_required()
def invalidate_cloudfront():
    data = request.json or {}
    paths = data.get('paths', ['/*'])
    result = cloud_manager.invalidate_cloudfront_cache(paths=paths)
    return jsonify(result)

if __name__ == '__main__':
    init_db()
    print("KIRANA-OS SaaS Backend running on http://127.0.0.1:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
