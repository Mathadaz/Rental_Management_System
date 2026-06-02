# Rental_Management_System
A full-stack Rental Property Management System built using FastAPI for the backend, React + Vite for the frontend, JWT authentication, and SQLite as the database.

The system is designed to help landlords and property managers efficiently manage properties, tenants, leases, maintenance requests, expenses, and rental analytics.

# Features

Property and unit management
Tenant management system
Lease agreement tracking
Maintenance request handling
Expense and rent tracking
Dashboard analytics
Secure JWT authentication and authorization

# Tech Stack
## Backend
FastAPI
Python 3.10+
SQLite3
JWT Authentication (python-jose)
Uvicorn

## Frontend
React (Vite)
Axios
Tailwind CSS

# Project Structure

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

# Backend Setup (FastAPI - rental_backend)

1. Clone repository
2. git clone https://github.com/MathadaZ/Rental_Management_System.git
cd Rental_Management_System/rental_backend

2. Create virtual environment
. python -m venv venv
3. Activate virtual environment

## Windows

venv\Scripts\activate

## Mac/Linux

source venv/bin/activate
4. Install dependencies
pip install -r requirements.txt

If needed manually:

pip install fastapi uvicorn python-jose passlib bcrypt
5. Run backend server
uvicorn main:app --reload

If running as a module:

uvicorn rental_backend.main:app --reload
Backend API
Base URL:
http://127.0.0.1:8000
Swagger Documentation:
http://127.0.0.1:8000/docs
Redoc Documentation:
http://127.0.0.1:8000/redoc

# Frontend Setup (React + Vite)

## 1. Navigate to frontend
cd frontend
## 2. Install dependencies
npm install
## 3. Run development server
npm run dev

### Frontend URL
http://localhost:5173

# Authentication

The system uses JWT (JSON Web Token) authentication for:

User login and registration
Secure API access
Protected routes
Session handling

# Database
SQLite3 database: rental.db
Auto-generated on first run
Can be upgraded to PostgreSQL for production environments

# Running Full Stack Application
## Backend
### cd rental_backend
uvicorn main:app --reload

## Frontend
cd frontend
npm install
npm run dev

## Future Improvements
Email notification system for rent reminders
Payment gateway integration
Role-based access control (Admin, Landlord, Tenant)
Cloud deployment (Render, AWS, Azure)
Mobile application support

# Author

Zwivhuya Mathada

# License

This project is licensed under the MIT License.
