const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const db_Path = path.join(__dirname, 'klliao.db');
const schema_Path = path.join(__dirname, 'schema.sql');

const db = new Database(db_Path);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(schema_Path, 'utf-8');
db.exec(schema);

console.log('Database connected and schema loaded successfully.');

module.exports = db

