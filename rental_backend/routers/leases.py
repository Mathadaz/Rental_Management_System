from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db.database import get_db
from models.models import Lease, Payment, Unit, Property, Tenant, User
from schemas.schemas import (
    LeaseCreate, LeaseUpdate, LeaseOut,
    PaymentCreate, PaymentOut
)
from auth import get_current_user

router = APIRouter(tags=["Leases & Payments"])


# ── Helpers ───────────────────────────────────────────────────────────────────

def _owner_lease(lease_id: int, current_user: User, db: Session) -> Lease:
    lease = (
        db.query(Lease)
        .join(Unit, Lease.unit_id == Unit.id)
        .join(Property, Unit.property_id == Property.id)
        .filter(Lease.id == lease_id, Property.owner_id == current_user.id)
        .first()
    )
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
    return lease


# ── Leases ────────────────────────────────────────────────────────────────────

@router.post("/leases", response_model=LeaseOut, status_code=201)
def create_lease(
    payload: LeaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify unit belongs to this user
    unit = (
        db.query(Unit)
        .join(Property, Unit.property_id == Property.id)
        .filter(Unit.id == payload.unit_id, Property.owner_id == current_user.id)
        .first()
    )
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")

    # Verify tenant belongs to this user
    tenant = db.query(Tenant).filter(
        Tenant.id == payload.tenant_id,
        Tenant.owner_id == current_user.id
    ).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    lease = Lease(**payload.model_dump())
    unit.is_occupied = True
    db.add(lease)
    db.commit()
    db.refresh(lease)
    return lease


@router.get("/leases", response_model=List[LeaseOut])
def list_leases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Lease)
        .join(Unit, Lease.unit_id == Unit.id)
        .join(Property, Unit.property_id == Property.id)
        .filter(Property.owner_id == current_user.id)
        .all()
    )


@router.get("/leases/{lease_id}", response_model=LeaseOut)
def get_lease(
    lease_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return _owner_lease(lease_id, current_user, db)


@router.put("/leases/{lease_id}", response_model=LeaseOut)
def update_lease(
    lease_id: int,
    payload: LeaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lease = _owner_lease(lease_id, current_user, db)
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(lease, k, v)
    db.commit()
    db.refresh(lease)
    return lease


@router.delete("/leases/{lease_id}", status_code=204)
def delete_lease(
    lease_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lease = _owner_lease(lease_id, current_user, db)
    db.delete(lease)
    db.commit()


# ── Payments ──────────────────────────────────────────────────────────────────

@router.post("/leases/{lease_id}/payments", response_model=PaymentOut, status_code=201)
def add_payment(
    lease_id: int,
    payload: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _owner_lease(lease_id, current_user, db)
    payment = Payment(**payload.model_dump(), lease_id=lease_id)
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


@router.get("/leases/{lease_id}/payments", response_model=List[PaymentOut])
def list_payments(
    lease_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _owner_lease(lease_id, current_user, db)
    return db.query(Payment).filter(Payment.lease_id == lease_id).all()


@router.delete("/leases/{lease_id}/payments/{payment_id}", status_code=204)
def delete_payment(
    lease_id: int,
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _owner_lease(lease_id, current_user, db)
    payment = db.query(Payment).filter(
        Payment.id == payment_id,
        Payment.lease_id == lease_id
    ).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    db.delete(payment)
    db.commit()
