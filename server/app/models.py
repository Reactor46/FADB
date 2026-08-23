from sqlalchemy import Column, Integer, String, Boolean
from .database import Base

class Manufacturer(Base):
    __tablename__ = 'Manufacturers'
    ManufacturerId = Column(Integer, primary_key=True, index=True)
    Name = Column(String, nullable=False)
    FullName = Column(String)
    Country = Column(String)
    FoundedYear = Column(Integer)
    DefunctYear = Column(Integer)
    IsActive = Column(Boolean, default=True)
    WebsiteUrl = Column(String)
    Notes = Column(String)
    SourceRef = Column(String)

class Firearm(Base):
    __tablename__ = 'Firearms'
    FirearmId = Column(Integer, primary_key=True, index=True)
    ModelName = Column(String, nullable=False)
    ManufacturerId = Column(Integer)
    Caliber = Column(String)
    ActionType = Column(String)
    ProductionStartYear = Column(Integer)
    ProductionEndYear = Column(Integer)
    IsInProduction = Column(Boolean, default=False)
    CountryOfOrigin = Column(String)
    MarketSegment = Column(String)
    Notes = Column(String)
    SourceRef = Column(String)
