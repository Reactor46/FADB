-- Small import INSERTs for a lightweight initial dataset
-- Uses lowercase snake_case table/column names.
-- Run this ONLY against ddl_mysql.sql (or an equivalent Postgres schema
-- using the same naming). It is NOT compatible with schema.sql / ddl.sql,
-- which use PascalCase names (Manufacturers, ManufacturerId, ...) — the
-- FastAPI backend's SQLite database uses that PascalCase schema, and is
-- seeded automatically from data/sample_firearms.csv on first run
-- (see server/app/main.py), not from this file.

BEGIN TRANSACTION;

-- Manufacturers
INSERT INTO manufacturers (name, full_name, country, founded_year, defunct_year, is_active, website_url, source_ref)
VALUES
('Beretta','Fabbrica d''Armi Pietro Beretta','Italy',1526,NULL,1,'https://www.beretta.com','https://en.wikipedia.org/wiki/Beretta'),
('Colt','Colt''s Manufacturing Company LLC','United States',1855,NULL,1,'https://www.colt.com','https://en.wikipedia.org/wiki/Colt%27s_Manufacturing_Company'),
('Glock','Glock Ges.m.b.H.','Austria',1963,NULL,1,'https://www.glock.com','https://en.wikipedia.org/wiki/Glock'),
('Heckler & Koch','Heckler & Koch GmbH','Germany',1949,NULL,1,'https://www.heckler-koch.com','https://en.wikipedia.org/wiki/Heckler_%26_Koch'),
('FN Herstal','Fabrique Nationale d''Herstal','Belgium',1889,NULL,1,'https://www.fnherstal.com','https://en.wikipedia.org/wiki/FN_Herstal'),
('Ruger','Sturm, Ruger & Co.','United States',1949,NULL,1,'https://www.ruger.com','https://en.wikipedia.org/wiki/Sturm,_Ruger_%26_Co.'),
('Mauser','Mauser Werke','Germany',1871,NULL,0,NULL,'https://en.wikipedia.org/wiki/Mauser'),
('Kalashnikov Concern','Kalashnikov Concern','Russia',1807,NULL,1,'https://kalashnikov.group','https://en.wikipedia.org/wiki/Kalashnikov_Concern'),
('Winchester','Winchester Repeating Arms Company','United States',1866,2006,0,'https://winchester.com','https://en.wikipedia.org/wiki/Winchester_Repeating_Arms'),
('Smith & Wesson','Smith & Wesson Brands, Inc.','United States',1852,NULL,1,'https://www.smith-wesson.com','https://en.wikipedia.org/wiki/Smith_%26_Wesson');

-- Firearms (note: manufacturer_id assumes insertion order above and SERIAL behavior)
INSERT INTO firearms (model_name, manufacturer_id, caliber, action_type, production_start_year, production_end_year, is_in_production, country_of_origin, market_segment, notes, source_ref)
VALUES
('Beretta 92', 1, '9×19mm Parabellum', 'Semi-automatic', 1975, NULL, 1, 'Italy', 'Civilian/Military', NULL, 'https://en.wikipedia.org/wiki/Beretta_92'),
('Colt M1911', 2, '.45 ACP', 'Semi-automatic', 1911, NULL, 0, 'United States', 'Military/Civilian', NULL, 'https://en.wikipedia.org/wiki/M1911'),
('Glock 17', 3, '9×19mm Parabellum', 'Semi-automatic', 1982, NULL, 1, 'Austria', 'Civilian/LE', NULL, 'https://en.wikipedia.org/wiki/Glock_17'),
('HK MP5', 4, '9×19mm Parabellum', 'Roller-delayed blowback', 1966, NULL, 1, 'Germany', 'Military/LE', NULL, 'https://en.wikipedia.org/wiki/Heckler_%26_Koch_MP5'),
('FN FAL', 5, '7.62×51mm NATO', 'Select-fire', 1953, NULL, 0, 'Belgium', 'Military', NULL, 'https://en.wikipedia.org/wiki/FN_FAL'),
('Ruger 10/22', 6, '.22 LR', 'Semi-automatic', 1964, NULL, 1, 'United States', 'Civilian', NULL, 'https://en.wikipedia.org/wiki/Ruger_10/22'),
('Mauser Gewehr 98', 7, '7.92×57mm Mauser', 'Bolt-action', 1898, 1935, 0, 'Germany', 'Military', NULL, 'https://en.wikipedia.org/wiki/Gewehr_98'),
('AK-47', 8, '7.62×39mm', 'Gas-operated rotating bolt', 1949, NULL, 1, 'Russia', 'Military', NULL, 'https://en.wikipedia.org/wiki/AK-47'),
('Winchester Model 1894', 9, '.30-30 Winchester', 'Lever-action', 1894, NULL, 0, 'United States', 'Civilian', NULL, 'https://en.wikipedia.org/wiki/Winchester_Model_1894'),
('Smith & Wesson Model 29', 10, '.44 Magnum', 'Double-action', 1955, NULL, 1, 'United States', 'Civilian/LE', NULL, 'https://en.wikipedia.org/wiki/Smith_%26_Wesson_Model_29');

COMMIT;
