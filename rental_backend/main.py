from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.database import engine, Base
import models.models  # ensure all models are registered

from routers import auth_router, properties, units, tenants, leases, maintenance, expenses, dashboard

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Rental Property Management API",
    description="Backend API for managing rental properties, tenants, leases, payments, and maintenance.",
    version="1.0.0",
)

# CORS — update origins for production
app.add_middleware(
    CORSMiddleware,
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.database import engine, Base
import models.models  # ensure all models are registered

from routers import auth_router, properties, units, tenants, leases, maintenance, expenses, dashboard

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Rental Property Management API",
    description="Backend API for managing rental properties, tenants, leases, payments, and maintenance.",
    version="1.0.0",
)

# CORS — update origins for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://rental-management-system-hh5a.onrender.com/", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router.router)
app.include_router(properties.router)
app.include_router(units.router)
app.include_router(tenants.router)
app.include_router(leases.router)
app.include_router(maintenance.router)
app.include_router(expenses.router)
app.include_router(dashboard.router)


@app.get("/", tags=["Health"])
def health():
    return {"status": "ok", "message": "Rental API running"}
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router.router)
app.include_router(properties.router)
app.include_router(units.router)
app.include_router(tenants.router)
app.include_router(leases.router)
app.include_router(maintenance.router)
app.include_router(expenses.router)
app.include_router(dashboard.router)


@app.get("/", tags=["Health"])
def health():
    return {"status": "ok", "message": "Rental API running"}
