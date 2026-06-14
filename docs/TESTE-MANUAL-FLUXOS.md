# Meraki — Roteiro de Teste Manual (Empresa × Especialista)

Guia para testar os fluxos do sistema **na mão**, validando o que funciona e confirmando os bugs conhecidos.

## Pré-requisitos

- [ ] Backend no ar (Docker): `docker ps` deve mostrar os 7 serviços + DBs + rabbitmq. Gateway em `http://localhost:3000`.
- [ ] Frontend no ar: `cd frontend && npm run dev` → `http://localhost:5173`.
- [ ] Navegador limpo (sessão usa `sessionStorage` — abrir aba anônima ajuda a isolar empresa × especialista).

> 💡 **Dica:** teste a **Empresa** numa janela normal e o **Especialista** numa janela anônima — assim as duas sessões coexistem sem logout cruzado.

## Contas de teste sugeridas

| Papel | E-mail | Senha |
|---|---|---|
| Empresa | `empresa1@teste.com` | `Test1234!` |
| Especialista | `dev1@teste.com` | `Test1234!` |

## Legenda

- ✅ Resultado esperado
- ⚠️ Bug conhecido (nº do issue no GitHub) — confirme se ainda acontece
- 🔲 Caixa pra marcar conforme testa

---

# 0. Autenticação (ambos os papéis)

