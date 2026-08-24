const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'fadb_user.sqlite');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Initialize schema if not exists (based on sql/ddl_sqlite.sql but with user fields)
const ddl = `PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Manufacturers (
    ManufacturerId INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    FullName TEXT,
    Country TEXT,
    FoundedYear INT,
    DefunctYear INT,
    IsActive INT NOT NULL DEFAULT 1,
    WebsiteUrl TEXT,
    Notes TEXT,
    SourceRef TEXT,
    CreatedAt TEXT DEFAULT (datetime('now')),
    UpdatedAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS Brands (
    BrandId INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    ManufacturerId INTEGER NOT NULL REFERENCES Manufacturers(ManufacturerId),
    Country TEXT,
    Notes TEXT,
    SourceRef TEXT,
    CreatedAt TEXT DEFAULT (datetime('now')),
    UpdatedAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS FirearmTypes (
    FirearmTypeId INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Description TEXT
);

CREATE TABLE IF NOT EXISTS Firearms (
    FirearmId INTEGER PRIMARY KEY AUTOINCREMENT,
    ModelName TEXT NOT NULL,
    BrandId INTEGER REFERENCES Brands(BrandId),
    ManufacturerId INTEGER REFERENCES Manufacturers(ManufacturerId),
    FirearmTypeId INTEGER REFERENCES FirearmTypes(FirearmTypeId),
    Caliber TEXT,
    ActionType TEXT,
    ProductionStartYear INT,
    ProductionEndYear INT,
    IsInProduction INT NOT NULL DEFAULT 0,
    CountryOfOrigin TEXT,
    MarketSegment TEXT,
    Notes TEXT,
    SourceRef TEXT,
    SerialNumber TEXT,
    PhotoFileName TEXT,
    PhotoUploadedAt TEXT,
    ThumbnailFileName TEXT,
    Extra TEXT, -- JSON for flexible extra fields added via backend admin
    CreatedAt TEXT DEFAULT (datetime('now')),
    UpdatedAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ManufacturerRelations (
    RelationId INTEGER PRIMARY KEY AUTOINCREMENT,
    FromManufacturerId INTEGER NOT NULL REFERENCES Manufacturers(ManufacturerId),
    ToManufacturerId INTEGER NOT NULL REFERENCES Manufacturers(ManufacturerId),
    RelationType TEXT NOT NULL,
    EffectiveYear INT,
    Notes TEXT,
    SourceRef TEXT,
    CreatedAt TEXT DEFAULT (datetime('now')),
    UpdatedAt TEXT DEFAULT (datetime('now'))
);
`;

db.exec(ddl);

module.exports = db;
