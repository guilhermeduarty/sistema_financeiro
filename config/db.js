const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "sistema_financeiro",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testConnection() {
  const connection = await pool.getConnection();
  connection.release();
  console.log("Conexao com MySQL estabelecida com sucesso.");
}

module.exports = {
  pool,
  testConnection
};
