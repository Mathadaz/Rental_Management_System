from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from models.models import (
    MaintenanceStatus, MaintenancePriority,
    PaymentMethod, LeaseStatus, ExpenseCategory
)


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── Property ──────────────────────────────────────────────────────────────────

class PropertyCreate(BaseModel):
    name: str
    address: str
    city: str
    province: str
    postal_code: Optional[str] = None
    property_type: Optional[str] = None
    bedrooms: Optional[int] = 0
    bathrooms: Optional[float] = 0
    size_sqm: Optional[float] = None
    notes: Optional[str] = None

class PropertyUpdate(PropertyCreate):
    pass

class PropertyOut(PropertyCreate):
    id: int
    owner_id: int
    created_at: datetime
    class Config:
        from_attributes = True


# ── Unit ──────────────────────────────────────────────────────────────────────

class UnitCreate(BaseModel):
    unit_number: str
    monthly_rent: float = Field(..., gt=0)
    deposit: Optional[float] = 0
    is_occupied: Optional[bool] = False
    notes: Optional[str] = None

class UnitUpdate(UnitCreate):
    pass

class UnitOut(UnitCreate):
    id: int
    property_id: int
    class Config:
        from_attributes = True


# ── Tenant ────────────────────────────────────────────────────────────────────

class TenantCreate(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    id_number: Optional[str] = None
    employer: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    notes: Optional[str] = None

class TenantUpdate(TenantCreate):
    pass

class TenantOut(TenantCreate):
    id: int
    owner_id: int
    created_at: datetime
    class Config:
        from_attributes = True


# ── Lease ─────────────────────────────────────────────────────────────────────

class LeaseCreate(BaseModel):
    unit_id: int
    tenant_id: int
    start_date: datetime
    end_date: datetime
    monthly_rent: float = Field(..., gt=0)
    deposit_paid: Optional[float] = 0
    status: Optional[LeaseStatus] = LeaseStatus.active
    notes: Optional[str] = None

class LeaseUpdate(BaseModel):
    end_date: Optional[datetime] = None
    monthly_rent: Optional[float] = None
    deposit_paid: Optional[float] = None
    status: Optional[LeaseStatus] = None
    notes: Optional[str] = None

class LeaseOut(LeaseCreate):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True


# ── Payment ───────────────────────────────────────────────────────────────────

class PaymentCreate(BaseModel):
    amount: float = Field(..., gt=0)
    payment_date: datetime
    period_month: int = Field(..., ge=1, le=12)
    period_year: int = Field(..., ge=2000)
    method: Optional[PaymentMethod] = PaymentMethod.bank_transfer
    reference: Optional[str] = None
    notes: Optional[str] = None

class PaymentOut(PaymentCreate):
    id: int
    lease_id: int
    created_at: datetime
    class Config:
        from_attributes = True


# ── Maintenance ───────────────────────────────────────────────────────────────

class MaintenanceCreate(BaseModel):
    unit_id: int
    title: str
    description: Optional[str] = None
    priority: Optional[MaintenancePriority] = MaintenancePriority.medium
    raised_by: Optional[str] = None
    assigned_to: Optional[str] = None
    estimated_cost: Optional[float] = None

class MaintenanceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[MaintenancePriority] = None
    status: Optional[MaintenanceStatus] = None
    assigned_to: Optional[str] = None
    estimated_cost: Optional[float] = None
    actual_cost: Optional[float] = None
    resolved_at: Optional[datetime] = None

class MaintenanceOut(MaintenanceCreate):
    id: int
    status: MaintenanceStatus
    actual_cost: Optional[float] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    class Config:
        from_attributes = True


# ── Expense ───────────────────────────────────────────────────────────────────

class ExpenseCreate(BaseModel):
    category: ExpenseCategory
    amount: float = Field(..., gt=0)
    description: Optional[str] = None
    expense_date: datetime
    receipt_url: Optional[str] = None
    notes: Optional[str] = None

class ExpenseUpdate(ExpenseCreate):
    pass

class ExpenseOut(ExpenseCreate):
    id: int
    property_id: int
    created_at: datetime
    class Config:
        from_attributes = True


# ── Dashboard ─────────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_properties: int
    total_units: int
    occupied_units: int
    vacant_units: int
    occupancy_rate: float
    total_monthly_income: float
    total_expenses_this_month: float
    overdue_payments_count: int
    open_maintenance_requests: int
