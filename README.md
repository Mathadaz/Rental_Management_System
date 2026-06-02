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
Tailwind CSS (optional)

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
