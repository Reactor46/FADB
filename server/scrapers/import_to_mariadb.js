#!/usr/bin/env node
// server/scrapers/import_to_mariadb.js
// Usage: node import_to_mariadb.js --input=./logs/gundb.json --env-file=/path/.env.mariadb

const fs = require('fs');
const mysql = require('mysql2/promise');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i=0;i<args.length;i++) {
    const a = args[i];
    if (a.startsWith('--input=')) out.input = a.split('=')[1];
    else if (a.startsWith('--env-file=')) out.envFile = a.split('=')[1];
  }
  if (!out.input) throw new Error('Missing --input');
  if (!out.envFile) throw new Error('Missing --env-file');
  return out;
}

function loadEnv(envPath) {
  const text = fs.readFileSync(envPath, 'utf8');
  const lines = text.split(/\r?\n/);
  const env = {};
  for (const l of lines) {
    if (!l || l.startsWith('#')) continue;
    const i = l.indexOf('=');
    if (i<0) continue;
    const k = l.slice(0,i).trim();
    const v = l.slice(i+1).trim();
    env[k] = v;
  }
  return env;
}

async function ensureSchema(conn) {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS Manufacturers (
      ManufacturerId INT PRIMARY KEY AUTO_INCREMENT,
      Name VARCHAR(255) NOT NULL,
      FullName TEXT,
      Country VARCHAR(128),
      FoundedYear INT,
      DefunctYear INT,
      IsActive TINYINT NOT NULL DEFAULT 1,
      WebsiteUrl TEXT,
      Notes TEXT,
      SourceRef TEXT,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY ux_manufacturer_name (Name(200))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS Firearms (
      FirearmId INT PRIMARY KEY AUTO_INCREMENT,
      ModelName TEXT NOT NULL,
      ManufacturerId INT,
      Caliber VARCHAR(128),
      ActionType VARCHAR(128),
      CountryOfOrigin VARCHAR(128),
      Notes TEXT,
      SourceRef TEXT,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (ManufacturerId) REFERENCES Manufacturers(ManufacturerId) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function run() {
  const opts = parseArgs();
  const env = loadEnv(opts.envFile);

  const host = env.MARIADB_HOST || env.MARIADB_HOSTNAME || 'mariadb';
  const user = env.MARIADB_USER || 'fadb';
  const pass = env.MARIADB_PASSWORD || env.MARIADB_PASSWORD || env.MARIADB_ROOT_PASSWORD;
  const database = env.MARIADB_DATABASE || 'fadb';
  const port = env.MARIADB_PORT || 3306;

  const content = fs.readFileSync(opts.input, 'utf8');
  const items = JSON.parse(content);

  const conn = await mysql.createConnection({
    host,
    user,
    password: pass,
    database,
    port,
    multipleStatements: false,
  });

  console.log('Connected to MariaDB at', host);

  await ensureSchema(conn);

  const findManufacturer = 'SELECT ManufacturerId FROM Manufacturers WHERE Name = ? LIMIT 1';
  const insertManufacturer = 'INSERT INTO Manufacturers (Name, WebsiteUrl, Notes, SourceRef) VALUES (?,?,?,?)';
  const insertFirearm = 'INSERT INTO Firearms (ModelName, ManufacturerId, Caliber, ActionType, CountryOfOrigin, Notes, SourceRef) VALUES (?,?,?,?,?,?,?)';

  for (const it of items) {
    const name = it.manufacturer ? it.manufacturer.trim() : null;
    let manId = null;
    if (name) {
      const [rows] = await conn.execute(findManufacturer, [name]);
      if (rows.length) manId = rows[0].ManufacturerId;
      else {
        const [res] = await conn.execute(insertManufacturer, [name, null, it.summary || null, it.url || null]);
        manId = res.insertId;
        console.log('Inserted manufacturer:', name, 'id=', manId);
      }
    }

    const title = it.title || 'Unknown';
    await conn.execute(insertFirearm, [title, manId, it.caliber || null, it.action || null, it.country || null, it.summary || null, it.url || null]);
    console.log('Inserted firearm:', title);
  }

  await conn.end();
  console.log('Import finished.');
}

run().catch(err => {
  console.error('Fatal importer error:', err);
  process.exit(1);
});
