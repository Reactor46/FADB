const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const morgan = require('morgan');
const db = require('./db');

const UPLOAD_DIR = path.join(__dirname, '..', 'data', 'images');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));
app.use('/images', express.static(UPLOAD_DIR));

// Serve static React build if present
const PUBLIC_DIR = path.join(__dirname, 'public');
if (fs.existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR));
  // Fallback to index.html for client-side routing, but avoid intercepting API or image routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/images')) return next();
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
  });
}

// List manufacturers
app.get('/api/manufacturers', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM Manufacturers ORDER BY Name').all();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Create manufacturer
app.post('/api/manufacturers', (req, res) => {
  try {
    const { Name, FullName, Country, FoundedYear } = req.body;
    const stmt = db.prepare(`INSERT INTO Manufacturers (Name, FullName, Country, FoundedYear, IsActive, CreatedAt, UpdatedAt)
      VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))`);
    const info = stmt.run(Name, FullName || null, Country || null, FoundedYear || null);
    const row = db.prepare('SELECT * FROM Manufacturers WHERE ManufacturerId = ?').get(info.lastInsertRowid);
    res.status(201).json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create manufacturer' });
  }
});

// Create firearm with optional image upload
app.post('/api/firearms', upload.single('photo'), async (req, res) => {
  try {
    const body = req.body;
    const file = req.file;
    let photoFileName = null;
    let thumbnailFileName = null;
    let photoUploadedAt = null;

    if (file) {
      photoFileName = file.filename;
      photoUploadedAt = new Date().toISOString();
      // create thumbnail
      const thumbName = `thumb-${photoFileName}`;
      const thumbPath = path.join(UPLOAD_DIR, thumbName);
      await sharp(path.join(UPLOAD_DIR, photoFileName)).resize({ width: 800, height: 800, fit: 'inside' }).jpeg({ quality: 80 }).toFile(thumbPath);
      thumbnailFileName = thumbName;
    }

    const insert = db.prepare(`INSERT INTO Firearms (
      ModelName, BrandId, ManufacturerId, FirearmTypeId, Caliber, ActionType, ProductionStartYear,
      ProductionEndYear, IsInProduction, CountryOfOrigin, MarketSegment, Notes, SourceRef,
      SerialNumber, PhotoFileName, PhotoUploadedAt, ThumbnailFileName, Extra, CreatedAt, UpdatedAt
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'),datetime('now'))`);

    const info = insert.run(
      body.ModelName || body.modelName,
      body.BrandId || body.brandId || null,
      body.ManufacturerId || body.manufacturerId || null,
      body.FirearmTypeId || body.firearmTypeId || null,
      body.Caliber || null,
      body.ActionType || null,
      body.ProductionStartYear ? parseInt(body.ProductionStartYear) : null,
      body.ProductionEndYear ? parseInt(body.ProductionEndYear) : null,
      body.IsInProduction === '1' || body.IsInProduction === 'true' ? 1 : 0,
      body.CountryOfOrigin || null,
      body.MarketSegment || null,
      body.Notes || null,
      body.SourceRef || null,
      body.SerialNumber || null,
      photoFileName,
      photoUploadedAt,
      thumbnailFileName,
      body.Extra || null
    );

    const firearm = db.prepare('SELECT * FROM Firearms WHERE FirearmId = ?').get(info.lastInsertRowid);
    res.status(201).json(firearm);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create firearm' });
  }
});

// List firearms
app.get('/api/firearms', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM Firearms ORDER BY CreatedAt DESC').all();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`FADB server listening on ${PORT}`));
