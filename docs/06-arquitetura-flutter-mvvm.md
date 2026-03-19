# MERAKI - Arquitetura Flutter MVVM

## 1. Visão Geral da Arquitetura MVVM

O aplicativo mobile do MERAKI é construído em Flutter seguindo a arquitetura **MVVM (Model-View-ViewModel)** com **Repository Pattern**. Essa separação de responsabilidades garante testabilidade, manutenibilidade e escalabilidade do código.

```
┌──────────────────────────────────────────────────────────────────────┐
│                           FLUTTER APP                                │
│                                                                      │
│   ┌──────────────┐   ref.watch   ┌───────────────┐   calls          │
│   │     VIEW     │◀─────────────▶│   VIEWMODEL   │─────────────┐   │
│   │              │   ref.read    │               │             │   │
│   │  Screens     │──────────────▶│  StateNotifier│             │   │
│   │  Widgets     │               │  AsyncNotifier│             ▼   │
│   └──────────────┘               └───────────────┘   ┌─────────────┐│
│                                                       │ REPOSITORY  ││
│                                                       │             ││
│                                                       │  Interface  ││
│                                                       │    +        ││
│                                                       │  Impl.      ││
│                                                       └──────┬──────┘│
└──────────────────────────────────────────────────────────────┼───────┘
                                                               │
                          ┌────────────────────────────────────┼──────────────────┐
                          │              DATA SOURCES           │                  │
                          │                                     ▼                  │
                          │   ┌──────────────────────┐   ┌─────────────────────┐  │
                          │   │    REMOTE (Dio)       │   │   LOCAL (Hive)      │  │
                          │   │                       │   │                     │  │
                          │   │  ApiClient            │   │  StorageService     │  │
                          │   │  Interceptors JWT     │   │  Cache / Offline    │  │
                          │   │  :3000/api            │   │                     │  │
                          │   └──────────┬────────────┘   └─────────────────────┘  │
                          └─────────────┼─────────────────────────────────────────┘
                                        │
               ┌────────────────────────▼───────────────────────────────┐
               │                MICROSERVIÇOS (NestJS)                  │
               │  user-service   project-service   bidding-service      │
               │  delivery-service   payment-service   portfolio-service│
               └────────────────────────────────────────────────────────┘
```

**Fluxo de dados:**

1. A **View** observa o estado exposto pelo **ViewModel** via `ref.watch` (Riverpod)
2. O usuário interage com a **View**, que dispara ações via `ref.read(...notifier).metodo()`
3. O **ViewModel** aciona o **Repository** para buscar ou persistir dados
4. O **Repository** consulta a **API** remota (via Dio) ou o **Hive** (cache local)
5. O **ViewModel** atualiza o estado — a **View** re-renderiza automaticamente

---

## 2. Estrutura de Diretórios

```
lib/
├── core/
│   ├── api/
│   │   ├── api_client.dart              ← instância global do Dio
│   │   └── interceptors/
│   │       ├── auth_interceptor.dart    ← injeta Bearer token em cada request
│   │       └── log_interceptor.dart     ← log de requests/responses (dev)
│   ├── services/
│   │   ├── auth_service.dart            ← persiste/recupera token JWT
│   │   └── storage_service.dart         ← abstração sobre Hive (leitura/escrita)
│   └── storage/
│       └── hive_storage.dart            ← inicialização e abertura de boxes Hive
├── features/
│   ├── auth/
│   │   ├── view/
│   │   │   ├── login_screen.dart
│   │   │   └── register_screen.dart
│   │   ├── viewmodel/
│   │   │   └── auth_viewmodel.dart      ← StateNotifier<AuthState>
│   │   ├── repository/
│   │   │   ├── auth_repository.dart     ← interface abstrata
│   │   │   └── auth_repository_impl.dart
│   │   └── model/
│   │       └── user_model.dart          ← @freezed
│   ├── projects/
│   │   ├── view/
│   │   │   ├── projects_list_screen.dart
│   │   │   └── project_detail_screen.dart
│   │   ├── viewmodel/
│   │   │   └── projects_viewmodel.dart  ← AsyncNotifier<List<ProjectModel>>
│   │   ├── repository/
│   │   │   ├── project_repository.dart
│   │   │   └── project_repository_impl.dart
│   │   └── model/
│   │       └── project_model.dart
│   ├── bidding/
│   │   ├── view/
│   │   │   ├── submit_bid_screen.dart
│   │   │   └── bids_list_screen.dart
│   │   ├── viewmodel/
│   │   │   └── bid_viewmodel.dart
│   │   ├── repository/
│   │   │   ├── bid_repository.dart
│   │   │   └── bid_repository_impl.dart
│   │   └── model/
│   │       └── bid_model.dart
│   ├── delivery/
│   │   ├── view/
│   │   │   └── delivery_screen.dart
│   │   ├── viewmodel/
│   │   │   └── delivery_viewmodel.dart
│   │   └── model/
│   │       └── milestone_model.dart
│   ├── payments/
│   │   ├── view/
│   │   │   └── payments_screen.dart
│   │   ├── viewmodel/
│   │   │   └── payment_viewmodel.dart
│   │   └── model/
│   │       └── payment_model.dart
│   └── portfolio/
│       ├── view/
│       │   ├── specialist_portfolio_screen.dart
│       │   └── company_profile_screen.dart
│       ├── viewmodel/
│       │   └── portfolio_viewmodel.dart
│       ├── repository/
│       │   ├── portfolio_repository.dart
│       │   └── portfolio_repository_impl.dart
│       └── model/
│           └── portfolio_model.dart
└── main.dart
```

