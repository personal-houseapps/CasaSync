const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'casasync.db'));

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    emoji TEXT DEFAULT '📋',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    added_by TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    completed_by TEXT,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
  );
`);

// Seed default lists if empty
const listCount = db.prepare('SELECT COUNT(*) as count FROM lists').get();
if (listCount.count === 0) {
  const insert = db.prepare('INSERT INTO lists (name, emoji) VALUES (?, ?)');
  insert.run('Supermarket', '🛒');
  insert.run('House Tasks', '🏠');
  insert.run('Pet Care', '🐢');
}

// Prepared statements
const queries = {
  getLists: db.prepare('SELECT * FROM lists ORDER BY created_at ASC'),
  createList: db.prepare('INSERT INTO lists (name, emoji) VALUES (?, ?)'),
  deleteList: db.prepare('DELETE FROM lists WHERE id = ?'),

  getItems: db.prepare('SELECT * FROM items WHERE list_id = ? ORDER BY completed ASC, created_at DESC'),
  addItem: db.prepare('INSERT INTO items (list_id, text, added_by) VALUES (?, ?, ?)'),
  toggleItem: db.prepare(`
    UPDATE items SET
      completed = CASE WHEN completed = 0 THEN 1 ELSE 0 END,
      completed_by = CASE WHEN completed = 0 THEN ? ELSE NULL END,
      completed_at = CASE WHEN completed = 0 THEN CURRENT_TIMESTAMP ELSE NULL END
    WHERE id = ?
  `),
  deleteItem: db.prepare('DELETE FROM items WHERE id = ?'),
  clearCompleted: db.prepare('DELETE FROM items WHERE list_id = ? AND completed = 1'),
};

module.exports = { db, queries };
