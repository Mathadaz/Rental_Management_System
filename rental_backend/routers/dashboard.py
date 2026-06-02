from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime
from db.database import get_db
from models.models import (
    Property, Unit, Lease, Payment, MaintenanceRequest,
    Expense, User, LeaseStatus, MaintenanceStatus
)
from schemas.schemas import DashboardStats
from auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardStats)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.utcnow()

    # Properties
    property_ids = [
        p.id for p in db.query(Property.id).filter(Property.owner_id == current_user.id).all()
    ]

    total_properties = len(property_ids)

    # Units
    units = db.query(Unit).filter(Unit.property_id.in_(property_ids)).all()
    total_units = len(units)
    occupied_units = sum(1 for u in units if u.is_occupied)
    vacant_units = total_units - occupied_units
    occupancy_rate = (occupied_units / total_units * 100) if total_units else 0

    # Monthly income from active leases
    active_leases = (
        db.query(Lease)
        .join(Unit, Lease.unit_id == Unit.id)
        .filter(
            Unit.property_id.in_(property_ids),
            Lease.status == LeaseStatus.active
        )
        .all()
    )
    total_monthly_income = sum(l.monthly_rent for l in active_leases)

    # Expenses this month
    expenses_this_month = (
        db.query(func.sum(Expense.amount))
        .filter(
            Expense.property_id.in_(property_ids),
            extract("month", Expense.expense_date) == now.month,
            extract("year", Expense.expense_date) == now.year,
        )
        .scalar() or 0
    )

    # Overdue: active leases with no payment this month
    paid_lease_ids = set(
        p.lease_id for p in db.query(Payment.lease_id).filter(
            Payment.period_month == now.month,
            Payment.period_year == now.year,
            Payment.lease_id.in_([l.id for l in active_leases])
        ).all()
    )
    overdue_payments_count = sum(
        1 for l in active_leases if l.id not in paid_lease_ids
    )

    # Open maintenance
    open_maintenance = (
        db.query(MaintenanceRequest)
        .join(Unit, MaintenanceRequest.unit_id == Unit.id)
        .filter(
            Unit.property_id.in_(property_ids),
            MaintenanceRequest.status == MaintenanceStatus.open
        )
        .count()
    )

    return DashboardStats(
        total_properties=total_properties,
        total_units=total_units,
        occupied_units=occupied_units,
        vacant_units=vacant_units,
        occupancy_rate=round(occupancy_rate, 1),
        total_monthly_income=total_monthly_income,
        total_expenses_this_month=expenses_this_month,
        overdue_payments_count=overdue_payments_count,
        open_maintenance_requests=open_maintenance,
    )
