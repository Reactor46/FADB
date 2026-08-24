import csv
import os
from sqlalchemy.orm import Session
from . import models
from typing import List, Optional


def seed_from_csv_if_empty(db: Session, csv_path: str) -> int:
    """Populate Manufacturers/Firearms from the sample CSV on first run.

    No-ops if Manufacturers already has rows (so re-runs / restarts don't
    duplicate data), or if the CSV file isn't present.  Returns the number
    of firearm rows inserted.
    """
    if db.query(models.Manufacturer).first() is not None:
        return 0
    if not os.path.isfile(csv_path):
        return 0

    manufacturer_ids = {}  # name -> ManufacturerId
    inserted = 0

    with open(csv_path, newline='', encoding='utf-8') as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            manu_name = (row.get('ManufacturerName') or '').strip()
            if not manu_name:
                continue

            if manu_name not in manufacturer_ids:
                manu = models.Manufacturer(
                    Name=manu_name,
                    Country=row.get('CountryOfOrigin') or None,
                )
                db.add(manu)
                db.flush()  # populate manu.ManufacturerId without committing
                manufacturer_ids[manu_name] = manu.ManufacturerId

            def to_int(x):
                try:
                    return int(x) if x not in (None, '') else None
                except ValueError:
                    return None

            def to_bool(x):
                return str(x).strip() in ('1', 'true', 'True')

            firearm = models.Firearm(
                ModelName=row.get('ModelName') or '',
                ManufacturerId=manufacturer_ids[manu_name],
                Caliber=row.get('Caliber') or None,
                ActionType=row.get('ActionType') or None,
                ProductionStartYear=to_int(row.get('ProductionStartYear')),
                ProductionEndYear=to_int(row.get('ProductionEndYear')),
                IsInProduction=to_bool(row.get('IsInProduction')),
                CountryOfOrigin=row.get('CountryOfOrigin') or None,
                MarketSegment=row.get('MarketSegment') or None,
                SourceRef=row.get('SourceRef') or None,
            )
            db.add(firearm)
            inserted += 1

    db.commit()
    return inserted

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