---

## 3. Camadas MVVM Detalhadas

### 3.1 View Layer — Widgets Flutter

Responsabilidade exclusiva: **renderizar a interface e capturar interações do usuário**. Nenhuma lógica de negócio deve residir nesta camada.

- Screens: páginas completas (`LoginScreen`, `ProjectsListScreen`, `SubmitBidScreen`)
- Widgets: componentes reutilizáveis (`ProjectCard`, `BidTile`, `LoadingIndicator`)
- Toda View estende `ConsumerWidget` ou `ConsumerStatefulWidget` para acesso ao Riverpod
- Observa estado via `ref.watch` — dispara ações via `ref.read(...notifier)`

**Regras:**
- Sem chamadas HTTP diretas
- Sem acesso direto ao Hive
- Sem lógica condicional de negócio complexa
- Toda tomada de decisão fica no ViewModel

```dart
// lib/features/projects/view/projects_list_screen.dart
class ProjectsListScreen extends ConsumerWidget {
  const ProjectsListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // ref.watch: se-inscreve no estado — rebuild automático ao mudar
    final state = ref.watch(projectsViewModelProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Projetos MERAKI')),
      body: state.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Erro ao carregar projetos: $e'),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () =>
                    ref.read(projectsViewModelProvider.notifier).fetchProjects(),
                child: const Text('Tentar novamente'),
              ),
            ],
          ),
        ),
        data: (projects) => ListView.builder(
          itemCount: projects.length,
          itemBuilder: (_, i) => ProjectCard(project: projects[i]),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        // ref.read: dispara ação sem se inscrever no estado
        onPressed: () =>
            ref.read(projectsViewModelProvider.notifier).fetchProjects(),
        child: const Icon(Icons.refresh),
      ),
    );
  }
}
```

---

### 3.2 ViewModel Layer — StateNotifier com Riverpod

Responsabilidade: **gerenciar o estado da feature e orquestrar a lógica de negócio**.

- Implementados como `StateNotifier<T>` (estado síncrono) ou `AsyncNotifier<T>` (estado assíncrono)
- Expõem estado imutável para a View
- Recebem ações da View e delegam ao Repository
- Tratam erros e estados de carregamento

**Regras:**
- Sem código de UI (sem widgets, sem uso de `BuildContext` para lógica)
- Depende do Repository via injeção de dependência (Riverpod Provider)
- Expõe métodos de comando: `login()`, `fetchProjects()`, `submitBid()`

```dart
// lib/features/projects/viewmodel/projects_viewmodel.dart

// AsyncNotifier para estado assíncrono (lista de projetos da API)
class ProjectsViewModel extends AsyncNotifier<List<ProjectModel>> {
  @override
  Future<List<ProjectModel>> build() async {
    // Chamado automaticamente ao criar o provider
    return _fetchProjects();
  }

  Future<void> fetchProjects() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => _fetchProjects());
  }

  Future<void> createProject(CreateProjectDto dto) async {
    state = const AsyncLoading();
    try {
      final repo = ref.read(projectRepositoryProvider);
      await repo.createProject(dto);
      // Recarrega a lista após criação
      state = await AsyncValue.guard(() => _fetchProjects());
    } catch (e, st) {
      state = AsyncError(e, st);
    }
  }

  Future<List<ProjectModel>> _fetchProjects() {
    return ref.read(projectRepositoryProvider).getProjects();
  }
}

final projectsViewModelProvider =
    AsyncNotifierProvider<ProjectsViewModel, List<ProjectModel>>(
  ProjectsViewModel.new,
);
```

