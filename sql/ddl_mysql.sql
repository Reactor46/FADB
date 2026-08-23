-- MySQL-compatible DDL for FADB

CREATE DATABASE IF NOT EXISTS FADB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
USE FADB;

CREATE TABLE manufacturers (
    manufacturer_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(512),
    country VARCHAR(255),
    founded_year INT,
    defunct_year INT,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    website_url VARCHAR(512),
    notes TEXT,
    source_ref VARCHAR(512),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE brands (
    brand_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    manufacturer_id INT NOT NULL,
    country VARCHAR(255),
    notes TEXT,
    source_ref VARCHAR(512),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(manufacturer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE firearm_types (
    firearm_type_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE firearms (
    firearm_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    model_name VARCHAR(512) NOT NULL,
    brand_id INT,
    manufacturer_id INT,
    firearm_type_id INT,
    caliber VARCHAR(255),
    action_type VARCHAR(255),
    production_start_year INT,
    production_end_year INT,
    is_in_production TINYINT(1) NOT NULL DEFAULT 0,
    country_of_origin VARCHAR(255),
    market_segment VARCHAR(255),
    notes TEXT,
    source_ref VARCHAR(512),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(brand_id),
    FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(manufacturer_id),
    FOREIGN KEY (firearm_type_id) REFERENCES firearm_types(firearm_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE manufacturer_relations (
    relation_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    from_manufacturer_id INT NOT NULL,
    to_manufacturer_id INT NOT NULL,
    relation_type VARCHAR(100) NOT NULL,
    effective_year INT,
    notes TEXT,
    source_ref VARCHAR(512),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (from_manufacturer_id) REFERENCES manufacturers(manufacturer_id),
    FOREIGN KEY (to_manufacturer_id) REFERENCES manufacturers(manufacturer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
