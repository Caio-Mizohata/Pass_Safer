# Pass_Safer

Plataforma fullstack que permite armazenar, gerenciar e proteger suas credenciais com autenticação JWT e camadas de segurança robustas.

Instruções rápidas para setup, execução e contribuições deste projeto (backend + frontend).

## Pré-requisitos

- Node.js >= 18
- npm ou pnpm
- MongoDB (local ou serviço externo)

## Instalação

1. Instalar dependências do backend:

```powershell
cd src
npm install
```

1. Instalar dependências do frontend:

```powershell
cd frontend
npm install
```

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto, definindo as seguintes variáveis:

**Servidor e Ambiente:**

- `PORT` — porta do servidor (padrão: 3001)
- `NODE_ENV` — ambiente de execução (development/production)

**MongoDB:**

- `MONGO_INITDB_ROOT_USERNAME` — usuário root do MongoDB
- `MONGO_INITDB_ROOT_PASSWORD` — senha root do MongoDB
- `MONGO_INITDB_DATABASE` — nome do banco de dados
- `MONGO_AUTH_SOURCE` — fonte de autenticação (padrão: admin)

**Segurança:**

- `JWT_SECRET` — segredo para geração de tokens JWT
- `ENCRYPTION_KEY` — chave para criptografia de dados
- `SESSION_SECRET` — segredo para sessões
- `SALT` — número de rounds de salt para bcrypt

**CORS:**

- `CORS_ALLOWED_ORIGINS` — origens permitidas separadas por vírgula
- `CORS_ALLOW_NO_ORIGIN` — permitir requisições sem origem (true/false)

Exemplo:

```text
PORT=3001
NODE_ENV=development

MONGO_INITDB_ROOT_USERNAME=seu_usuario
MONGO_INITDB_ROOT_PASSWORD=sua_senha
MONGO_INITDB_DATABASE=Password_Manager
MONGO_AUTH_SOURCE=admin

SALT=12
JWT_SECRET=sua_chave_jwt_secreta
ENCRYPTION_KEY=sua_chave_encriptacao_secreta
SESSION_SECRET=sua_chave_sessao_secreta

CORS_ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3001
CORS_ALLOW_NO_ORIGIN=true
```

## Executando o projeto

- Rodar backend (na pasta `src`):

```powershell
cd src
npm run dev
```

- Rodar frontend (na pasta `frontend`):

```powershell
cd frontend
npm run dev
```

Abra o frontend em `http://localhost:5173` (ou porta mostrada pelo Vite).

## Lint e formatação

Para o uso de scripts crie ou altere os scripts presentes em cada `package.json` (frontend/backend).

## Contribuição

- Crie uma issue descrevendo o que deseja alterar.
- Abra um pull request com um branch por feature.
- Siga as convenções de código e escreva testes para novas funcionalidades.
- Mantenha o README atualizado com instruções relevantes.