---

### 3.3 Repository Layer — Interface + Implementação

O Repository abstrai a fonte de dados. A interface define o contrato; a implementação decide de onde vêm os dados (API ou cache).

**Interface:**
```dart
// lib/features/projects/repository/project_repository.dart
abstract class ProjectRepository {
  Future<List<ProjectModel>> getProjects();
  Future<ProjectModel> getProjectById(String id);
  Future<ProjectModel> createProject(CreateProjectDto dto);
  Future<void> deleteProject(String id);
}
```

**Implementação (estratégia cache-first):**
```dart
// lib/features/projects/repository/project_repository_impl.dart
class ProjectRepositoryImpl implements ProjectRepository {
  final ApiClient _apiClient;
  final StorageService _storage;

  ProjectRepositoryImpl({
    required ApiClient apiClient,
    required StorageService storage,
  })  : _apiClient = apiClient,
        _storage = storage;

  @override
  Future<List<ProjectModel>> getProjects() async {
    try {
      final response = await _apiClient.dio.get('/projects');
      final projects = (response.data as List)
          .map((json) => ProjectModel.fromJson(json as Map<String, dynamic>))
          .toList();
      // Persiste no cache local para uso offline
      await _storage.saveProjects(projects);
      return projects;
    } on DioException {
      // Fallback: retorna dados do cache Hive
      return _storage.getProjects();
    }
  }

  @override
  Future<ProjectModel> getProjectById(String id) async {
    final response = await _apiClient.dio.get('/projects/$id');
    return ProjectModel.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<ProjectModel> createProject(CreateProjectDto dto) async {
    final response = await _apiClient.dio.post('/projects', data: dto.toJson());
    return ProjectModel.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<void> deleteProject(String id) async {
    await _apiClient.dio.delete('/projects/$id');
  }
}
```

---

### 3.4 Data Sources

**Remote — Dio (ApiClient):**

```dart
// lib/core/api/api_client.dart
class ApiClient {
  late final Dio dio;

  ApiClient({required String baseUrl, required AuthService authService}) {
    dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 15),
      headers: {'Content-Type': 'application/json'},
    ));
    dio.interceptors.addAll([
      AuthInterceptor(authService: authService),
      LogInterceptor(requestBody: true, responseBody: true),
    ]);
  }
}
```

**Local — Hive (StorageService):**

```dart
// lib/core/services/storage_service.dart
class StorageService {
  static const _projectsBoxKey = 'projects';

  Box<Map> get _projectsBox => Hive.box<Map>(_projectsBoxKey);

  Future<void> saveProjects(List<ProjectModel> projects) async {
    final map = {for (final p in projects) p.id: p.toJson()};
    await _projectsBox.putAll(map);
  }

  List<ProjectModel> getProjects() {
    return _projectsBox.values
        .map((json) => ProjectModel.fromJson(Map<String, dynamic>.from(json)))
        .toList();
  }
}
```

---

## 4. Gerenciamento de Estado com Riverpod

### 4.1 Tipos de Providers Utilizados

| Provider | Uso no MERAKI |
|---|---|
| `Provider` | Dependências imutáveis: `ApiClient`, repositories, `StorageService` |
| `StateNotifierProvider` | Estado síncrono com lógica: formulários de login, filtros |
| `AsyncNotifierProvider` | Estado assíncrono: listas de projetos, propostas, portfólio |
| `FutureProvider` | Leitura única sem ações: perfil público de especialista |

### 4.2 AsyncValue — Tratamento de Estados

O `AsyncValue<T>` encapsula os três estados possíveis de uma operação assíncrona:

```dart
// Na View — método .when() mapeia cada estado para um Widget
final state = ref.watch(projectsViewModelProvider);

state.when(
  loading: () => const CircularProgressIndicator(),
  error: (error, stackTrace) => ErrorWidget(message: error.toString()),
  data: (projects) => ProjectListWidget(projects: projects),
);

// Alternativa com .maybeWhen() para tratar apenas estados específicos
state.maybeWhen(
  data: (projects) => Text('${projects.length} projetos encontrados'),
  orElse: () => const SizedBox.shrink(),
);
```

