const { pool } = require("../config/db");

class Category {
  static async create({ nome, userId }) {
    const [result] = await pool.execute(
      "INSERT INTO categories (nome, user_id) VALUES (?, ?)",
      [nome, userId]
    );

    return result.insertId;
  }

  static async findAllByUser(userId) {
    const [rows] = await pool.execute(
      "SELECT * FROM categories WHERE user_id = ? ORDER BY nome ASC",
      [userId]
    );

    return rows;
  }

  static async findById(id, userId) {
    const [rows] = await pool.execute(
      "SELECT * FROM categories WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    return rows[0] || null;
  }

  static async update(id, userId, nome) {
    await pool.execute(
      "UPDATE categories SET nome = ? WHERE id = ? AND user_id = ?",
      [nome, id, userId]
    );
  }

  static async delete(id, userId) {
    await pool.execute(
      "DELETE FROM categories WHERE id = ? AND user_id = ?",
      [id, userId]
    );
  }
}

module.exports = Category;
