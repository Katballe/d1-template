-- Migration number: 0003    2026-04-26
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY NOT NULL,
    author TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
