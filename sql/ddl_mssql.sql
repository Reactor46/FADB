-- MSSQL Server DDL for FADB (Microsoft SQL Server / Azure SQL compatible)
-- Run this using sqlcmd or Invoke-Sqlcmd in PowerShell against the target database.

SET NOCOUNT ON;

CREATE TABLE dbo.Manufacturers (
    ManufacturerId      INT IDENTITY(1,1) PRIMARY KEY,
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

CREATE INDEX IX_Manufacturers_Name ON dbo.Manufacturers(Name);
CREATE INDEX IX_Manufacturers_Country ON dbo.Manufacturers(Country);

CREATE TABLE dbo.Brands (
    BrandId             INT IDENTITY(1,1) PRIMARY KEY,
    Name                NVARCHAR(200) NOT NULL,
    ManufacturerId      INT NOT NULL,
    Country             NVARCHAR(100) NULL,
    Notes               NVARCHAR(MAX) NULL,
    SourceRef           NVARCHAR(300) NULL,
    CreatedAt           DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt           DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Brands_Manufacturers FOREIGN KEY (ManufacturerId) REFERENCES dbo.Manufacturers(ManufacturerId)
);

CREATE INDEX IX_Brands_Name ON dbo.Brands(Name);

CREATE TABLE dbo.FirearmTypes (
    FirearmTypeId       INT IDENTITY(1,1) PRIMARY KEY,
    Name                NVARCHAR(100) NOT NULL,
    Description         NVARCHAR(MAX) NULL
);

CREATE UNIQUE INDEX UX_FirearmTypes_Name ON dbo.FirearmTypes(Name);

CREATE TABLE dbo.Firearms (
    FirearmId           INT IDENTITY(1,1) PRIMARY KEY,
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
    CONSTRAINT FK_Firearms_Brands FOREIGN KEY (BrandId) REFERENCES dbo.Brands(BrandId),
    CONSTRAINT FK_Firearms_Manufacturers FOREIGN KEY (ManufacturerId) REFERENCES dbo.Manufacturers(ManufacturerId),
    CONSTRAINT FK_Firearms_FirearmTypes FOREIGN KEY (FirearmTypeId) REFERENCES dbo.FirearmTypes(FirearmTypeId)
);

CREATE INDEX IX_Firearms_ModelName ON dbo.Firearms(ModelName);
CREATE INDEX IX_Firearms_Caliber ON dbo.Firearms(Caliber);

CREATE TABLE dbo.ManufacturerRelations (
    RelationId          INT IDENTITY(1,1) PRIMARY KEY,
    FromManufacturerId  INT NOT NULL,
    ToManufacturerId    INT NOT NULL,
    RelationType        NVARCHAR(50) NOT NULL,
    EffectiveYear       INT NULL,
    Notes               NVARCHAR(MAX) NULL,
    SourceRef           NVARCHAR(300) NULL,
    CreatedAt           DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt           DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ManufacturerRelations_From FOREIGN KEY (FromManufacturerId) REFERENCES dbo.Manufacturers(ManufacturerId),
    CONSTRAINT FK_ManufacturerRelations_To FOREIGN KEY (ToManufacturerId) REFERENCES dbo.Manufacturers(ManufacturerId)
);

CREATE INDEX IX_ManufacturerRelations_From ON dbo.ManufacturerRelations(FromManufacturerId);
CREATE INDEX IX_ManufacturerRelations_To ON dbo.ManufacturerRelations(ToManufacturerId);

-- Optional: a view for active manufacturers
CREATE VIEW dbo.ActiveManufacturers
AS
SELECT ManufacturerId, Name, FullName, Country, FoundedYear, WebsiteUrl, SourceRef, CreatedAt, UpdatedAt
FROM dbo.Manufacturers
WHERE IsActive = 1;

GO
