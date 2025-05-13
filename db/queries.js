const pool = require("./connectionPool");

async function insertUser(username, full_name, email, password_hash) {
   console.log("username:", username);
   console.log("fullName:", full_name);
   console.log("email:", email);
   console.log("password_hash:", password_hash);
   const result = await pool.query(
      `INSERT INTO users (username, full_name, email, password_hash) VALUES ($1, $2, $3, $4)`,
      [username, full_name, email, password_hash]
   );
   if (result.rowCount === 0) throw Error("New User Could not been added");
   console.log("New User's been Added");
}

async function getUserByEmail(email) {
   const query = `
        SELECT * from users WHERE email = $1;
    `;
   const result = await pool.query(query, [email]);
   return result.rows[0]; // returns undefined if not found TODO: handle error
}

async function getUserByUsername(username) {
   const query = `
       SELECT * FROM users WHERE username = $1;
    `;
   const result = await pool.query(query, [username]);
   return result.rows[0]; // returns undefined if not found TODO: handle error
}

async function getById(id) {
   const query = `
       SELECT * FROM users WHERE id = $1;
    `;
   const result = await pool.query(query, [id]);
   return result.rows[0]; // returns undefined if not found TODO: handle error
}

async function updateMembership(userId) {
   await pool.query("UPDATE users SET is_member = true WHERE id = $1", [
      userId,
   ]);
}

async function updateAdmin(userId) {
   await pool.query("UPDATE users SET is_admin=true WHERE id = $1", [userId]);
}

async function insertMessage(title, content, author_id) {
   const result = await pool.query(
      `INSERT INTO messages (title, content, author_id) VALUES ($1, $2, $3)`,
      [title, content, author_id]
   );
   if (result.rowCount === 0) throw Error("New Message Could not been added");
   console.log("New Message's been Added");
}

async function getAllMessagesWithAuthors() {
   const result = await pool.query(`
    SELECT 
      messages.id,
      messages.title,
      messages.content,
      messages.created_at,
      users.full_name AS author_name
    FROM messages
    JOIN users ON messages.author_id = users.id
    ORDER BY messages.created_at DESC
  `);
   return result.rows;
}

async function deleteMessageById(messageId) {
   await pool.query(`DELETE FROM messages WHERE id = $1`, [messageId]);
}

async function searchMessages(searchTerm) {
   const result = await pool.query(`
    SELECT 
      messages.id,
      messages.title,
      messages.content,
      messages.created_at,
      users.full_name AS author_name
    FROM messages
    JOIN users ON messages.author_id = users.id
    WHERE 
      LOWER(users.full_name) LIKE LOWER('%' || $1 || '%')
      OR LOWER(messages.content) LIKE LOWER('%' || $1 || '%')
      OR LOWER(messages.title) LIKE LOWER('%' || $1 || '%')
    ORDER BY messages.created_at DESC
  `, [searchTerm]);

  return result.rows
}

module.exports = {
   insertUser,
   getUserByEmail,
   getUserByUsername,
   getById,
   updateMembership,
   updateAdmin,
   insertMessage,
   getAllMessagesWithAuthors,
   deleteMessageById,
   searchMessages
};
