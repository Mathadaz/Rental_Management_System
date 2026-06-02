from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db.database import get_db
from models.models import Expense, Property, User
from schemas.schemas import ExpenseCreate, ExpenseUpdate, ExpenseOut
from auth import get_current_user

router = APIRouter(prefix="/properties/{property_id}/expenses", tags=["Expenses"])


def _get_property(property_id: int, current_user: User, db: Session) -> Property:
    prop = db.query(Property).filter(
        Property.id == property_id,
        Property.owner_id == current_user.id
    ).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop


@router.post("", response_model=ExpenseOut, status_code=201)
def create_expense(
    property_id: int,
    payload: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _get_property(property_id, current_user, db)
    expense = Expense(**payload.model_dump(), property_id=property_id)
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.get("", response_model=List[ExpenseOut])
def list_expenses(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _get_property(property_id, current_user, db)
    return db.query(Expense).filter(Expense.property_id == property_id).all()


@router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense(
    property_id: int,
    expense_id: int,
    payload: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _get_property(property_id, current_user, db)
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.property_id == property_id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(expense, k, v)
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}", status_code=204)
def delete_expense(
    property_id: int,
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _get_property(property_id, current_user, db)
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.property_id == property_id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
