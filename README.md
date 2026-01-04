# Card Manager

Sistema simples para controle de gastos de cartão de crédito com suporte a compras parceladas.

## Funcionalidades

- **Cadastro de Pessoas**: Registre as pessoas que fazem compras no cartão
- **Registro de Compras**: Cadastre compras com parcelamento automático
- **Controle de Parcelas**: Visualize e dê baixa em parcelas por mês de fatura
- **Comprovantes**: Anexe imagens de comprovantes ao pagar parcelas
- **Relatórios**: Visualize gastos por pessoa e por mês

## Regras do Cartão

- **Dia de Virada**: 2 (compras a partir do dia 2 entram na fatura do mês seguinte)
- **Dia de Vencimento**: 12

## Tecnologias

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- JWT para autenticação

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e configure:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
# Conexão com PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/card_manager?schema=public"

# Autenticação (login fixo)
AUTH_LOGIN="admin"
AUTH_PASSWORD="sua-senha-segura"
JWT_SECRET="sua-chave-jwt-com-pelo-menos-32-caracteres"
```

### 3. Criar banco de dados

```bash
# Gerar cliente Prisma
npm run db:generate

# Criar tabelas no banco
npm run db:push
```

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Verifica erros de linting
- `npm run db:generate` - Gera cliente Prisma
- `npm run db:push` - Sincroniza schema com banco
- `npm run db:migrate` - Executa migrations
- `npm run db:studio` - Abre Prisma Studio

## Estrutura do Projeto

```
src/
├── app/                    # Páginas e rotas (Next.js App Router)
│   ├── (protected)/        # Rotas protegidas por autenticação
│   │   ├── dashboard/      # Dashboard principal
│   │   ├── people/         # CRUD de pessoas
│   │   ├── purchases/      # CRUD de compras
│   │   ├── installments/   # Gestão de parcelas
│   │   └── reports/        # Relatórios
│   ├── login/              # Página de login
│   └── api/                # API Routes
├── components/             # Componentes React reutilizáveis
│   └── layout/             # Componentes de layout
├── domains/                # Lógica de negócio por domínio
│   ├── people/             # Domínio de pessoas
│   ├── purchases/          # Domínio de compras
│   ├── installments/       # Domínio de parcelas
│   └── reports/            # Domínio de relatórios
└── lib/                    # Utilitários compartilhados
    ├── auth.ts             # Autenticação JWT
    ├── credit-card.ts      # Regras do cartão
    └── db.ts               # Cliente Prisma
```

## Banco de Dados

### Modelos

- **Person**: Pessoas que fazem compras
- **Purchase**: Compras realizadas
- **Installment**: Parcelas das compras

### Armazenamento de Imagens

Os comprovantes são armazenados diretamente no PostgreSQL usando o tipo `BYTEA`.

## Uso

### Login

Use as credenciais configuradas em `AUTH_LOGIN` e `AUTH_PASSWORD` no arquivo `.env`.

### Fluxo Básico

1. Cadastre as pessoas que usam o cartão
2. Registre as compras com valor total e número de parcelas
3. O sistema calcula automaticamente em qual fatura cada parcela cai
4. Acesse "Parcelas" para dar baixa com ou sem comprovante
5. Use "Relatórios" para ver gastos consolidados

## Docker

### Desenvolvimento (apenas banco de dados)

```bash
# Inicia apenas o PostgreSQL
docker-compose -f docker-compose.dev.yml up -d

# Configure o .env local
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/card_manager_db?schema=public"

# Rode as migrations e inicie o dev server
npm run db:push
npm run dev
```

### Produção (aplicação completa)

```bash
# Crie um arquivo .env com as variáveis
cat > .env << EOF
POSTGRES_USER=postgres
POSTGRES_PASSWORD=sua-senha-segura
POSTGRES_DB=card_manager_db
AUTH_LOGIN=admin
AUTH_PASSWORD=sua-senha-aqui
JWT_SECRET=sua-chave-jwt-com-pelo-menos-32-caracteres
EOF

# Inicie todos os serviços
docker-compose up -d --build

# A aplicação estará disponível em http://localhost:3000
```

### Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `POSTGRES_USER` | Usuário do PostgreSQL (docker-compose) | `postgres` |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL (docker-compose) | `postgres123` |
| `POSTGRES_DB` | Nome do banco (docker-compose) | `card_manager_db` |
| `AUTH_LOGIN` | Usuário para login | `admin` |
| `AUTH_PASSWORD` | Senha para login | `sua-senha` |
| `JWT_SECRET` | Chave secreta para JWT (mín. 32 chars) | `chave-secreta-longa` |

## CI/CD

O projeto inclui um workflow do GitHub Actions (`.github/workflows/docker-build.yml`) que:

1. Builda a imagem Docker automaticamente em pushes para `main`
2. Publica a imagem no GitHub Container Registry (ghcr.io)
3. Suporta disparo manual com tag customizada

### Usando a imagem publicada

```bash
# Pull da imagem
docker pull ghcr.io/SEU_USUARIO/card-manager:latest

# Rodar com docker-compose (crie um docker-compose.prod.yml)
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e AUTH_LOGIN="admin" \
  -e AUTH_PASSWORD="senha" \
  -e JWT_SECRET="chave-secreta" \
  ghcr.io/SEU_USUARIO/card-manager:latest
```

## Licença

Projeto para uso pessoal.

