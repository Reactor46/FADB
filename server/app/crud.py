from sqlalchemy.orm import Session
from . import models
from typing import List, Optional

def get_manufacturers(db: Session, q: Optional[str]=None) -> List[models.Manufacturer]:
    query = db.query(models.Manufacturer)
    if q:
        query = query.filter(models.Manufacturer.Name.ilike(f"%{q}%"))
    return query.order_by(models.Manufacturer.ManufacturerId).all()

def get_firearms(db: Session, q: Optional[str]=None, manufacturer: Optional[str]=None):
    query = db.query(models.Firearm)
    if q:
        query = query.filter(models.Firearm.ModelName.ilike(f"%{q}%"))
    if manufacturer:
        # try to filter by ManufacturerId by name lookup
        manu = db.query(models.Manufacturer).filter(models.Manufacturer.Name.ilike(f"%{manufacturer}%")).first()
        if manu:
            query = query.filter(models.Firearm.ManufacturerId == manu.ManufacturerId)
    return query.order_by(models.Firearm.FirearmId).all()
