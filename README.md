
# Backend - Certificadora de Competência Específica (CCE-AS66A)

Este é o repositório do backend desenvolvido para o projeto de gerenciamento de campeonatos de Valorant, como parte da disciplina **CCE-AS66A - N16** do curso de Análise e Desenvolvimento de Sistemas da UTFPR.

## 🔧 Tecnologias utilizadas

- **Node.js** com **Express**
- **Sequelize** (ORM)
- **PostgreSQL**
- **Docker & Docker Compose**
- **JWT** (autenticação)
- **Swagger** (documentação da API)
- **Zod** (validação de schemas)

## 🏗️ Estrutura do projeto

```
src/
├── controllers/        # Lógica dos endpoints
├── models/             # Definições das entidades Sequelize
├── routes/             # Definições das rotas Express
├── middlewares/        # Middlewares de autenticação e validação
├── schemas/            # Schemas Zod para validações
├── db/                 # Configuração do banco
├── seed/               # Script de seed para povoar o banco
├── swagger/            # Configuração e documentação Swagger
├── utils/              # Utilitários diversos
├── app.js              # App Express
└── server.js           # Ponto de entrada
```

## ⚙️ Como rodar o projeto

### Pré-requisitos

- Node.js
- Docker e Docker Compose

### 1. Clone o projeto

```bash
git clone https://github.com/Matari73/Backend-CCE-AS66A
cd Backend-CCE-AS66A
```

### 2. Crie um arquivo `.env`

```env
# Banco de Dados
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
POSTGRES_DB=valorantdb
DB_HOST=postgres
DB_PORT=5432

# API
PORT=3001
JWT_SECRET=segretojwt123
```

### 3. Suba os containers

```bash
docker compose up --build
```

### 4. Execute o seed

O projeto executa o `seed` automaticamente ao subir o container, criando:

- 3 usuários admins
- 25 agentes (Valorant)
- 16 equipes (5 jogadores + 1 coach cada)
- 2 campeonatos (8 e 16 times)

### 5. Inicie a aplicação (caso rode localmente sem container)

```bash
npm install
npm run dev
```

---

## 🔐 Autenticação

- JWT Token necessário para operações protegidas.
- Para autenticar, utilize a rota: `POST /auth/login`.

---

## 📚 Documentação da API (Swagger)

Acesse em:

```
http://localhost:3001/docs
```

Utilize o Swagger para explorar as rotas disponíveis, schemas e exemplos de requisição/resposta.

---

## 📌 Funcionalidades principais

- Autenticação e autorização com JWT
- CRUD de:
  - Usuários
  - Times
  - Participantes (Jogadores/Coachs)
  - Campeonatos
  - Partidas
  - Estatísticas (Jogador, Time, Campeonato)
- Inscrição de times em campeonatos
- Controle de ownership por usuário
- Geração de estatísticas agregadas (overview)
- Swagger para documentação
- Seed completo com dados coerentes

---

## 👥 Contribuidores

- Giovana Hoffmann
- Ítalo Ventura
- Mariana Oliveira 

---

## 📄 Licença

Este projeto é apenas para fins acadêmicos e não possui licença comercial.
