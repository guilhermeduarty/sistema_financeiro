CREATE DATABASE IF NOT EXISTS sistema_financeiro
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sistema_financeiro;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_category_per_user (nome, user_id),
  INDEX idx_categories_user (user_id),
  CONSTRAINT fk_categories_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tipo ENUM('receita', 'despesa') NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  categoria_id INT NULL,
  data DATE NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_transactions_user_type (user_id, tipo),
  INDEX idx_transactions_user_date (user_id, data),
  INDEX idx_transactions_category (categoria_id),
  CONSTRAINT fk_transactions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_transactions_category
    FOREIGN KEY (categoria_id) REFERENCES categories(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
  expires INT UNSIGNED NOT NULL,
  data MEDIUMTEXT COLLATE utf8mb4_bin,
  PRIMARY KEY (session_id)
);
