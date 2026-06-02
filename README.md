# Rental_Management_System
A full-stack Rental Property Management System built with Python FastAPI (backend), React + Vite (frontend), JWT authentication, and SQLite3 database.

The system helps landlords and property managers efficiently manage:

🏘️ Properties & Units
👨‍👩‍👧 Tenants
📄 Lease Agreements
🛠️ Maintenance Requests
💰 Expenses & Rent tracking
📊 Dashboard analytics

It is inspired by real-world property management workflows used in rental agencies and landlords.

🚀 Tech Stack

Backend

FastAPI
Python 3.10+
SQLite3
JWT Authentication
Uvicorn

Frontend

React (Vite)
Axios
Tailwind CSS / CSS (if applicable)

rental_backend/
│
├── db/
│   └── database.py
│
├── models/
│   └── models.py
│
├── routers/
│   ├── auth_router.py
│   ├── dashboard.py
│   ├── expenses.py
│   ├── leases.py
│   ├── maintenance.py
│   ├── properties.py
│   ├── tenants.py
│   └── units.py
│
├── schemas/
│   └── schemas.py
│
├── auth.py
├── main.py
├── rental.db
└── requirements.txt

⚙️ Backend Setup (FastAPI - rental_backend)
1. Navigate to backend folder
cd rental_backend
2. Create virtual environment (recommended)
python -m venv venv
3. Activate virtual environment

Windows:

venv\Scripts\activate

Mac/Linux:

source venv/bin/activate
4. Install dependencies
pip install fastapi uvicorn sqlite3 python-jose passlib bcrypt

If you have a requirements.txt, use:

pip install -r requirements.txt
5. Run the FastAPI server
uvicorn main:app --reload

If your main.py is inside a folder or package, use:

uvicorn rental_backend.main:app --reload
🌐 Backend will run at:
http://127.0.0.1:8000
📘 API Docs (Swagger UI):
http://127.0.0.1:8000/docs
