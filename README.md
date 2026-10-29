# Pass_Safer

Plataforma fullstack que permite armazenar, gerenciar e proteger suas credenciais com autenticação JWT e camadas de segurança robustas.

Instruções rápidas para setup, execução e contribuições deste projeto (backend + frontend).

## Pré-requisitos

- Node.js >= 20.19
- npm ou pnpm
- MongoDB (local ou serviço externo)

## Instalação

1. Instalar dependências do backend na raiz do projeto:

```powershell
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
- `TRUST_PROXY_HOPS` — quantidade de proxies confiáveis à frente da aplicação (`0` por padrão)

**MongoDB:**

- `MONGO_INITDB_ROOT_USERNAME` — usuário root do MongoDB
- `MONGO_INITDB_ROOT_PASSWORD` — senha root do MongoDB
- `MONGO_INITDB_DATABASE` — nome do banco de dados
- `MONGO_AUTH_SOURCE` — fonte de autenticação (padrão: admin)

**Segurança:**

- `JWT_SECRET` — segredo do JWT com ao menos 32 caracteres em produção
- `ENCRYPTION_KEY` — chave-base da criptografia com ao menos 32 caracteres em produção
- `SESSION_SECRET` — segredo do CSRF com ao menos 32 caracteres em produção
- `SALT` — salt estável usado na derivação da chave, com ao menos 16 caracteres em produção

**CORS:**

- `CORS_ALLOWED_ORIGINS` — origens permitidas separadas por vírgula
- `CORS_ALLOW_NO_ORIGIN` — permitir requisições sem origem (true/false)

Exemplo:

```text
PORT=3001
NODE_ENV=development
TRUST_PROXY_HOPS=0

MONGO_INITDB_ROOT_USERNAME=seu_usuario
MONGO_INITDB_ROOT_PASSWORD=sua_senha
MONGO_INITDB_DATABASE=Password_Manager
MONGO_AUTH_SOURCE=admin

SALT=um_salt_estavel_com_16_caracteres
JWT_SECRET=um_segredo_jwt_aleatorio_com_32_caracteres
ENCRYPTION_KEY=uma_chave_aleatoria_com_32_caracteres
SESSION_SECRET=um_segredo_csrf_aleatorio_com_32_caracteres

CORS_ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3001
CORS_ALLOW_NO_ORIGIN=true
```

## Executando o projeto

- Rodar backend na raiz do projeto:

```powershell
npm run dev
```

- Rodar frontend (na pasta `frontend`):

```powershell
cd frontend
npm run dev
```

Abra o frontend em `http://localhost:5173` (ou porta mostrada pelo Vite).

## Segurança do backend

- Senhas de acesso são armazenadas com Argon2id.
- Credenciais salvas são protegidas com AES-256-GCM, IV aleatório e tag de autenticação.
- Tokens JWT expiram em uma hora e aceitam explicitamente apenas o algoritmo HS256.
- Todas as rotas de credenciais exigem autenticação e consultam registros pelo par `_id` e `userId`, evitando IDOR/BOLA.
- Os payloads são validados por schemas estritos e o corpo JSON é limitado a 16 KB.
- Helmet, CORS, CSRF e rate limiting são aplicados globalmente ou nas rotas sensíveis.
- Erros internos retornam uma mensagem genérica. Uma credencial inexistente ou pertencente a outro usuário retorna o mesmo `404`:

```json
{
  "error": true,
  "message": "Credencial não encontrada"
}
```

Não altere `ENCRYPTION_KEY` ou `SALT` depois que houver credenciais armazenadas sem antes executar uma migração, pois a troca impede a descriptografia dos registros existentes.

## Lint e formatação

Para o uso de scripts crie ou altere os scripts presentes em cada `package.json` (frontend/backend).

## Contribuição

- Crie uma issue descrevendo o que deseja alterar.
- Abra um pull request com um branch por feature.
- Siga as convenções de código e escreva testes para novas funcionalidades.
- Mantenha o README atualizado com instruções relevantes.
