# Sistema Financeiro Pessoal

Aplicacao web completa para organizacao financeira pessoal com arquitetura MVC, usando Node.js, Express, EJS e MySQL. O projeto agora possui duas formas de execucao:

- ambiente local com XAMPP
- ambiente de publicacao com Docker, MySQL e Nginx

## Stack

- Backend: Node.js + Express
- Frontend: EJS + Bootstrap
- Banco: MySQL
- Sessao: `express-session` com persistencia no MySQL
- Seguranca: `helmet`, `csurf`, `express-rate-limit`, `hpp`, cookies seguros
- Deploy: Docker + Docker Compose + Nginx

## Estrutura

```text
/config
/controllers
/middlewares
/models
/nginx
/public
  /css
  /js
  /img
/routes
/sql
/views
  /auth
  /categories
  /dashboard
  /partials
  /transactions
Dockerfile
docker-compose.yml
```

## Funcionalidades

- Cadastro e login de usuario
- Senhas com `bcrypt`
- Sessao persistida no MySQL
- Middleware para proteger rotas autenticadas
- Dashboard com saldo atual, receitas, despesas e grafico
- CRUD de receitas
- CRUD de despesas
- CRUD de categorias
- Historico de transacoes com filtro por data
- Flash messages para feedback
- Validacao de formularios

## Camadas de seguranca adicionadas

- Senhas criptografadas com `bcrypt`
- Sessao armazenada no MySQL em vez de `MemoryStore`
- Cookies `httpOnly`, `sameSite` e `secure` em producao
- Protecao CSRF em formularios sensiveis
- `rate limit` global e especifico para login/cadastro
- `helmet` com `Content-Security-Policy`
- Bloqueio de `x-powered-by`
- Protecao contra HTTP Parameter Pollution com `hpp`
- Limite de tamanho de payload no body
- Headers de seguranca no Express e no Nginx
- Redirect opcional para HTTPS por `FORCE_HTTPS=true`
- Proxy reverso com Nginx para expor a aplicacao na web
- Endpoint de saude em `/healthz`
- Indices no MySQL para melhorar consulta e reduzir carga

## Banco de dados

O arquivo [sql/schema.sql](./sql/schema.sql) cria:

- banco `sistema_financeiro`
- tabela `users`
- tabela `categories`
- tabela `transactions`
- tabela `sessions`

Relacionamentos:

- um usuario possui varias categorias
- um usuario possui varias transacoes
- exclusao em cascata do usuario para categorias e transacoes
- categoria removida vira `NULL` nas transacoes vinculadas

## Rodando localmente com XAMPP

1. Inicie `Apache` e `MySQL` no XAMPP.
2. Abra o `phpMyAdmin`.
3. Execute [sql/schema.sql](./sql/schema.sql).
4. Copie `.env.example` para `.env`.
5. Ajuste as credenciais do banco.
6. Instale as dependencias:

```bash
npm install
```

7. Rode a aplicacao:

```bash
npm run dev
```

8. Acesse:

```text
http://localhost:3000
```

## Rodando com Docker

1. Copie `.env.production.example` para `.env.production`.
2. Troque todas as senhas e segredos por valores fortes.
3. Suba os containers:

```bash
docker compose up --build -d
```

4. Acesse:

```text
http://localhost
```

Servicos criados:

- `app`: aplicacao Node.js
- `db`: MySQL 8
- `nginx`: proxy reverso publico

## Publicando na web

Fluxo recomendado:

1. Contrate uma VPS ou use um servidor cloud.
2. Aponte seu dominio para o IP do servidor.
3. Instale Docker e Docker Compose.
4. Copie o projeto para o servidor.
5. Configure `.env.production`.
6. Suba com `docker compose up --build -d`.
7. Coloque SSL/TLS no Nginx ou em um proxy externo como Cloudflare, Traefik ou Nginx Proxy Manager.
8. Se o trafego HTTPS terminar antes do Node, deixe `TRUST_PROXY=1`.
9. Se o proxy entregar HTTPS para o usuario final, ative `FORCE_HTTPS=true`.

## Exemplo de ambiente local

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=sistema_financeiro
SESSION_SECRET=troque_esta_chave_por_uma_chave_segura
SESSION_NAME=financeflow.sid
SESSION_MAX_AGE=28800000
TRUST_PROXY=0
FORCE_HTTPS=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
AUTH_RATE_LIMIT_MAX=10
APP_URL=http://localhost:3000
```

## Exemplo de ambiente de producao

```env
PORT=3000
NODE_ENV=production
DB_HOST=db
DB_PORT=3306
DB_NAME=sistema_financeiro
DB_USER=financeflow
DB_PASSWORD=troque_por_uma_senha_forte
DB_ROOT_PASSWORD=troque_por_uma_senha_root_forte
SESSION_SECRET=troque_por_um_segredo_grande_e_aleatorio
SESSION_NAME=financeflow.sid
SESSION_MAX_AGE=28800000
TRUST_PROXY=1
FORCE_HTTPS=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=150
AUTH_RATE_LIMIT_MAX=5
APP_URL=http://localhost
```

## Observacoes importantes de producao

- Para SSL automatico, vale integrar Certbot, Traefik ou Nginx Proxy Manager.
- Nao existe seguranca absoluta; as protecoes implementadas aqui sao uma base forte para publicacao.
- Em producao, use senhas longas, segredos aleatorios e backups do banco.
- Tambem e recomendado configurar firewall, monitoramento e rotacao de logs no servidor.
