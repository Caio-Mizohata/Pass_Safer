# Pass_Safer

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

Crie um arquivo `.env` no backend (`src/`), definindo pelo menos:

- `PORT` — porta do servidor
- `MONGO_URI` — string de conexão com o MongoDB
- `JWT_SECRET` — segredo para tokens

Exemplo mínimo:

```text
PORT=4000
MONGO_URI=mongodb://localhost:27017/pass_safer
JWT_SECRET=troque_para_um_segredo_forte
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

## Testes

Para rodar testes do frontend:

```powershell
cd frontend
npm test
```

Para testes do backend (se existirem), execute os comandos na pasta `src`.

## Lint e formatação

Verifique e corrija com os scripts presentes em cada `package.json` (frontend/backend).

## Contribuição

- Crie uma issue descrevendo o que deseja alterar.
- Abra um pull request com um branch por feature.
- Siga as convenções de código e escreva testes para novas funcionalidades.
- Mantenha o README atualizado com instruções relevantes.
