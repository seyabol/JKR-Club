require("dotenv").config();
const { Client } = require("pg");

const SQL = `
DROP TABLE IF EXISTS messages CASCADE ;
DROP TABLE IF EXISTS users CASCADE ;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_member BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  author_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

-- Sample users (hashed passwords can be replaced later)
INSERT INTO users (username, full_name, email, password_hash, is_member, is_admin)
VALUES
  ('neo01', 'Neo Anderson', 'neo@jkrclub.com', 'fakehash1', true, true),
  ('trinity88', 'Trinity Abl', 'trinity@jkrclub.com', 'fakehash2', true, false),
  ('guestman', 'Guest User', 'guest@jkrclub.com', 'fakehash3', false, false);

-- Sample messages
INSERT INTO messages (title, content, author_id)
VALUES
  ('The Matrix', 'What is real?', 1),
  ('Rebellion Rising', 'We are not alone.', 2),
  ('First Visit', 'This club is mysterious.', 3);
`;

async function main() {
  console.log("seeding...");
  const client = new Client({
    connectionString: process.env.DB_URI,
  });
  await client.connect();
  console.log("connected to pg db");
  await client.query(SQL);
  await client.end();
  console.log("done");
}

main();