### 4.3 StateNotifier para Estado Síncrono (Formulários)

```dart
// lib/features/auth/viewmodel/auth_viewmodel.dart

// Estado imutável da feature de autenticação
class AuthState {
  final bool isLoading;
  final String? errorMessage;
  final UserModel? user;
  final bool isAuthenticated;

  const AuthState({
    this.isLoading = false,
    this.errorMessage,
    this.user,
    this.isAuthenticated = false,
  });

  AuthState copyWith({
    bool? isLoading,
    String? errorMessage,
    UserModel? user,
    bool? isAuthenticated,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,          // null limpa o erro anterior
      user: user ?? this.user,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
    );
  }
}

// ViewModel usa StateNotifier para atualizar estado de forma imutável
class AuthViewModel extends StateNotifier<AuthState> {
  final AuthRepository _repository;

  AuthViewModel(this._repository) : super(const AuthState());

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final user = await _repository.login(email, password);
      state = state.copyWith(
        isLoading: false,
        user: user,
        isAuthenticated: true,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Credenciais inválidas. Tente novamente.',
      );
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    state = const AuthState();
  }
}

// Provider do ViewModel — recebe o Repository via injeção de dependência
final authViewModelProvider =
    StateNotifierProvider<AuthViewModel, AuthState>((ref) {
  return AuthViewModel(ref.read(authRepositoryProvider));
});
```

---

## 5. Injeção de Dependência com Riverpod Providers

O Riverpod serve como o contêiner de DI do projeto. Cada camada declara seus próprios providers, formando uma cadeia de dependências:

```dart
// lib/core/providers.dart

// ─── Camada 1: Core ─────────────────────────────────────────────────
final authServiceProvider = Provider<AuthService>(
  (ref) => AuthService(),
);

final storageServiceProvider = Provider<StorageService>(
  (ref) => StorageService(),
);

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(
    baseUrl: 'http://localhost:3000/api',
    authService: ref.read(authServiceProvider),
  );
});

// ─── Camada 2: Repositories ─────────────────────────────────────────
final projectRepositoryProvider = Provider<ProjectRepository>((ref) {
  return ProjectRepositoryImpl(
    apiClient: ref.read(apiClientProvider),
    storage: ref.read(storageServiceProvider),
  );
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(
    apiClient: ref.read(apiClientProvider),
    authService: ref.read(authServiceProvider),
  );
});

final bidRepositoryProvider = Provider<BidRepository>((ref) {
  return BidRepositoryImpl(
    apiClient: ref.read(apiClientProvider),
  );
});

// ─── Camada 3: ViewModels ────────────────────────────────────────────
// Declarados em cada feature (auth_viewmodel.dart, projects_viewmodel.dart, etc.)
// Recebem repositories via ref.read(xRepositoryProvider)
```

---

## 6. Exemplo Completo — Bounded Context de Projetos

### 6.1 Model (com Freezed)

```dart
// lib/features/projects/model/project_model.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'project_model.freezed.dart';
part 'project_model.g.dart';

enum ProjectStatus { open, inProgress, completed, cancelled }

@freezed
class ProjectModel with _$ProjectModel {
  const factory ProjectModel({
    required String id,
    required String title,
    required String description,
    required List<String> requirements,
    required double budget,
    required String deadline,
    required ProjectStatus status,
    required String companyId,
    String? specialistId,
    String? bidId,
    required DateTime createdAt,
  }) = _ProjectModel;

  factory ProjectModel.fromJson(Map<String, dynamic> json) =>
      _$ProjectModelFromJson(json);
}
```

### 6.2 Repository

```dart
// lib/features/projects/repository/project_repository.dart
abstract class ProjectRepository {
  Future<List<ProjectModel>> getProjects({String? status});
  Future<ProjectModel> getProjectById(String id);
  Future<ProjectModel> createProject(CreateProjectDto dto);
  Future<void> assignSpecialist(String projectId, String bidId);
}
```

### 6.3 ViewModel

