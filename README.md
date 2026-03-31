<!-- markdownlint-disable MD010 MD032 -->

# Pass_Safer Backend - Manual Técnico de Integração Frontend (Next.js App Router)

Documento técnico consolidado para iniciar o desenvolvimento do frontend em Next.js (App Router) em modo de desenvolvimento, com base no comportamento atual do backend Express + TypeScript + MongoDB.

## 1. Objetivo e Regra de Ouro

Este manual existe para servir como contrato de integração entre frontend e backend.

Regra de ouro de segurança:
- O frontend é estritamente camada de apresentação.
- Toda validação de dados sensíveis e todo processo de criptografia/descriptografia pertencem exclusivamente ao backend.
- O frontend jamais deve implementar criptografia própria para persistência de credenciais e jamais deve armazenar senha em texto puro fora do fluxo de envio seguro ao backend.

## 2. Contexto de Ambiente (Desenvolvimento)

- API Base URL oficial (dev): `http://localhost:3001`
- Stack backend: Express 4 + TypeScript + MongoDB
- Execução em desenvolvimento: `npm run dev` (nodemon + ts-node)

Observação importante:
- O backend atual nao usa prefixo `/api` nas rotas.
- Exemplo: login e `POST /login` (nao `POST /api/auth/login`).

## 3. Visão de Arquitetura da API

Dominios principais expostos ao frontend:
- Autenticação: registro, login, logout
- Senhas: criar, obter por id, atualizar, deletar

Autorização:
- Rotas privadas exigem header `Authorization: Bearer <JWT>`.

Persistência e segurança no backend:
- Senha do usuario: hash Argon2id
- Senha de servicos: criptografia AES-256-GCM
- Logout: invalidação por blacklist de token com expiração TTL

## 4. Mapeamento Completo de Endpoints REST

### 4.1 Autenticação

#### `POST /register`

Descrição:
- Registra um novo usuario.

Autenticação:
- Nao requerida.

Payload esperado:

```json
{
	"username": "opcional",
	"email": "usuario@dominio.com",
	"password": "senhaEmTextoPuro"
}
```

Sucesso:
- `201 Created`

```json
{
	"error": false,
	"message": "Usuário registrado com sucesso"
}
```

Erros esperados:
- `400 Bad Request` (dados invalidos)
- `500 Internal Server Error` (erro interno, incluindo casos como duplicidade propagada)

---

#### `POST /login`

Descrição:
- Autentica usuario e retorna JWT.

Autenticação:
- Nao requerida.

Payload esperado:

```json
{
	"email": "usuario@dominio.com",
	"password": "senhaEmTextoPuro"
}
```

Sucesso:
- `200 OK`

```json
{
	"error": false,
	"message": "Login bem-sucedido",
	"usuario": {
		"id": "507f1f77bcf86cd799439011"
	},
	"token": "jwt"
}
```

Erros esperados:
- `400 Bad Request` (payload ausente/invalido)
- `401 Unauthorized` (credenciais invalidas)
- `500 Internal Server Error`

---

#### `POST /logout`

Descrição:
- Invalida token adicionando-o em blacklist até expirar.

Autenticação:
- Requerida.

Headers:
- `Authorization: Bearer <token>`

Payload esperado:
- Sem body obrigatorio.

Sucesso:
- `200 OK`

```json
{
	"error": false,
	"message": "Logout realizado com sucesso"
}
```

Erros esperados:
- `401 Unauthorized` (sem token, token invalido, malformado ou expirado)
- `500 Internal Server Error`

### 4.2 CRUD de Senhas

Todas as rotas abaixo exigem autenticação Bearer JWT.

#### `POST /passwords`

Descrição:
- Cria uma entrada de senha para o usuario autenticado.

Headers obrigatorios:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

Payload esperado:

```json
{
	"serviceName": "Gmail",
	"password": "senhaDaConta",
	"usernameAccount": "usuario@gmail.com",
	"notes": "Opcional"
}
```

Sucesso:
- `201 Created`
- Retorna o documento persistido (inclui `passwordHash` criptografado).

Erros esperados:
- `400 Bad Request` (campos obrigatorios ausentes)
- `401 Unauthorized` (usuario nao autenticado)
- `403 Forbidden` (campos nao permitidos no body)
- `500 Internal Server Error`