### 0.1 Criar conta — Empresa
1. Acesse `/signup`.
2. Preencha nome, e-mail, senha, **tipo = Empresa** (e nome da empresa).
3. Clique em **Criar conta**.
- [ ] ✅ Cria a conta e entra logado (vai pro `/dashboard` da empresa).
- ⚠️ Fluxo **sem verificação real de e-mail** (#55, #18) — qualquer e-mail é aceito.

### 0.2 Criar conta — Especialista
1. Em aba anônima, `/signup` → tipo = **Especialista**.
- [ ] ✅ Entra no `/dashboard` do especialista (“Terminal do Especialista”).

### 0.3 Login / Logout
1. Menu do usuário (canto superior direito) → **Sair**.
2. Faça login de novo em `/login`.
- [ ] ✅ Login leva ao dashboard do papel certo.
- ⚠️ Fique de olho em **logouts inesperados** sem você ter saído (#42).

---

# 1. Fluxos da EMPRESA

> Navbar da empresa: **EMPRESA** (dashboard) · **TALENTOS** · **FINANCEIRO**

### 1.1 Criar projeto (RF03) — wizard de 4 passos
1. Dashboard → botão de **criar projeto** (vai pra `/projects/new`).
2. **Passo 1 (base):** título, descrição.
3. **Passo 2 (tecnologias):** digite uma skill (ex.: `NestJS`) e adicione. Repita.
4. **Passo 3 (milestones):** adicione 2+ milestones (título, valor, descrição).
5. **Passo 4 (orçamento):** orçamento e prazo → **Publicar**.
- [ ] ✅ Projeto publicado e aparece no dashboard com status **OPEN**.
- ⚠️ Verifique se o projeto **não é criado em duplicidade** (#39 — estava criando 2x).
- ⚠️ Nos campos de milestone, tente colar **texto/valor gigante**: o layout não deve estourar (#38 — falta overflow no front).
- ⚠️ Skills hoje são texto livre, **sem autocomplete/centralização** (#53) e **sem validação** (#41).

### 1.2 Ver propostas e escolher vencedor (RF06/RF07/RN03)
1. No card do projeto OPEN → **ver propostas** (`/projects/:id/bids`).
2. Veja as propostas recebidas dos especialistas.
3. **Aceite** uma proposta.
- [ ] ✅ A proposta aceita vira vencedora e o projeto vai pra **IN_PROGRESS** (abre/leva ao Kanban).
- [ ] ✅ **RN03:** as demais propostas são **REJEITADAS automaticamente**.
- ⚠️ A tela de avaliação está com **layout quebrado** (#40).
- ⚠️ **Não mostra as observações** que o especialista colocou por milestone (#45).

### 1.3 Kanban — validar entregas (RF08/RF09/RN04/RN07)
1. Abra o **Kanban** do projeto (`/kanban/:id`).
2. Acompanhe as milestones conforme o especialista as inicia/submete.
3. Quando uma milestone estiver **SUBMETIDA**, use **Aprovar** ou **Rejeitar**.
   - Ao rejeitar: preencha o motivo no modal → confirma.
- [ ] ✅ **RN04:** só a 1ª milestone pendente (com as anteriores aprovadas) pode avançar; as seguintes ficam **bloqueadas**.
- [ ] ✅ Aprovar libera o pagamento da fase (taxa de 10%); rejeitar devolve a milestone pra correção.
- ⚠️ Na hora de aprovar/rejeitar, **não aparecem os links do GitHub/entregáveis** pra validar de fato (#48).
- ⚠️ O campo de **“nota”** da empresa **não envia nada** e parece um chat sem função (#6/#43).
- ⚠️ Falta a tela de **validação por um terceiro** além da empresa (#47).
- ⚠️ Pergunta aberta: **em que momento o escrow retém o dinheiro?** (#49).

### 1.4 Completar / Cancelar projeto
1. Projeto **IN_PROGRESS** com todas as milestones aprovadas → **MARCAR_COMPLETO()**.
- [ ] ✅ Status vira **COMPLETED**.
2. Projeto **OPEN** → ícone de **cancelar**.
- [ ] ✅ Status vira **CANCELLED** e some das oportunidades do especialista.

### 1.5 Financeiro da empresa
1. Navbar → **FINANCEIRO** (`/financial`).
- [ ] ✅ Mostra pagamentos/retenções do projeto.
- ⚠️ Tem **conteúdo mockado** (#54). Confirme o que é real vs fixo.

### 1.6 Explorar talentos
1. Navbar → **TALENTOS** (`/talents`).
2. Busque por skill e abra o **perfil público** de um especialista.
- [ ] ✅ Lista e abre `/profile/specialist/:id`.
- ⚠️ Filtro por skill depende da **centralização de skills** (#53) pra ser confiável.

### 1.7 Editar perfil da empresa
1. Abra o perfil da empresa e **edite/salve**.
- [ ] ✅ Salva as alterações.
- ⚠️ Ao salvar, a **tela pode ficar preta** (mesmo salvando) (#52).
- ⚠️ **Upload de foto** ainda não existe (#14).

---

# 2. Fluxos do ESPECIALISTA

> Navbar do especialista: **ESPECIALISTA** (dashboard) · **PROJETOS** · **PORTFÓLIO** · **GANHOS**

### 2.1 Dashboard / descoberta de oportunidades (RF05)
1. Logado como especialista → `/dashboard` (“Terminal do Especialista”).
- [ ] ✅ Com skills cadastradas, vê a seção **“Recomendados para Você”** (projetos que batem com suas skills).
- [ ] ✅ Botão **“Ver todos”** leva a `/projects/browse`.
- ⚠️ Especialista **sem skills** está recebendo **todos** os projetos (#44/#7) — confirme.

### 2.2 Buscar projetos
1. Navbar → **PROJETOS** (`/projects/browse`).
- [ ] ✅ Lista os projetos **OPEN**; abrir leva ao terminal de bidding.

### 2.3 Enviar proposta (RF05/RN02)
1. Abra um projeto OPEN → `/bidding/:id`.
2. Preencha **valor**, **duração (dias)** e **carta de apresentação**.
3. (Opcional) Proponha valores/observações por **milestone**.
4. **Submeter proposta**.
- [ ] ✅ Mostra **“PROPOSTA SUBMETIDA”** e a proposta fica **PENDING**.
- [ ] ✅ **RN02:** não dá pra enviar uma **segunda proposta ativa** no mesmo projeto.

### 2.4 Editar / Retirar proposta
1. Com proposta **PENDING**: **Editar Proposta** (altera valores) e **Retirar Proposta** (confirma no diálogo).
- [ ] ✅ Editar atualiza; **Retirar** muda o status pra **WITHDRAWN**.

### 2.5 Kanban — executar entregas (RF08/RF09)
1. Após ser aceito, abra o **Kanban** do projeto.
2. Na 1ª milestone liberada → **Iniciar** → **Submeter entrega** (repo, release notes).
- [ ] ✅ Inicia (IN_PROGRESS) e submete (SUBMITTED); aguarda aprovação da empresa.
- ⚠️ Ao submeter, **não está obrigando** a informar link do GitHub/entregáveis (#46).

### 2.6 Ganhos
1. Navbar → **GANHOS** (`/earnings`).
- [ ] ✅ Mostra os valores recebidos por milestone aprovada (menos a taxa de 10%).

### 2.7 Portfólio / perfil público (RF12/RF13)
1. Navbar → **PORTFÓLIO** (`/portfolio`) e veja seu perfil público em `/profile/specialist/:id`.
2. Abas: **Histórico de Projetos**, **Avaliações**, **Repos**.
- [ ] ✅ A aba **Avaliações** lista reviews (estrelas + comentário) ou “Nenhuma avaliação ainda”.
- ⚠️ **Upload de foto** ainda não existe (#14).
- ⚠️ Editar/salvar perfil pode dar **tela preta** (#52).

---

# 3. Fluxo ponta-a-ponta (cruzado) — a jornada completa

Use as **duas janelas** (empresa + especialista) e siga em ordem:

1. **Empresa:** cria projeto com 2 milestones e publica (OPEN). _(1.1)_
2. **Especialista:** encontra o projeto e envia proposta. _(2.3)_
3. **Empresa:** vê a proposta, **aceita** → projeto vira IN_PROGRESS, demais rejeitadas (RN03). _(1.2)_
4. **Especialista:** no Kanban, **inicia** e **submete** a Milestone 1. _(2.5)_
5. **Empresa:** no Kanban, **aprova** a Milestone 1 (libera pagamento c/ taxa 10%). _(1.3)_
6. **Especialista:** confirma em **GANHOS** o valor recebido. _(2.6)_
7. Repete 4–6 para a Milestone 2 (confirma **RN04**: a 2 só libera após a 1 aprovada).
8. **Empresa:** **MARCAR_COMPLETO()** → projeto COMPLETED. _(1.4)_
9. **Empresa:** avalia o especialista; **Especialista:** vê a review no portfólio. _(2.7)_

- [ ] ✅ Jornada completa sem erro 5xx e com os status corretos em cada etapa.

---

# Anexo — Bugs conhecidos a confirmar (issues #38–#57)

| # | Onde | O quê |
|---|---|---|
| #38 | Empresa · milestones | Inputs absurdos quebram o layout (falta overflow no front) |
| #39 | Empresa · criar projeto | Cria o projeto 2x |
| #40 | Empresa · ver propostas | Layout quebrado |
| #41 | Skills | Sem validação de habilidade |
| #42 | Auth | Logouts inesperados |
| #43 | Empresa · kanban | Campo de “nota” não envia / parece chat |
| #44 | Especialista · dashboard | Sem skills recebe todos os projetos |
| #45 | Empresa · avaliar proposta | Não mostra observações das milestones |
| #46 | Especialista · kanban | Submeter entrega não exige GitHub |
| #47 | Kanban | Falta validação por um terceiro |
| #48 | Empresa · kanban | Aprova/rejeita sem ver links/entregáveis |
| #49 | Escrow | Quando o dinheiro fica retido? |
| #50 | Sistema | Falta sistema de notificações |
| #51/#14 | Perfis | Upload de fotos inexistente |
| #52 | Perfil | Editar/salvar deixa a tela preta |
| #53 | Skills | Falta centralização/autocomplete de skills |
| #54 | Empresa · financeiro | Dados mockados |
| #55/#18 | Auth | Sem verificação real de e-mail |
| #56 | Pagamento | Pagamento real (env, Pix/provedor, escrow) |
| #57 | Contrato | Quando é firmado / tratamento legal por milestone |
