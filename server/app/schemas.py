from pydantic import BaseModel
from typing import Optional

class ManufacturerSchema(BaseModel):
    ManufacturerId: int
    Name: str
    FullName: Optional[str]
    Country: Optional[str]
    FoundedYear: Optional[int]
    DefunctYear: Optional[int]
    IsActive: bool
    WebsiteUrl: Optional[str]
    SourceRef: Optional[str]

    class Config:
        orm_mode = True

class FirearmSchema(BaseModel):
    FirearmId: int
    ModelName: str
    ManufacturerId: Optional[int]
    Caliber: Optional[str]
    ActionType: Optional[str]
    ProductionStartYear: Optional[int]
    ProductionEndYear: Optional[int]
    IsInProduction: bool
    CountryOfOrigin: Optional[str]
    MarketSegment: Optional[str]
    SourceRef: Optional[str]

    class Config:
        orm_mode = True
