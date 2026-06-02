from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db.database import get_db
from models.models import Unit, Property, User
from schemas.schemas import UnitCreate, UnitUpdate, UnitOut
from auth import get_current_user

router = APIRouter(prefix="/properties/{property_id}/units", tags=["Units"])


def _get_property(property_id: int, current_user: User, db: Session) -> Property:
    prop = db.query(Property).filter(
        Property.id == property_id,
        Property.owner_id == current_user.id
    ).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop


@router.post("", response_model=UnitOut, status_code=201)
def create_unit(
    property_id: int,
    payload: UnitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _get_property(property_id, current_user, db)
    unit = Unit(**payload.model_dump(), property_id=property_id)
    db.add(unit)
    db.commit()
    db.refresh(unit)
    return unit


@router.get("", response_model=List[UnitOut])
def list_units(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _get_property(property_id, current_user, db)
    return db.query(Unit).filter(Unit.property_id == property_id).all()


@router.get("/{unit_id}", response_model=UnitOut)
def get_unit(
    property_id: int,
    unit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _get_property(property_id, current_user, db)
    unit = db.query(Unit).filter(Unit.id == unit_id, Unit.property_id == property_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    return unit


@router.put("/{unit_id}", response_model=UnitOut)
def update_unit(
    property_id: int,
    unit_id: int,
    payload: UnitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _get_property(property_id, current_user, db)
    unit = db.query(Unit).filter(Unit.id == unit_id, Unit.property_id == property_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(unit, k, v)
    db.commit()
    db.refresh(unit)
    return unit


@router.delete("/{unit_id}", status_code=204)
def delete_unit(
    property_id: int,
    unit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _get_property(property_id, current_user, db)
    unit = db.query(Unit).filter(Unit.id == unit_id, Unit.property_id == property_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    db.delete(unit)
    db.commit()
