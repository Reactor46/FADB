-- Recommended SQL schema (SQL Server-style)
-- Adjust types as needed for Postgres/MySQL/SQLite

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
    ManufacturerId      INT NULL,
    FirearmTypeId       INT NULL,
    Caliber             NVARCHAR(100) NULL,
    ActionType          NVARCHAR(100) NULL,
    ProductionStartYear INT NULL,
    ProductionEndYear   INT NULL,
    IsInProduction      BIT NOT NULL DEFAULT 0,
    CountryOfOrigin     NVARCHAR(100) NULL,
    MarketSegment       NVARCHAR(100) NULL,
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
    RelationType        NVARCHAR(50) NOT NULL,
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

-- Optional: sample firearm types
INSERT INTO FirearmTypes (Name, Description) VALUES
('Pistol', 'Handgun: semi-automatic pistols and related'),
('Revolver', 'Handgun: revolvers'),
('Rifle', 'Long gun: bolt-action, semi-auto, etc.'),
('Shotgun', 'Smoothbore long gun'),
('Submachine Gun', 'Automatic/Select-fire SMG'),
('Assault Rifle', 'Select-fire intermediate cartridge rifle');