```dart
// lib/features/projects/viewmodel/projects_viewmodel.dart
class ProjectsViewModel extends AsyncNotifier<List<ProjectModel>> {
  String? _statusFilter;

  @override
  Future<List<ProjectModel>> build() => _load();

  Future<void> fetchProjects({String? status}) async {
    _statusFilter = status;
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => _load());
  }

  Future<void> createProject(CreateProjectDto dto) async {
    state = const AsyncLoading();
    try {
      await ref.read(projectRepositoryProvider).createProject(dto);
      state = await AsyncValue.guard(() => _load());
    } catch (e, st) {
      state = AsyncError(e, st);
    }
  }

  Future<List<ProjectModel>> _load() =>
      ref.read(projectRepositoryProvider).getProjects(status: _statusFilter);
}

final projectsViewModelProvider =
    AsyncNotifierProvider<ProjectsViewModel, List<ProjectModel>>(
  ProjectsViewModel.new,
);
```

### 6.4 View

```dart
// lib/features/projects/view/projects_list_screen.dart
class ProjectsListScreen extends ConsumerWidget {
  const ProjectsListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(projectsViewModelProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Projetos'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () => _showFilterSheet(context, ref),
          ),
        ],
      ),
      body: _buildBody(state, ref),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/projects/new'),
        icon: const Icon(Icons.add),
        label: const Text('Novo Projeto'),
      ),
    );
  }

  Widget _buildBody(AsyncValue<List<ProjectModel>> state, WidgetRef ref) {
    return state.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => _ErrorView(
        message: e.toString(),
        onRetry: () =>
            ref.read(projectsViewModelProvider.notifier).fetchProjects(),
      ),
      data: (projects) => projects.isEmpty
          ? const _EmptyView()
          : RefreshIndicator(
              onRefresh: () =>
                  ref.read(projectsViewModelProvider.notifier).fetchProjects(),
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: projects.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (_, i) => ProjectCard(project: projects[i]),
              ),
            ),
    );
  }

  void _showFilterSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      builder: (_) => _FilterSheet(
        onFilter: (status) =>
            ref.read(projectsViewModelProvider.notifier).fetchProjects(
              status: status,
            ),
      ),
    );
  }
}

// Widget auxiliar para estado de erro
class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 16),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Tentar novamente'),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 7. Tratamento de Estados com AsyncValue

O `AsyncValue` garante que todos os estados possíveis sejam tratados explicitamente:

```dart
// Padrão completo com .when() — obrigatório tratar loading, error e data
Widget _buildContent(AsyncValue<List<ProjectModel>> state) {
  return state.when(
    // Estado de carregamento
    loading: () => const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(),
          SizedBox(height: 16),
          Text('Carregando projetos...'),
        ],
      ),
    ),

    // Estado de erro — exibe mensagem e opção de retry
    error: (error, stackTrace) => Center(
      child: Text(
        'Erro: ${error.toString()}',
        style: const TextStyle(color: Colors.red),
      ),
    ),

    // Estado com dados — renderiza a lista
    data: (projects) => ListView.builder(
      itemCount: projects.length,
      itemBuilder: (context, index) => ProjectCard(project: projects[index]),
    ),
  );
}

// Padrão com .whenData() — útil para transformar apenas o dado
final projectCount = state.whenData((projects) => projects.length);
// projectCount é AsyncValue<int>

// Padrão com .valueOrNull — acessa dado sem lançar exceção
final projects = state.valueOrNull ?? [];

// Verificações de estado individuais
if (state.isLoading) showProgressDialog();
if (state.hasError) showErrorSnackBar(state.error.toString());
if (state.hasValue) renderProjects(state.value!);
```

---

## 8. Próximos Passos

1. **Configurar o projeto Flutter** — adicionar dependências no `pubspec.yaml` (flutter_riverpod, dio, hive_flutter, go_router, freezed, json_annotation)
2. **Implementar o core layer** — `ApiClient` com interceptors JWT, `StorageService` com Hive
3. **Implementar a feature Auth** — login, registro, persistência do token no Hive
4. **Implementar a feature Projects** — listagem, detalhe, criação de projetos
5. **Implementar a feature Bidding** — submissão e listagem de propostas por projeto
6. **Implementar a feature Delivery** — atualização de milestones e acompanhamento
7. **Implementar a feature Portfolio** — perfil público do especialista (RF12) e da empresa (RF13)
8. **Implementar a feature Payments** — histórico e status de pagamentos
9. **Testes unitários** — ViewModels e Repositories com mock dos providers Riverpod
10. **Testes de integração** — fluxos críticos: login → buscar projetos → submeter proposta
