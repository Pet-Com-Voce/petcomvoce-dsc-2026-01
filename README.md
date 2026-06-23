# 🐾 Pet Com Você

> Plataforma integrada de gestão para **pet shops** e **clínicas veterinárias** — agendamentos, prontuários médicos, vacinação e controle de acesso em um único lugar.

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Variáveis de Ambiente](#️-variáveis-de-ambiente)
- [Como Rodar](#-como-rodar)
  - [Com Docker (recomendado)](#-com-docker-recomendado)
  - [Backend (manual)](#-backend-manual)
  - [Frontend (manual)](#-frontend-manual)
- [Testes](#-testes)
- [URLs Úteis](#-urls-úteis)

---

## 🧭 Visão Geral

O **Pet Com Você** é uma API REST construída com **NestJS** e um frontend **React + Vite**, cobrindo três módulos principais:

| Módulo | Descrição |
|---|---|
| 🔑 **Identidade & Acesso** | Cadastro de tutores, pets e funcionários |
| 📅 **Agendamentos** | Criação, consulta, check-in e cancelamento de atendimentos |
| 🏥 **Clínico** | Prontuários médicos e registro de vacinas |

Todos os endpoints da API retornam respostas padronizadas no formato `{ data, meta }`.

---

## 🛠 Tecnologias

### Backend
- **Runtime:** Node.js 20
- **Framework:** NestJS 11
- **Banco de dados:** PostgreSQL 16 + TypeORM
- **Documentação:** Swagger / OpenAPI (`/api/docs`)
- **Segurança:** Helmet, throttling, validação com `class-validator`
- **Linguagem:** TypeScript

### Frontend
- **Framework:** React 18
- **Build tool:** Vite 4
- **Linguagem:** TypeScript

### Infraestrutura
- **Containers:** Docker + Docker Compose
- **Testes:** Jest (unitários e e2e com Supertest)

---

## 📁 Estrutura do Projeto

```
petcomvoce-dsc-2026-01/
├── src/                        # Código-fonte do backend (NestJS)
│   ├── main.ts                 # Entrypoint da aplicação
│   ├── app.module.ts           # Módulo raiz
│   ├── common/                 # Filtros, interceptors e utilitários globais
│   └── modules/
│       ├── identity-access/    # Tutores, pets e funcionários
│       ├── scheduling/         # Agendamentos
│       └── clinical/           # Prontuários e vacinas
├── frontend/                   # Código-fonte do frontend (React + Vite)
│   └── src/
│       ├── pages/              # Páginas da aplicação
│       ├── components/         # Componentes reutilizáveis
│       ├── api.ts              # Camada de comunicação com a API
│       └── types.ts            # Tipagens compartilhadas
├── test/                       # Testes e2e
├── Dockerfile                  # Build multi-stage do backend
├── docker-compose.yml          # Orquestração de serviços (DB + App)
└── .env.example                # Exemplo de variáveis de ambiente
```

---

## ✅ Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Node.js | 20+ |
| npm | 9+ |
| Docker | 24+ |
| Docker Compose | v2+ |

---

## ⚙️ Variáveis de Ambiente

### Backend

Copie o arquivo de exemplo e ajuste os valores:

```bash
cp .env.example .env
```

| Variável | Padrão | Descrição |
|---|---|---|
| `DB_HOST` | `localhost` | Host do banco de dados |
| `DB_PORT` | `5432` | Porta do PostgreSQL |
| `DB_USERNAME` | `petcomvoce_user` | Usuário do banco |
| `DB_PASSWORD` | `petcomvoce_password` | Senha do banco |
| `DB_DATABASE` | `petcomvoce_db` | Nome do banco |
| `NODE_ENV` | `development` | Ambiente da aplicação |
| `PORT` | `3000` | Porta em que a API sobe |
| `CORS_ORIGIN` | `http://localhost:5173` | Origens permitidas (separadas por vírgula) |

### Frontend

O frontend utiliza um proxy do Vite em desenvolvimento — nenhuma configuração extra é necessária. Para produção, crie `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

---

## 🚀 Como Rodar

### 🐳 Com Docker (recomendado)

Sobe o banco de dados **e** a API backend juntos com um único comando:

```bash
# 1. Configure as variáveis de ambiente
cp .env.example .env

# 2. Suba os serviços
docker compose up --build -d

# 3. Acompanhe os logs (opcional)
docker compose logs -f
```

> A API ficará disponível em `http://localhost:3000` assim que o health check do banco passar.

Para parar os serviços:

```bash
docker compose down
```

Para parar **e remover os volumes** (apaga os dados do banco):

```bash
docker compose down -v
```

---

### 🖥 Backend (manual)

> Requer PostgreSQL rodando localmente ou via Docker.

**1. Subir apenas o banco via Docker:**

```bash
docker compose up db -d
```

**2. Instalar dependências:**

```bash
npm install
```

**3. Configurar variáveis de ambiente:**

```bash
cp .env.example .env
# Edite o .env com suas configurações
```

**4. Rodar em modo desenvolvimento (com hot-reload):**

```bash
npm run start:dev
```

**5. Ou compilar e rodar em produção:**

```bash
npm run build
npm run start
```

---

### 🌐 Frontend (manual)

> Certifique-se de que o backend está rodando em `http://localhost:3000`.

```bash
# 1. Entre na pasta do frontend
cd frontend

# 2. Instale as dependências
npm install

# 3. Rode em modo desenvolvimento
npm run dev
```

O frontend ficará disponível em **`http://localhost:5173`**.

Em desenvolvimento, o Vite faz proxy automático das rotas `/api` e `/health` para `http://localhost:3000`, então nenhuma configuração adicional é necessária.

---

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes unitários com cobertura
npm run test:cov

# Testes e2e (requer banco de dados)
npm run test:e2e

# Todos os testes
npm run test:all
```

---

## 🔗 URLs Úteis

| Serviço | URL |
|---|---|
| API (backend) | http://localhost:3000 |
| Documentação Swagger | http://localhost:3000/api/docs |
| Health check | http://localhost:3000/health |
| Frontend | http://localhost:5173 |

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja [LICENSE](LICENSE) para mais informações.