---

#### `GET /passwords/:id`

Descrição:
- Retorna uma credencial especifica (somente se pertencer ao usuario autenticado).
- A senha volta descriptografada neste endpoint.

Headers obrigatorios:
- `Authorization: Bearer <token>`

Path param:
- `id`: ObjectId da credencial

Sucesso:
- `200 OK`

```json
{
	"id": "507f191e810c19729de860ea",
	"serviceName": "Gmail",
	"usernameAccount": "usuario@gmail.com",
	"password": "senhaEmTextoPuro",
	"notes": "Opcional"
}
```

Erros esperados:
- `400 Bad Request` (id invalido)
- `401 Unauthorized`
- `404 Not Found` (nao encontrado/sem acesso)
- `500 Internal Server Error`

---

#### `PUT /passwords/:id`

Descrição:
- Atualiza campos parciais de uma credencial.

Headers obrigatorios:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

Path param:
- `id`: ObjectId da credencial

Payload esperado (parcial):

```json
{
	"serviceName": "Novo Nome",
	"usernameAccount": "novoUsuario",
	"password": "novaSenha",
	"notes": "novas notas"
}
```

Sucesso:
- `200 OK`

```json
{
	"message": "Serviço, Usuário, Senha, Notas atualizado(s) com sucesso"
}
```

Erros esperados:
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden` (campos nao permitidos no body)
- `500 Internal Server Error`

---

#### `DELETE /passwords/:id`

Descrição:
- Remove uma credencial de forma permanente.

Headers obrigatorios:
- `Authorization: Bearer <token>`

Path param:
- `id`: ObjectId da credencial

Sucesso:
- `200 OK`

```json
{
	"message": "Senha deletada com sucesso"
}
```

Erros esperados:
- `400 Bad Request`
- `401 Unauthorized`
- `500 Internal Server Error`

## 5. Contratos de Dados para Next.js (TypeScript)

Use estas interfaces no frontend para consumo da API.

```ts
export interface ApiErrorResponse {
	error?: boolean;
	message: string;
}

export interface RegisterRequest {
	username?: string;
	email: string;
	password: string;
}

export interface RegisterResponse {
	error: boolean;
	message: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	error: boolean;
	message: string;
	usuario: {
		id: string;
	};
	token: string;
}

export interface LogoutResponse {
	error: boolean;
	message: string;
}

export interface DecodedToken {
	id: string;
	email: string;
	username?: string;
	iat: number;
	exp: number;
}

export interface CreatePasswordRequest {
	serviceName: string;
	password: string;
	usernameAccount?: string;
	notes?: string;
}

export interface EncryptedPasswordHash {
	iv: string;
	content: string;
	tag: string;
}

