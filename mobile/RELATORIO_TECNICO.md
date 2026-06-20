# Relatorio Tecnico — Meraki Mobile

## 1. Introducao

### Problema abordado

No mercado de trabalho atual, empresas frequentemente precisam contratar especialistas (freelancers e consultores) para projetos pontuais, mas enfrentam dificuldades em encontrar profissionais qualificados, gerenciar entregas parciais (milestones) e garantir seguranca financeira para ambas as partes. A comunicacao entre contratante e contratado costuma ser fragmentada, sem rastreabilidade de progresso ou protecao de pagamento.

### Proposta da solucao

O **Meraki** e uma plataforma marketplace que conecta empresas a especialistas de forma estruturada. O aplicativo mobile permite que:

- **Empresas** publiquem projetos com milestones, avaliem propostas, acompanhem entregas via Kanban e gerenciem pagamentos com escrow
- **Especialistas** busquem projetos, submetam propostas, entreguem trabalhos e acompanhem seus ganhos

O app mobile replica todas as funcionalidades do frontend web (React), adaptado para a experiencia mobile com navegacao por abas e tema visual coeso.

---

## 2. Arquitetura MVVM

### Organizacao

O aplicativo segue rigorosamente o padrao **MVVM (Model-View-ViewModel)**, organizado por features:

```
lib/features/<feature>/
    model/       -> Model
    viewmodel/   -> ViewModel
    repository/  -> Camada de dados (API)
    view/        -> View
```

### Divisao de responsabilidades

**Model** — Classes de dados imutaveis que representam as entidades do dominio. Cada model possui `fromJson()` para desserializacao da API e `toJson()` para serializacao/cache local. Exemplos: `ProjectModel`, `PaymentModel`, `SkillModel`, `PortfolioModel`.

**ViewModel** — Classes que encapsulam a logica de negocio e o gerenciamento de estado. Implementadas como `AsyncNotifier` (Riverpod) para estados assincronos (carregamento/sucesso/erro) e `Notifier` para estados sincronos. Os ViewModels:
- Coordenam chamadas ao Repository
- Transformam dados para a View
- Gerenciam cache local (ex.: `ProjectsViewModel` salva projetos no Hive apos buscar da API)
- Nunca referenciam widgets ou `BuildContext`

**View** — Widgets Flutter (`ConsumerWidget` ou `ConsumerStatefulWidget`) que:
- Consomem o estado do ViewModel via `ref.watch()`
- Despacham acoes via `ref.read(provider.notifier)`
- Nao contem logica de negocio, apenas logica de apresentacao

**Repository** — Camada intermediaria entre ViewModel e API. Encapsula chamadas HTTP (Dio) e traduz respostas JSON em Models. Permite que o ViewModel nao conheca detalhes de rede.

### Exemplo concreto: fluxo de projetos

1. `ProjectsListScreen` (View) faz `ref.watch(projectsViewModelProvider)`
2. `ProjectsViewModel` (ViewModel) chama `ProjectRepository.listProjects()`
3. `ProjectRepository` faz `GET /projects` via `ApiClient` (Dio)
4. A resposta JSON e convertida em `List<ProjectModel>` (Model)
5. O ViewModel salva no Hive e emite o novo estado
6. A View e reconstruida automaticamente com os dados

---

## 3. Padrao de projeto adicional — Observer

### Padrao escolhido

**Observer** (tambem chamado de Publish-Subscribe ou Listener).

### Por que foi escolhido

O app possui multiplas telas que dependem dos mesmos dados. Por exemplo, a lista de projetos e consumida tanto pela `ProjectsListScreen` quanto pela `DashboardScreen`. Sem o padrao Observer, seria necessario propagar mudancas manualmente entre telas, gerando acoplamento e bugs de sincronizacao.

O Riverpod implementa o padrao Observer de forma nativa:
- **Subject (Observable)**: cada Provider/Notifier mantem um estado e notifica seus observadores quando este muda
- **Observer**: cada widget que usa `ref.watch()` se inscreve automaticamente e e reconstruido quando o estado muda
- **Desacoplamento**: o ViewModel nao conhece quais Views o observam; as Views nao conhecem os detalhes internos do ViewModel

### Onde foi aplicado

| Provider (Subject) | Observers (Views) |
|---|---|
| `projectsViewModelProvider` | `ProjectsListScreen`, `DashboardScreen` |
| `myBidsViewModelProvider` | `SubmitBidScreen`, `DashboardScreen` |
| `paymentsViewModelProvider` | `GanhosScreen`, `DashboardScreen` |
| `skillsCatalogProvider` | `GerenciarSkillsScreen`, `CreateProjectScreen`, `PortfolioScreen` |
| `authViewModelProvider` | `LoginScreen`, `MainShell`, `DashboardScreen` |

Quando o usuario cria um projeto no `CreateProjectScreen`, o `CreateProjectViewModel` chama `projectsViewModelProvider.notifier.refresh()`, que dispara a atualizacao automatica de todas as telas que observam esse provider — sem nenhum acoplamento direto entre as Views.

---

## 4. Integracao com API

### Endpoints e fluxo de consumo

O app se comunica com o backend Meraki (7 microsservicos NestJS) atraves de um API Gateway unico. A comunicacao e feita via HTTP REST usando a biblioteca **Dio**.

**Configuracao centralizada** (`ApiClient`):
- Base URL configuravel apontando para o API Gateway
- Interceptor de autenticacao que injeta o token JWT em todas as requisicoes
- Timeout configurado para evitar travamentos

