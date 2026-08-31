const Database = require('better-sqlite3');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

const DB_TYPE = (process.env.DB_TYPE || 'sqlite').toLowerCase();

let sqliteDb = null;
let mysqlPool = null;

if (DB_TYPE === 'sqlite') {
  const DB_PATH = path.join(__dirname, '..', 'data', 'fadb_user.sqlite');
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  sqliteDb = new Database(DB_PATH);
}

if (DB_TYPE === 'mariadb') {
  // Create a mysql2 pool synchronously
  const DB_HOST = process.env.DB_HOST || process.env.MARIADB_HOST || 'mariadb';
  const DB_PORT = parseInt(process.env.DB_PORT || process.env.MARIADB_PORT || '3306', 10);
  const DB_USER = process.env.DB_USER || process.env.MARIADB_USER || 'fadb';
  const DB_PASS = process.env.DB_PASS || process.env.MARIADB_PASSWORD || process.env.MARIADB_ROOT_PASSWORD || '';
  const DB_NAME = process.env.DB_NAME || process.env.MARIADB_DATABASE || 'fadb';

  mysqlPool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

function makeSqlitePrepare(sql) {
  return {
    run: async function(...params) {
      const stmt = sqliteDb.prepare(sql);
      const info = stmt.run(...params);
      return { lastInsertRowid: info.lastInsertRowid, changes: info.changes };
    },
    get: async function(...params) {
      const stmt = sqliteDb.prepare(sql);
      const row = stmt.get(...params);
      return row;
    },
    all: async function(...params) {
      const stmt = sqliteDb.prepare(sql);
      const rows = stmt.all(...params);
      return rows;
    }
  };
}

function makeMysqlPrepare(sql) {
  return {
    run: async function(...params) {
      // mysql2 uses ? placeholders
      const [result] = await mysqlPool.execute(sql, params);
      // result.insertId exists for inserts
      return { lastInsertRowid: result.insertId || null, changes: result.affectedRows };
    },
    get: async function(...params) {
      const [rows] = await mysqlPool.execute(sql, params);
      return rows[0] || null;
    },
    all: async function(...params) {
      const [rows] = await mysqlPool.execute(sql, params);
      return rows;
    }
  };
}

module.exports = {
  prepare: function(sql) {
    if (DB_TYPE === 'sqlite') return makeSqlitePrepare(sql);
    if (DB_TYPE === 'mariadb') return makeMysqlPrepare(sql);
    throw new Error('Unsupported DB_TYPE: ' + DB_TYPE);
  },
  exec: async function(sql) {
    if (DB_TYPE === 'sqlite') {
      sqliteDb.exec(sql);
      return;
    }
    if (DB_TYPE === 'mariadb') {
      // naive splitting by ; for simple DDL scripts
      const statements = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
      for (const stmt of statements) {
        await mysqlPool.execute(stmt);
      }
      return;
    }
  },
  // expose underlying handles for advanced usage
  _sqliteDb: sqliteDb,
  _mysqlPool: mysqlPool,
  _dbType: DB_TYPE
};
