const { pool } = require("../config/db");

class Transaction {
  static async create({ userId, tipo, valor, categoriaId, data, descricao }) {
    const [result] = await pool.execute(
      `INSERT INTO transactions (user_id, tipo, valor, categoria_id, data, descricao)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, tipo, valor, categoriaId || null, data, descricao]
    );

    return result.insertId;
  }

  static async update(id, userId, { tipo, valor, categoriaId, data, descricao }) {
    await pool.execute(
      `UPDATE transactions
       SET tipo = ?, valor = ?, categoria_id = ?, data = ?, descricao = ?
       WHERE id = ? AND user_id = ?`,
      [tipo, valor, categoriaId || null, data, descricao, id, userId]
    );
  }

  static async delete(id, userId) {
    await pool.execute("DELETE FROM transactions WHERE id = ? AND user_id = ?", [id, userId]);
  }

  static async findById(id, userId) {
    const [rows] = await pool.execute(
      `SELECT t.*, c.nome AS categoria_nome
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.categoria_id
       WHERE t.id = ? AND t.user_id = ?`,
      [id, userId]
    );

    return rows[0] || null;
  }

  static async findAllByUser(userId, filters = {}) {
    let query = `
      SELECT t.*, c.nome AS categoria_nome
      FROM transactions t
      LEFT JOIN categories c ON c.id = t.categoria_id
      WHERE t.user_id = ?
    `;
    const params = [userId];

    if (filters.tipo) {
      query += " AND t.tipo = ?";
      params.push(filters.tipo);
    }

    if (filters.dataInicial) {
      query += " AND t.data >= ?";
      params.push(filters.dataInicial);
    }

    if (filters.dataFinal) {
      query += " AND t.data <= ?";
      params.push(filters.dataFinal);
    }

    query += " ORDER BY t.data DESC, t.id DESC";

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async getSummaryByUser(userId) {
    const [rows] = await pool.execute(
      `SELECT
          COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor END), 0) AS totalReceitas,
          COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor END), 0) AS totalDespesas
       FROM transactions
       WHERE user_id = ?`,
      [userId]
    );

    const summary = rows[0];
    return {
      totalReceitas: Number(summary.totalReceitas || 0),
      totalDespesas: Number(summary.totalDespesas || 0),
      saldoAtual: Number(summary.totalReceitas || 0) - Number(summary.totalDespesas || 0)
    };
  }

  static async getChartDataByUser(userId) {
    const [rows] = await pool.execute(
      `SELECT DATE_FORMAT(data, '%Y-%m') AS mes,
              COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor END), 0) AS receitas,
              COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor END), 0) AS despesas
       FROM transactions
       WHERE user_id = ?
       GROUP BY DATE_FORMAT(data, '%Y-%m')
       ORDER BY mes ASC`,
      [userId]
    );

    return rows.map((item) => ({
      mes: item.mes,
      receitas: Number(item.receitas || 0),
      despesas: Number(item.despesas || 0)
    }));
  }
}

module.exports = Transaction;
