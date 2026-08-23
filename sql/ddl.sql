-- Production-ready DDL (SQL Server style)
-- This is the schema you supplied earlier, included verbatim and slightly organized.

CREATE TABLE Manufacturers (
    ManufacturerId      INT IDENTITY PRIMARY KEY,
    Name                NVARCHAR(200) NOT NULL,
    FullName            NVARCHAR(300) NULL,
    Country             NVARCHAR(100) NULL,
    FoundedYear         INT NULL,
    DefunctYear         INT NULL,
    IsActive            BIT NOT NULL DEFAULT 1,
    WebsiteUrl          NVARCHAR(300) NULL,
    Notes               NVARCHAR(MAX) NULL,
    SourceRef           NVARCHAR(300) NULL,
    CreatedAt           DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt           DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE Brands (
    BrandId             INT IDENTITY PRIMARY KEY,
    Name                NVARCHAR(200) NOT NULL,
    ManufacturerId      INT NOT NULL,
    Country             NVARCHAR(100) NULL,
    Notes               NVARCHAR(MAX) NULL,
    SourceRef           NVARCHAR(300) NULL,
    CreatedAt           DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt           DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FKBrandsManufacturers
        FOREIGN KEY (ManufacturerId) REFERENCES Manufacturers(ManufacturerId)
);

CREATE TABLE FirearmTypes (
    FirearmTypeId       INT IDENTITY PRIMARY KEY,
    Name                NVARCHAR(100) NOT NULL,
    Description         NVARCHAR(MAX) NULL
);

CREATE TABLE Firearms (
    FirearmId           INT IDENTITY PRIMARY KEY,
    ModelName           NVARCHAR(200) NOT NULL,
    BrandId             INT NULL,
    ManufacturerId      INT NULL, -- direct link if no brand or multi-brand
    FirearmTypeId       INT NULL,
    Caliber             NVARCHAR(100) NULL,
    ActionType          NVARCHAR(100) NULL, -- e.g. "Bolt-action", "Semi-auto", "Revolver"
    ProductionStartYear INT NULL,
    ProductionEndYear   INT NULL,
    IsInProduction      BIT NOT NULL DEFAULT 0,
    CountryOfOrigin     NVARCHAR(100) NULL,
    MarketSegment       NVARCHAR(100) NULL, -- "Civilian", "Military", "LE", "Mixed"
    Notes               NVARCHAR(MAX) NULL,
    SourceRef           NVARCHAR(300) NULL,
    CreatedAt           DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt           DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FKFirearmsManufacturers
        FOREIGN KEY (ManufacturerId) REFERENCES Manufacturers(ManufacturerId),
    CONSTRAINT FKFirearmsBrands
        FOREIGN KEY (BrandId) REFERENCES Brands(BrandId),
    CONSTRAINT FKFirearmsFirearmTypes
        FOREIGN KEY (FirearmTypeId) REFERENCES FirearmTypes(FirearmTypeId)
);

CREATE TABLE ManufacturerRelations (
    RelationId          INT IDENTITY PRIMARY KEY,
    FromManufacturerId  INT NOT NULL,
    ToManufacturerId    INT NOT NULL,
    RelationType        NVARCHAR(50) NOT NULL, -- "Acquired", "Merged", "Renamed", "Parent", etc.
    EffectiveYear       INT NULL,
    Notes               NVARCHAR(MAX) NULL,
    SourceRef           NVARCHAR(300) NULL,
    CreatedAt           DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt           DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FKManufacturerRelationsFrom
        FOREIGN KEY (FromManufacturerId) REFERENCES Manufacturers(ManufacturerId),
    CONSTRAINT FKManufacturerRelationsTo
        FOREIGN KEY (ToManufacturerId) REFERENCES Manufacturers(ManufacturerId)
);

-- Sample manufacturer seed (example)
INSERT INTO Manufacturers (Name, FullName, Country, FoundedYear, IsActive)
VALUES
('Beretta', 'Fabbrica d''Armi Pietro Beretta', 'Italy', 1526, 1),
('Colt', 'Colt''s Manufacturing Company LLC', 'United States', 1855, 1),
('BSA', 'Birmingham Small Arms Company', 'United Kingdom', 1861, 0),
('FN Herstal', 'Fabrique Nationale d''Herstal', 'Belgium', 1889, 1),
('Heckler & Koch', 'Heckler & Koch GmbH', 'Germany', 1949, 1);
