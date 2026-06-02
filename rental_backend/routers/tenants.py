from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db.database import get_db
from models.models import Tenant, User
from schemas.schemas import TenantCreate, TenantUpdate, TenantOut
from auth import get_current_user

router = APIRouter(prefix="/tenants", tags=["Tenants"])


@router.post("", response_model=TenantOut, status_code=201)
def create_tenant(
    payload: TenantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tenant = Tenant(**payload.model_dump(), owner_id=current_user.id)
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    return tenant


@router.get("", response_model=List[TenantOut])
def list_tenants(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Tenant).filter(Tenant.owner_id == current_user.id).all()


@router.get("/{tenant_id}", response_model=TenantOut)
def get_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tenant = db.query(Tenant).filter(
        Tenant.id == tenant_id,
        Tenant.owner_id == current_user.id
    ).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.put("/{tenant_id}", response_model=TenantOut)
def update_tenant(
    tenant_id: int,
    payload: TenantUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tenant = db.query(Tenant).filter(
        Tenant.id == tenant_id,
        Tenant.owner_id == current_user.id
    ).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(tenant, k, v)
    db.commit()
    db.refresh(tenant)
    return tenant


@router.delete("/{tenant_id}", status_code=204)
def delete_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tenant = db.query(Tenant).filter(
        Tenant.id == tenant_id,
        Tenant.owner_id == current_user.id
    ).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    db.delete(tenant)
    db.commit()
