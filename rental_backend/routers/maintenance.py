from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from db.database import get_db
from models.models import MaintenanceRequest, Unit, Property, User, MaintenanceStatus
from schemas.schemas import MaintenanceCreate, MaintenanceUpdate, MaintenanceOut
from auth import get_current_user

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


def _owner_request(request_id: int, current_user: User, db: Session) -> MaintenanceRequest:
    req = (
        db.query(MaintenanceRequest)
        .join(Unit, MaintenanceRequest.unit_id == Unit.id)
        .join(Property, Unit.property_id == Property.id)
        .filter(MaintenanceRequest.id == request_id, Property.owner_id == current_user.id)
        .first()
    )
    if not req:
        raise HTTPException(status_code=404, detail="Maintenance request not found")
    return req


@router.post("", response_model=MaintenanceOut, status_code=201)
def create_request(
    payload: MaintenanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    unit = (
        db.query(Unit)
        .join(Property, Unit.property_id == Property.id)
        .filter(Unit.id == payload.unit_id, Property.owner_id == current_user.id)
        .first()
    )
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    req = MaintenanceRequest(**payload.model_dump())
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@router.get("", response_model=List[MaintenanceOut])
def list_requests(
    status: Optional[MaintenanceStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = (
        db.query(MaintenanceRequest)
        .join(Unit, MaintenanceRequest.unit_id == Unit.id)
        .join(Property, Unit.property_id == Property.id)
        .filter(Property.owner_id == current_user.id)
    )
    if status:
        query = query.filter(MaintenanceRequest.status == status)
    return query.all()


@router.get("/{request_id}", response_model=MaintenanceOut)
def get_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return _owner_request(request_id, current_user, db)


@router.put("/{request_id}", response_model=MaintenanceOut)
def update_request(
    request_id: int,
    payload: MaintenanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = _owner_request(request_id, current_user, db)
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(req, k, v)
    db.commit()
    db.refresh(req)
    return req


@router.delete("/{request_id}", status_code=204)
def delete_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = _owner_request(request_id, current_user, db)
    db.delete(req)
    db.commit()
