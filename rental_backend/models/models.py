from sqlalchemy import (
    Column, Integer, String, Float, Boolean,
    DateTime, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from db.database import Base


# ── Enums ─────────────────────────────────────────────────────────────────────

class MaintenanceStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"

class MaintenancePriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"

class PaymentMethod(str, enum.Enum):
    bank_transfer = "bank_transfer"
    cash = "cash"
    eft = "eft"
    card = "card"

class LeaseStatus(str, enum.Enum):
    active = "active"
    expired = "expired"
    terminated = "terminated"

class ExpenseCategory(str, enum.Enum):
    maintenance = "maintenance"
    utilities = "utilities"
    insurance = "insurance"
    rates = "rates"
    management = "management"
    other = "other"


# ── Models ────────────────────────────────────────────────────────────────────

class User(Base):
    """Landlord / property manager account."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    properties = relationship("Property", back_populates="owner", cascade="all, delete-orphan")


class Property(Base):
    """A physical rental property."""
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(150), nullable=False)           # e.g. "Sandton Flat 4B"
    address = Column(String(300), nullable=False)
    city = Column(String(100), nullable=False)
    province = Column(String(100), nullable=False)
    postal_code = Column(String(10))
    property_type = Column(String(50))                    # apartment, house, commercial
    bedrooms = Column(Integer, default=0)
    bathrooms = Column(Float, default=0)
    size_sqm = Column(Float)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="properties")
    units = relationship("Unit", back_populates="property", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="property", cascade="all, delete-orphan")


class Unit(Base):
    """A rentable unit within a property (or the whole property itself)."""
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    unit_number = Column(String(20), nullable=False)      # "1", "2A", "Flat 3"
    monthly_rent = Column(Float, nullable=False)
    deposit = Column(Float, default=0)
    is_occupied = Column(Boolean, default=False)
    notes = Column(Text)

    property = relationship("Property", back_populates="units")
    leases = relationship("Lease", back_populates="unit", cascade="all, delete-orphan")
    maintenance_requests = relationship("MaintenanceRequest", back_populates="unit", cascade="all, delete-orphan")


class Tenant(Base):
    """A tenant's personal profile (independent of any one lease)."""
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)   # who manages them
    full_name = Column(String(120), nullable=False)
    email = Column(String(150), index=True)
    phone = Column(String(30))
    id_number = Column(String(20))                        # SA ID / passport
    employer = Column(String(150))
    emergency_contact_name = Column(String(120))
    emergency_contact_phone = Column(String(30))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    leases = relationship("Lease", back_populates="tenant", cascade="all, delete-orphan")


class Lease(Base):
    """A rental agreement linking a tenant to a unit."""
    __tablename__ = "leases"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    monthly_rent = Column(Float, nullable=False)          # rent locked at signing
    deposit_paid = Column(Float, default=0)
    status = Column(Enum(LeaseStatus), default=LeaseStatus.active)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    unit = relationship("Unit", back_populates="leases")
    tenant = relationship("Tenant", back_populates="leases")
    payments = relationship("Payment", back_populates="lease", cascade="all, delete-orphan")


class Payment(Base):
    """A rent payment against a lease."""
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    lease_id = Column(Integer, ForeignKey("leases.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_date = Column(DateTime(timezone=True), nullable=False)
    period_month = Column(Integer, nullable=False)        # 1-12
    period_year = Column(Integer, nullable=False)
    method = Column(Enum(PaymentMethod), default=PaymentMethod.bank_transfer)
    reference = Column(String(100))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    lease = relationship("Lease", back_populates="payments")


class MaintenanceRequest(Base):
    """A maintenance or repair request raised for a unit."""
    __tablename__ = "maintenance_requests"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    priority = Column(Enum(MaintenancePriority), default=MaintenancePriority.medium)
    status = Column(Enum(MaintenanceStatus), default=MaintenanceStatus.open)
    raised_by = Column(String(120))                       # tenant name or "landlord"
    assigned_to = Column(String(120))                     # contractor / person
    estimated_cost = Column(Float)
    actual_cost = Column(Float)
    resolved_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    unit = relationship("Unit", back_populates="maintenance_requests")


class Expense(Base):
    """A property-level expense (rates, insurance, repairs, etc.)."""
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    category = Column(Enum(ExpenseCategory), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String(300))
    expense_date = Column(DateTime(timezone=True), nullable=False)
    receipt_url = Column(String(500))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    property = relationship("Property", back_populates="expenses")


class Document(Base):
    """Uploaded document (lease PDF, inspection report, ID copy, etc.)."""
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    related_type = Column(String(50))   # "lease", "tenant", "property", "maintenance"
    related_id = Column(Integer)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)
    mime_type = Column(String(100))
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
