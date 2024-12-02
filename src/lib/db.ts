import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db: any = null;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });
  }
  return db;
}

export async function runMigrations() {
  const db = await getDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      bio TEXT
    );

    CREATE TABLE IF NOT EXISTS chatrooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chatroom_id INTEGER,
      user_id INTEGER,
      content TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chatroom_id) REFERENCES chatrooms(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS followers (
      follower_id INTEGER,
      followed_id INTEGER,
      FOREIGN KEY (follower_id) REFERENCES users(id),
      FOREIGN KEY (followed_id) REFERENCES users(id),
      PRIMARY KEY (follower_id, followed_id)
    );

    CREATE TABLE IF NOT EXISTS chatroom_members (
      chatroom_id INTEGER,
      user_id INTEGER,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chatroom_id) REFERENCES chatrooms(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      PRIMARY KEY (chatroom_id, user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_messages_chatroom_id ON messages(chatroom_id);
    CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
    CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
    CREATE INDEX IF NOT EXISTS idx_chatroom_members_user_id ON chatroom_members(user_id);
  `);
}

export async function clearDatabase() {
  const db = await getDb();
  await db.exec(`
    DELETE FROM chatroom_members;
    DELETE FROM followers;
    DELETE FROM messages;
    DELETE FROM chatrooms;
    DELETE FROM users;
    VACUUM;
  `);
}

export async function seedDatabase() {
  const db = await getDb();

  // Insert sample users
  await db.run("INSERT INTO users (username, password, bio) VALUES ('alice', 'password123', 'Hello, I''m Alice!')");
  await db.run("INSERT INTO users (username, password, bio) VALUES ('bob', 'password456', 'Bob here, nice to meet you!')");
  await db.run("INSERT INTO users (username, password, bio) VALUES ('charlie', 'password789', 'Charlie''s the name, chatting''s the game!')");

  // Insert sample chatrooms
  await db.run("INSERT INTO chatrooms (name, description, created_by) VALUES ('General', 'A place for general discussion', 1)");
  await db.run("INSERT INTO chatrooms (name, description, created_by) VALUES ('Tech Talk', 'Discuss the latest in technology', 2)");

  // Insert sample messages
  await db.run("INSERT INTO messages (chatroom_id, user_id, content) VALUES (1, 1, 'Hello everyone!')");
  await db.run("INSERT INTO messages (chatroom_id, user_id, content) VALUES (1, 2, 'Hi Alice, how are you?')");
  await db.run("INSERT INTO messages (chatroom_id, user_id, content) VALUES (2, 3, 'Anyone excited about the new AI developments?')");

  // Insert sample followers
  await db.run("INSERT INTO followers (follower_id, followed_id) VALUES (1, 2)");
  await db.run("INSERT INTO followers (follower_id, followed_id) VALUES (2, 1)");
  await db.run("INSERT INTO followers (follower_id, followed_id) VALUES (3, 1)");

  // Insert sample chatroom members
  await db.run("INSERT INTO chatroom_members (chatroom_id, user_id) VALUES (1, 1)");
  await db.run("INSERT INTO chatroom_members (chatroom_id, user_id) VALUES (1, 2)");
  await db.run("INSERT INTO chatroom_members (chatroom_id, user_id) VALUES (1, 3)");
  await db.run("INSERT INTO chatroom_members (chatroom_id, user_id) VALUES (2, 2)");
  await db.run("INSERT INTO chatroom_members (chatroom_id, user_id) VALUES (2, 3)");
}

