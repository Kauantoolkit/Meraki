# Meraki Mobile

Aplicativo mobile da plataforma **Meraki**, um marketplace que conecta empresas a especialistas (freelancers/consultores). Empresas publicam projetos com milestones, especialistas submetem propostas, e a plataforma gerencia entregas e pagamentos com escrow.

## Como executar

```bash
# Pré-requisitos: Flutter SDK 3.x instalado

# Instalar dependências
cd mobile
flutter pub get

# Executar em modo debug
flutter run

# O backend deve estar rodando (docker compose up -d na pasta backend/)
# A URL da API é configurada em lib/core/api/api_client.dart
```

## Arquitetura — MVVM

O aplicativo segue o padrão **MVVM (Model-View-ViewModel)** com separação clara de responsabilidades:

```
lib/
├── core/                    # API client (Dio), Storage (Hive), Theme
├── features/
│   ├── auth/                # Login e registro
│   │   ├── model/           # UserModel
│   │   ├── repository/      # AuthRepository (API + persistência de token)
│   │   ├── viewmodel/       # AuthViewModel (estado de autenticação)
│   │   └── view/            # LoginScreen, RegisterScreen
│   ├── projects/            # Projetos e milestones
│   │   ├── model/           # ProjectModel, MilestoneModel
│   │   ├── repository/      # ProjectRepository (comunicação com API)
│   │   ├── viewmodel/       # ProjectsViewModel, CreateProjectViewModel
│   │   └── view/            # ProjectsListScreen, CreateProjectScreen
│   ├── bidding/             # Propostas
│   ├── delivery/            # Entregas e Kanban
│   ├── payments/            # Financeiro (empresa) e Ganhos (especialista)
│   ├── portfolio/           # Perfil público, certificações, avaliações
│   └── skills/              # Gerenciamento de skills e quiz de validação
└── shared/                  # Widgets compartilhados (MainShell, bottom nav)
```

- **Model**: classes de dados (`ProjectModel`, `PaymentModel`, etc.) com `fromJson`/`toJson`
- **ViewModel**: gerenciamento de estado reativo via Riverpod (`AsyncNotifier`, `Notifier`)
- **View**: widgets Flutter que consomem os ViewModels via `ref.watch()`

As Views nunca acessam a API diretamente nem contêm regras de negócio.

## Padrão de projeto adicional — Observer

O padrão **Observer** é aplicado através do **Riverpod**, o framework de gerenciamento de estado reativo:

- Os **ViewModels** (`AsyncNotifier`) são os *subjects* que mantêm o estado
- As **Views** (`ConsumerWidget`) são os *observers* que reagem automaticamente a mudanças
- Quando o estado muda no ViewModel, todas as Views inscritas via `ref.watch()` são reconstruídas
- Exemplo: `ProjectsViewModel` notifica `ProjectsListScreen` e `DashboardScreen` simultaneamente quando a lista de projetos é atualizada

Isso garante desacoplamento entre a lógica de negócio e a interface, com propagação automática de mudanças.

## Integração com API

O app consome a API REST do backend Meraki (NestJS) via **Dio** (HTTP client):

### Endpoints consumidos

| Feature | Endpoints |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/register` |
| Projetos | `GET /projects`, `GET /projects/:id`, `POST /projects`, `POST /projects/:id/milestones` |
| Propostas | `GET /bids/my`, `GET /bids/project/:id`, `POST /bids`, `PATCH /bids/:id/accept`, `PATCH /bids/:id/reject` |
| Entregas | `GET /deliveries/kanban/:projectId`, `POST /deliveries`, `PATCH /deliveries/:id/approve`, `PATCH /deliveries/:id/reject` |
| Pagamentos | `GET /payments/specialist`, `GET /payments/company` |
| Portfolio | `GET /portfolio/me`, `PATCH /portfolio/me`, `GET /portfolio/:id` |
| Skills | `GET /skills`, `POST /skills`, `POST /skills/:id/questions`, `GET /skills/:id/questions/random`, `POST /skills/:id/attempt/profile` |

### Tratamento de estados

- **Carregamento**: `CircularProgressIndicator` enquanto a requisição está em andamento
- **Sucesso**: dados exibidos na interface com `AsyncValue.data`
- **Erro**: mensagem de erro com botão "Tentar novamente" (`AsyncValue.error`), incluindo fallback para cache local quando disponível

## Armazenamento local — Hive

O app utiliza **Hive** (banco NoSQL leve para Flutter) para persistência local:

| Dado persistido | Box Hive | Motivo |
|---|---|---|
| Token JWT | `auth` | Manter sessão ativa ao reabrir o app (evita login repetido) |
| Dados do usuário | `auth` | Exibir nome/role sem requisição extra à API |
| Cache de projetos | `projects` | Permitir visualização offline dos projetos já carregados |
| Cache genérico | `cache` | Armazenamento auxiliar para dados temporários |

### Fluxo de persistência

1. Ao fazer login, o token JWT e dados do usuário são salvos no Hive
2. Ao carregar projetos da API, a lista é persistida localmente
3. Se a API estiver indisponível, o app exibe os projetos do cache local
4. Ao reabrir o app, o token é recuperado do Hive para restaurar a sessão automaticamente

## Tecnologias

| Componente | Tecnologia |
|---|---|
| Framework | Flutter 3.x / Dart |
| HTTP Client | Dio |
| Estado | Riverpod (flutter_riverpod) |
| Storage local | Hive (hive_flutter) |
| Roteamento | GoRouter |
| Fontes | Google Fonts (Source Code Pro) |
