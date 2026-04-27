const { pool } = require("../config/db");

class User {
  static async create({ nome, email, senha }) {
    const [result] = await pool.execute(
      "INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)",
      [nome, email, senha]
    );

    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await pool.execute("SELECT id, nome, email FROM users WHERE id = ?", [id]);
    return rows[0] || null;
  }
}

module.exports = User;