export interface PasswordCreatedResponse {
	_id: string;
	userId: string;
	serviceName: string;
	usernameAccount: string | null;
	passwordHash: EncryptedPasswordHash;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface PasswordDetailResponse {
	id: string;
	serviceName: string;
	usernameAccount: string | null;
	password: string;
	notes: string | null;
}

export interface UpdatePasswordRequest {
	serviceName?: string;
	usernameAccount?: string;
	password?: string;
	notes?: string;
}

export interface UpdatePasswordResponse {
	message: string;
}

export interface DeletePasswordResponse {
	message: string;
}
```

## 6. Fluxo JWT e Sessão

Fluxo recomendado de integração:
1. Frontend envia `POST /login` com email e senha.
2. Backend retorna `token` JWT com expiração de 1 hora.
3. Frontend armazena token de forma segura para modo desenvolvimento (preferencialmente `sessionStorage` se nao houver fluxo de refresh por cookie httpOnly).
4. Frontend envia `Authorization: Bearer <token>` em todas as rotas privadas.
5. No logout, frontend chama `POST /logout` com Bearer token.
6. Backend inclui o token em blacklist e rejeita novo uso.
7. Em respostas `401`, frontend limpa sessão e redireciona para login.

Payload JWT esperado:

```ts
{
	id: string;
	email: string;
	username?: string;
	iat: number;
	exp: number;
}
```

## 7. Headers e Regras de Integração

Headers obrigatorios:
- `Authorization: Bearer <token>` para rotas protegidas
- `Content-Type: application/json` em POST/PUT

Headers de rate limit:
- Backend usa `standardHeaders`, portanto o frontend pode ler `RateLimit-*` para UX (quando aplicavel).

Regras para payload em `/passwords`:
- Campos extras sao bloqueados com `403 Forbidden`.
- Chaves permitidas: `serviceName`, `password`, `usernameAccount`, `notes`.

## 8. Rate Limit (Comportamento Atual)

Configuração atual:
- Global: 50 req / 15 min
- Autenticação (`/register`, `/login`): 5 req / 15 min
- Senhas (`/passwords*`): 30 req / 15 min

Exceção atual:
- Requisicoes originadas de localhost (`127.0.0.1` e `::1`) sao ignoradas no rate limit.

Impacto no frontend:
- Implementar debounce/throttle em ações repetitivas.
- Tratar `429` com mensagem amigavel e tentativa posterior.
- Evitar retries agressivos automatizados sem backoff.

## 9. CSRF, CORS e Considerações de Infra

CSRF:
- Existe middleware dedicado, mas atualmente nao aplicado no pipeline principal do app.
- Existe emissor de token CSRF no middleware, mas endpoint dedicado de emissao ainda nao esta exposto.

CORS:
- Biblioteca `cors` esta presente, mas nao aplicada no pipeline atual.
- Para frontend Next.js em origem diferente, o backend precisa habilitar CORS explicitamente.

Infra MongoDB (dev):
- `docker-compose.yml` define Mongo em `127.0.0.1:27017` com credenciais via variaveis de ambiente.

## 10. Lacunas Arquiteturais que Impactam o Frontend

Estas lacunas devem ser conhecidas antes de iniciar telas e fluxos:

1. Nao existe endpoint `GET /passwords` para listagem completa do usuario.
1. Nao existe endpoint de refresh token (`/auth/refresh`).
1. Contratos de resposta sao heterogeneos:
- Alguns retornam `{ error, message }`.
- Outros retornam apenas `{ message }`.
- `POST /passwords` retorna objeto persistido com `passwordHash`.
- `GET /passwords/:id` retorna senha descriptografada.
1. Atualização (`PUT /passwords/:id`) retorna somente mensagem, nao retorna objeto atualizado.

## 11. Requisitos Mínimos para Desbloquear o Frontend em Dev

Checklist recomendado para integração mais estável:

- [ ] Habilitar CORS para origem do frontend Next.js.
- [ ] Definir estratégia de sessão para 401 e expiração de 1h.
- [ ] Definir padronização de envelope de erro/sucesso.
- [ ] Considerar endpoint `GET /passwords` para dashboard/listagem.
- [ ] Considerar endpoint `POST /auth/refresh` para melhor UX.
- [ ] Definir estratégia CSRF final antes de produção.

## 12. Quick Start para o Agente de IA Frontend (Next.js App Router)

Passo a passo operacional:

1. Configurar variável `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001`.
2. Criar cliente HTTP centralizado com injeção automática de `Authorization` quando houver token.
3. Implementar módulo de autenticação com contratos deste README (`register`, `login`, `logout`).
4. Implementar módulo de senhas com contratos deste README (`POST/GET by id/PUT/DELETE`).
5. Implementar normalizador de erro para lidar com respostas heterogeneas.
6. Tratar `401` com limpeza de sessão e redirect para login.
7. Tratar `429` com feedback e espera controlada.

Exemplo de normalização de erro no frontend:

```ts
export function getApiErrorMessage(payload: unknown, fallback = "Erro inesperado") {
	if (payload && typeof payload === "object" && "message" in payload) {
		const message = (payload as { message?: unknown }).message;
		if (typeof message === "string" && message.trim()) return message;
	}
	return fallback;
}
```

## 13. Resumo Executivo de Segurança

Papel do frontend:
- Capturar entrada do usuario
- Exibir estado da aplicação
- Enviar dados para API
- Exibir mensagens de erro/sucesso

Papel do backend (obrigatorio e exclusivo):
- Validar identidade e autorização
- Aplicar regras de negocio sensiveis
- Hash de senha de usuario (Argon2id)
- Criptografia/descriptografia de segredos (AES-256-GCM)
- Controle de sessão por JWT + blacklist
- Rate limit e proteção de abuso

Se houver conflito entre UX e segurança, a segurança do backend prevalece.
