# Kirana-OS

**Kirana-OS** is an intelligent, modern Operating System and Retail Point of Sale (POS) tailored for Indian Kirana stores and local retail businesses. It bridges traditional neighborhood commerce with modern SaaS capabilities—featuring automated billing, real-time inventory control, Udhaar (credit ledger) tracking, batch/expiry alerts, and supplier management.

---

## ✨ Features

- **⚡ Fast POS Billing**: Rapid barcode scanning, item search, multiple payment methods (Cash, UPI, Udhaar), automated GST & discount calculations, and receipt generation.
- **📒 Udhaar (Khata) Ledger**: Digital credit tracking per customer with credit limits, transaction histories, and balance management.
- **📦 Inventory & Stock Control**: Real-time stock counts, minimum stock alert triggers, and batch number tracking.
- **⏳ Expiry Tracking**: Proactive alerts for items approaching expiry to minimize wastage and stock spoilage.
- **🚚 Supplier Management**: Centralized supplier directory with contact details, category tracking, pending purchase orders, and CSV bulk import.
- **📊 Real-time Dashboard**: Live revenue analytics, sales summaries, low-stock warnings, and recent transaction insights.
- **🏢 Multi-Tenant SaaS Architecture**: Built-in tenant separation with role-based access control (Owner, Staff) and JWT authentication.

---

## 🛠️ Tech Stack

- **Frontend**:
  - [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
  - [Vite](https://vitejs.dev/) for high-speed builds & HMR
  - [Lucide Icons](https://lucide.dev/)
  - Modern Responsive CSS
- **Backend**:
  - [Python](https://www.python.org/) + [Flask](https://flask.palletsprojects.com/)
  - [Flask-CORS](https://flask-cors.readthedocs.io/)
  - [Flask-JWT-Extended](https://flask-jwt-extended.readthedocs.io/) for authentication
  - [Bcrypt](https://pypi.org/project/bcrypt/) for password hashing
  - [SQLite](https://sqlite.org/) for zero-config relational storage

---

## 📁 Repository Structure

```
Kirana-OS/
├── backend/
│   ├── app.py                # Flask REST API & SQLite DB layer
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── src/                  # React components & UI views
│   ├── package.json          # Frontend dependencies & scripts
│   └── vite.config.ts        # Vite configuration
├── demo_products.csv         # Sample product catalog for import
├── demo_suppliers.csv        # Sample supplier records for import
├── Synopsis_Presentation.pptx# Project presentation
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python** 3.9+
- **Node.js** 18+ and **npm**

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the Flask server
python app.py
```
> The backend server starts at `http://127.0.0.1:5000` with auto-seeded demo credentials and data.

**Default Login Credentials:**
- **Email**: `admin@kirana.com`
- **Password**: `password123`

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install packages
npm install

# Start the development server
npm run dev
```
> The frontend application starts at `http://localhost:5173`.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
