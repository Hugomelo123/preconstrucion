# preconstrucion

Aplicação para acompanhar o pipeline de pré-construção: leads, visitas técnicas, devis enviados, relances e projetos aceites. Inclui KPIs (valor pendente, valor sem resposta >14 dias) e fichas de visita com possibilidade de atualizar o estado de cada projeto.

---

## O que está implementado

### Frontend (React + Vite)

- **Página principal (Home)**  
  - Header com 3 KPIs calculados a partir dos dados da API:
    - **Devis Pendentes** – soma do valor de todos os projetos que ainda não estão em "Accepté".
    - **Sem resposta > 14 dias** – soma do valor dos projetos há mais de 14 dias no mesmo estado.
    - **Tempo médio envio devis** – valor fixo (6 dias), reservado para evolução futura.
  - **Pipeline em colunas** (Kanban): Nouveau Lead → Visite Technique → Devis Envoyé → Relance Client → Accepté.
  - **Cards de projeto** por coluna (cliente, título, valor); projetos com >14 dias no estado são destacados (alerta).
  - **Ficha de Visita** (painel lateral ao clicar num projeto):
    - Dados do cliente, especificações, observações.
    - Placeholder para fotos da visita (campo `photoUrls` já existe no modelo).
    - **Atualizar Estado**: seleção do novo estado + botão que envia `PATCH /api/projects/:id` e atualiza a lista.

- **Dados**: vêm da API (`GET /api/projects`). React Query para fetching e invalidação após atualização.

### Backend (Express)

- **API de projetos** (prefixo `/api`):
  - `GET /api/projects` – lista todos os projetos.
  - `GET /api/projects/:id` – um projeto.
  - `POST /api/projects` – criar projeto (body validado com Zod).
  - `PATCH /api/projects/:id` – atualizar projeto (ex.: mudar `status` e reiniciar `daysInStatus`).

- **Schema partilhado** (`shared/schema.ts`):
  - Tabela `projects`: id, title, client, value, status, daysInStatus, type, location, phone, email, measures, notes, expectedQuoteDate, photoUrls (array de URLs).
  - Constante `PROJECT_STATUSES` e tipos `Project`, `InsertProject`, `UpdateProject`.
  - Tabela `users` mantida para futura autenticação.

- **Storage**: em memória (`MemStorage`) com seed de 7 projetos de exemplo. Pronto para trocar por persistência (ex.: Drizzle + PostgreSQL) mantendo a mesma interface.

### Conclusões

| Área              | Estado |
|-------------------|--------|
| **Projetos**      | CRUD completo (API + frontend). Dados em memória com seed. |
| **KPIs**          | Dois primeiros calculados a partir da API; o terceiro ainda fixo. |
| **Atualizar estado** | Funcional: seleção de novo estado + PATCH; lista e painel atualizam. |
| **Fotos da visita**   | Campo `photoUrls` no modelo; UI com placeholders; upload não implementado. |
| **Base de dados**    | Schema Drizzle definido; `db:push` configurado; em runtime usa memória. |
| **Autenticação**     | Schema e storage de users existem; login/registro e proteção de rotas não implementados. |

---

## Como correr

1. **Instalar dependências**
   ```bash
   npm install
   ```

2. **Modo desenvolvimento** (cliente + servidor, uma porta)
   ```bash
   npm run dev
   ```
   Por defeito serve em `http://localhost:5000` (ou na porta definida em `PORT`).

3. **Produção**
   ```bash
   npm run build
   npm start
   ```

4. **Base de dados PostgreSQL** (opcional, para persistência)
   - Definir `DATABASE_URL`.
   - Correr `npm run db:push` para criar/atualizar tabelas.
   - Alterar o server para usar um storage que use Drizzle em vez de `MemStorage` para projetos (e, se quiser, para users).

---

## Próximos passos sugeridos

- Persistência: usar Drizzle + PostgreSQL para projetos (e users) em produção.
- Autenticação: login/registro com Passport e proteção das rotas `/api/projects`.
- Fotos: upload de imagens (ex.: para um storage ou bucket) e guardar URLs em `photoUrls`.
- Tempo médio de envio de devis: campo de data (ex. `quoteSentAt`) e cálculo do KPI a partir dos dados.
- Atualização automática de `daysInStatus` (ex.: job diário ou cálculo a partir de `statusUpdatedAt`).