**Fluxo tipico de consumo**:
1. A View dispara uma acao (ex.: pull-to-refresh, tap em botao)
2. O ViewModel chama o Repository correspondente
3. O Repository faz a requisicao HTTP via `ApiClient`
4. A resposta e desserializada em um Model
5. O ViewModel atualiza seu estado, que propaga para as Views

**Principais endpoints consumidos**:
- Autenticacao: `POST /auth/login`, `POST /auth/register`
- Projetos: `GET /projects`, `POST /projects`, `GET /projects/:id`
- Propostas: `GET /bids/my`, `POST /bids`, `PATCH /bids/:id/accept`
- Entregas: `GET /deliveries/kanban/:projectId`, `POST /deliveries`
- Pagamentos: `GET /payments/specialist`, `GET /payments/company`
- Portfolio: `GET /portfolio/me`, `PATCH /portfolio/me`
- Skills: `GET /skills`, `POST /skills`, `POST /skills/:id/attempt/profile`

### Tratamento de erros e estados

Cada chamada assincrona e encapsulada em `AsyncValue` (Riverpod), que possui tres estados:

- **`AsyncLoading`**: exibe `CircularProgressIndicator` centralizado
- **`AsyncData`**: renderiza os dados na interface
- **`AsyncError`**: exibe mensagem de erro com icone e botao "Tentar novamente" que invalida o provider e refaz a requisicao

Erros especificos tratados:
- **Timeout/sem conexao**: fallback para cache local (projetos) ou mensagem orientando o usuario
- **401 Unauthorized**: redireciona para tela de login
- **Validacao (400)**: exibe mensagem do backend (ex.: "Voce ja enviou uma proposta para este projeto")

---

## 5. Persistencia local

### Tecnologia adotada

**Hive** — banco de dados NoSQL leve, otimizado para Flutter. Escolhido por:
- Nao requer configuracao de schema (flexivel para JSON)
- Performance superior ao SharedPreferences para dados estruturados
- Suporte nativo a Flutter sem dependencias nativas pesadas
- API simples baseada em boxes (caixas) de chave-valor

### Quais dados sao persistidos e por que

| Dado | Box | Justificativa |
|---|---|---|
| **Token JWT** | `auth` | Permite que o usuario permaneca logado ao fechar e reabrir o app, evitando login repetitivo. O token e recuperado automaticamente na inicializacao e injetado nas requisicoes via interceptor |
| **Dados do usuario** (nome, email, role) | `auth` | Permite exibir informacoes do usuario na interface (dashboard, menu) sem fazer requisicao extra a API. Tambem determina se o usuario e empresa ou especialista para renderizar a View correta |
| **Cache de projetos** | `projects` | Permite visualizacao offline dos projetos ja carregados. Quando a API esta indisponivel, o `ProjectsViewModel` retorna os dados do cache em vez de exibir erro. Melhora a experiencia em conexoes instaveis |

### Fluxo de persistencia

```
Login bem-sucedido
    -> StorageService.saveToken(jwt)
    -> StorageService.saveUser(userData)
    -> App navega para Dashboard

Carregamento de projetos
    -> API responde com sucesso
        -> StorageService.saveProjects(projects)  // cache atualizado
        -> View exibe dados da API
    -> API falha (timeout, sem rede)
        -> StorageService.getProjects()           // fallback offline
        -> View exibe dados do cache

Reabertura do app
    -> StorageService.getToken()
        -> Token existe: sessao restaurada, navega para Dashboard
        -> Token nulo: navega para Login

Logout
    -> StorageService.clearAll()                  // limpa token, user e cache
```

---

## 6. Conclusao

### Principais decisoes

1. **MVVM com Riverpod**: a combinacao de MVVM com Riverpod proporciona separacao clara de responsabilidades e reatividade automatica. O uso de `AsyncNotifier` simplifica o gerenciamento de estados assincronos (loading/data/error) sem boilerplate excessivo.

2. **Observer via Riverpod**: o padrao Observer elimina a necessidade de propagacao manual de estado entre telas. Multiplas Views podem reagir ao mesmo ViewModel sem acoplamento, o que e essencial em um app com dashboards que agregam dados de varios dominos.

3. **Repository como camada de abstracao**: isolar a comunicacao HTTP em Repositories permite que ViewModels nao conhecam detalhes de rede (URLs, headers, parsing). Isso facilita manutencao e possibilita adicionar cache transparentemente.

4. **Hive para persistencia local**: a escolha do Hive sobre SharedPreferences ou SQLite se justifica pelo tipo de dado (JSON flexivel, nao relacional) e pela necessidade de performance em leitura rapida na inicializacao do app.

5. **Tema visual coeso (terminal/hacker)**: todas as telas seguem o mesmo design system com fundo escuro (`slate900`), fonte monospacada (Source Code Pro) e paleta consistente, criando identidade visual unica.

### Limitacoes e melhorias futuras

- **Cache offline limitado**: apenas projetos sao cacheados localmente. Uma evolucao seria cachear tambem propostas, entregas e pagamentos para uso offline completo
- **Sem sincronizacao automatica**: o cache nao detecta conflitos entre dados locais e remotos. Uma melhoria seria implementar timestamps de sincronizacao
- **Sem push notifications**: o app depende de polling manual (pull-to-refresh). Integrar Firebase Cloud Messaging permitiria notificacoes em tempo real
- **Testes**: o app nao possui testes unitarios ou de integracao. Adicionar testes para ViewModels e Repositories aumentaria a confiabilidade
- **Persistencia de imagens**: o portfolio e perfil de empresa nao suportam upload de fotos. Integrar com um servico de storage (S3/Firebase Storage) seria uma melhoria significativa
