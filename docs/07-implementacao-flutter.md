# MERAKI - Implementação Flutter

## 1. Configuração do Projeto

### 1.1 pubspec.yaml

```yaml
name: meraki
description: Plataforma de conexão empresa-especialista

environment:
  sdk: '>=3.0.0 <4.0.0'
  flutter: '>=3.10.0'

dependencies:
  flutter:
    sdk: flutter

  # State Management
  flutter_riverpod: ^2.4.0
  riverpod_annotation: ^2.3.0

  # HTTP Client
  dio: ^5.4.0

  # Local Storage
  hive: ^2.2.3
  hive_flutter: ^1.1.0

  # Navigation
  go_router: ^12.0.0

  # Code generation (models)
  freezed_annotation: ^2.4.1
  json_annotation: ^4.8.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  build_runner: ^2.4.7
  freezed: ^2.4.6
  json_serializable: ^6.7.1
  hive_generator: ^2.0.1
  riverpod_generator: ^2.3.9
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
```

### 1.2 Inicialização (main.dart)

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:meraki/core/storage/hive_storage.dart';
import 'package:meraki/app_router.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Inicializar Hive
  await HiveStorage.initialize();

  runApp(
    // ProviderScope habilita Riverpod em todo o app
    const ProviderScope(
      child: MerakiApp(),
    ),
  );
}

class MerakiApp extends StatelessWidget {
  const MerakiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Meraki',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      routerConfig: appRouter,
    );
  }
}
```

---

## 2. Core Layer

### 2.1 ApiClient com Dio

```dart
// lib/core/api/api_client.dart
import 'package:dio/dio.dart';
import 'package:meraki/core/api/interceptors/auth_interceptor.dart';
import 'package:meraki/core/api/interceptors/log_interceptor.dart';

class ApiClient {
  late final Dio _dio;

  static const String _baseUrl = 'http://localhost:3000/api';

  ApiClient({StorageService? storageService}) {
    _dio = Dio(
      BaseOptions(
        baseUrl: _baseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Interceptors
    _dio.interceptors.add(AuthInterceptor(storageService: storageService));
    _dio.interceptors.add(AppLogInterceptor());
  }

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    return _dio.get<T>(path, queryParameters: queryParameters);
  }

  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
  }) async {
    return _dio.post<T>(path, data: data);
  }

  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
  }) async {
    return _dio.put<T>(path, data: data);
  }

  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
  }) async {
    return _dio.patch<T>(path, data: data);
  }

  Future<Response<T>> delete<T>(String path) async {
    return _dio.delete<T>(path);
  }
}
```

### 2.2 Auth Interceptor (JWT)

```dart
// lib/core/api/interceptors/auth_interceptor.dart
import 'package:dio/dio.dart';
import 'package:meraki/core/services/storage_service.dart';

class AuthInterceptor extends Interceptor {
  final StorageService? storageService;

  AuthInterceptor({this.storageService});

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await storageService?.getToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Token expirado — limpar storage e redirecionar para login
      await storageService?.clearToken();
    }
    handler.next(err);
  }
}
```

### 2.3 AuthService

```dart
// lib/core/services/auth_service.dart
import 'package:meraki/core/services/storage_service.dart';

class AuthService {
  final StorageService _storage;

  AuthService(this._storage);

  Future<bool> isAuthenticated() async {
    final token = await _storage.getToken();
    return token != null && token.isNotEmpty;
  }

  Future<void> logout() async {
    await _storage.clearAll();
  }
}
```

---

## 3. Feature: Auth

### 3.1 UserModel (Dart)

```dart
// lib/features/auth/model/user_model.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

@freezed
class UserModel with _$UserModel {
  const factory UserModel({
    required String id,
    required String name,
    required String email,
    required String role, // 'company' | 'specialist'
    String? avatarUrl,
    String? bio,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);
}
```

### 3.2 AuthRepository com Dio

```dart
// lib/features/auth/repository/auth_repository.dart
import 'package:meraki/core/api/api_client.dart';
import 'package:meraki/core/services/storage_service.dart';
import 'package:meraki/features/auth/model/user_model.dart';

class AuthRepository {
  final ApiClient _apiClient;
  final StorageService _storage;

  AuthRepository({
    required ApiClient apiClient,
    required StorageService storage,
  })  : _apiClient = apiClient,
        _storage = storage;

  Future<UserModel> login(String email, String password) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      '/auth/login',
      data: {'email': email, 'password': password},
    );

    final data = response.data!;
    final token = data['access_token'] as String;
    final userJson = data['user'] as Map<String, dynamic>;
    final user = UserModel.fromJson(userJson);

    // Persistir token e dados do usuário localmente
    await _storage.setToken(token);
    await _storage.setUser(user);

    return user;
  }

  Future<UserModel> register({
    required String name,
    required String email,
    required String password,
    required String role,
  }) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      '/auth/register',
      data: {
        'name': name,
        'email': email,
        'password': password,
        'role': role,
      },
    );

    final data = response.data!;
    final token = data['access_token'] as String;
    final user = UserModel.fromJson(data['user'] as Map<String, dynamic>);

    await _storage.setToken(token);
    await _storage.setUser(user);

    return user;
  }

  Future<void> logout() async {
    await _storage.clearAll();
  }
}
```

### 3.3 AuthViewModel com Riverpod StateNotifier

```dart
// lib/features/auth/viewmodel/auth_viewmodel.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:meraki/core/api/api_client.dart';
import 'package:meraki/core/services/storage_service.dart';
import 'package:meraki/features/auth/model/user_model.dart';
import 'package:meraki/features/auth/repository/auth_repository.dart';

// Providers
final apiClientProvider = Provider<ApiClient>((ref) {
  final storage = ref.read(storageServiceProvider);
  return ApiClient(storageService: storage);
});

final storageServiceProvider = Provider<StorageService>(
  (ref) => StorageService(),
);

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    apiClient: ref.read(apiClientProvider),
    storage: ref.read(storageServiceProvider),
  );
});

// State
class AuthState {
  final bool isLoading;
  final String? error;
  final UserModel? user;

  const AuthState({this.isLoading = false, this.error, this.user});

  bool get isAuthenticated => user != null;

  AuthState copyWith({bool? isLoading, String? error, UserModel? user}) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      user: user ?? this.user,
    );
  }
}

// ViewModel
class AuthViewModel extends StateNotifier<AuthState> {
  final AuthRepository _repository;

  AuthViewModel(this._repository) : super(const AuthState());

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true);
    try {
      final user = await _repository.login(email, password);
      state = state.copyWith(isLoading: false, user: user);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Credenciais inválidas. Tente novamente.',
      );
    }
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
    required String role,
  }) async {
    state = state.copyWith(isLoading: true);
    try {
      final user = await _repository.register(
        name: name,
        email: email,
        password: password,
        role: role,
      );
      state = state.copyWith(isLoading: false, user: user);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Erro ao criar conta. Tente novamente.',
      );
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    state = const AuthState();
  }
}

final authViewModelProvider =
    StateNotifierProvider<AuthViewModel, AuthState>((ref) {
  return AuthViewModel(ref.read(authRepositoryProvider));
});
```

### 3.4 LoginScreen Widget

```dart
// lib/features/auth/view/login_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:meraki/features/auth/viewmodel/auth_viewmodel.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _onLogin() async {
    if (!_formKey.currentState!.validate()) return;
    await ref.read(authViewModelProvider.notifier).login(
          _emailController.text.trim(),
          _passwordController.text,
        );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(authViewModelProvider);

    // Navegar para home ao autenticar
    ref.listen(authViewModelProvider, (_, next) {
      if (next.isAuthenticated) {
        context.go('/projects');
      }
    });

    return Scaffold(
      appBar: AppBar(title: const Text('Login — Meraki')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(labelText: 'E-mail'),
                keyboardType: TextInputType.emailAddress,
                validator: (v) =>
                    v == null || !v.contains('@') ? 'E-mail inválido' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _passwordController,
                decoration: const InputDecoration(labelText: 'Senha'),
                obscureText: true,
                validator: (v) =>
                    v == null || v.length < 6 ? 'Mínimo 6 caracteres' : null,
              ),
              const SizedBox(height: 24),
              if (state.error != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Text(
                    state.error!,
                    style: const TextStyle(color: Colors.red),
                  ),
                ),
              ElevatedButton(
                onPressed: state.isLoading ? null : _onLogin,
                child: state.isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Entrar'),
              ),
              TextButton(
                onPressed: () => context.go('/register'),
                child: const Text('Criar conta'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

## 4. Feature: Projects

### 4.1 ProjectModel

```dart
// lib/features/projects/model/project_model.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'project_model.freezed.dart';
part 'project_model.g.dart';

@freezed
class ProjectModel with _$ProjectModel {
  const factory ProjectModel({
    required String id,
    required String title,
    required String description,
    required String companyId,
    required String status,  // 'open' | 'in_progress' | 'completed'
    required double budget,
    required DateTime deadline,
    List<String>? requiredSkills,
    String? companyName,
    int? bidsCount,
  }) = _ProjectModel;

  factory ProjectModel.fromJson(Map<String, dynamic> json) =>
      _$ProjectModelFromJson(json);
}
```

### 4.2 ProjectRepository

```dart
// lib/features/projects/repository/project_repository.dart
import 'package:meraki/core/api/api_client.dart';
import 'package:meraki/core/services/storage_service.dart';
import 'package:meraki/features/projects/model/project_model.dart';

class ProjectRepository {
  final ApiClient _apiClient;
  final StorageService _storage;

  ProjectRepository({
    required ApiClient apiClient,
    required StorageService storage,
  })  : _apiClient = apiClient,
        _storage = storage;

  Future<List<ProjectModel>> getProjects({String? status}) async {
    try {
      final response = await _apiClient.get<List<dynamic>>(
        '/projects',
        queryParameters: status != null ? {'status': status} : null,
      );
      final projects = (response.data as List)
          .map((j) => ProjectModel.fromJson(j as Map<String, dynamic>))
          .toList();
      await _storage.saveProjects(projects);
      return projects;
    } catch (_) {
      return _storage.getProjects();
    }
  }

  Future<ProjectModel> getProjectById(String id) async {
    final response =
        await _apiClient.get<Map<String, dynamic>>('/projects/$id');
    return ProjectModel.fromJson(response.data!);
  }

  Future<ProjectModel> createProject({
    required String title,
    required String description,
    required double budget,
    required DateTime deadline,
    List<String>? requiredSkills,
  }) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      '/projects',
      data: {
        'title': title,
        'description': description,
        'budget': budget,
        'deadline': deadline.toIso8601String(),
        'requiredSkills': requiredSkills ?? [],
      },
    );
    return ProjectModel.fromJson(response.data!);
  }
}
```

### 4.3 ProjectsViewModel

```dart
// lib/features/projects/viewmodel/projects_viewmodel.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:meraki/features/auth/viewmodel/auth_viewmodel.dart';
import 'package:meraki/features/projects/model/project_model.dart';
import 'package:meraki/features/projects/repository/project_repository.dart';

final projectRepositoryProvider = Provider<ProjectRepository>((ref) {
  return ProjectRepository(
    apiClient: ref.read(apiClientProvider),
    storage: ref.read(storageServiceProvider),
  );
});

class ProjectsViewModel extends AsyncNotifier<List<ProjectModel>> {
  @override
  Future<List<ProjectModel>> build() async {
    return ref.read(projectRepositoryProvider).getProjects();
  }

  Future<void> fetchProjects({String? status}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(projectRepositoryProvider).getProjects(status: status),
    );
  }

  Future<void> createProject({
    required String title,
    required String description,
    required double budget,
    required DateTime deadline,
    List<String>? requiredSkills,
  }) async {
    await ref.read(projectRepositoryProvider).createProject(
          title: title,
          description: description,
          budget: budget,
          deadline: deadline,
          requiredSkills: requiredSkills,
        );
    // Recarregar lista após criação
    await fetchProjects();
  }
}

final projectsViewModelProvider =
    AsyncNotifierProvider<ProjectsViewModel, List<ProjectModel>>(
  ProjectsViewModel.new,
);
```

### 4.4 ProjectsListScreen

```dart
// lib/features/projects/view/projects_list_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:meraki/features/projects/viewmodel/projects_viewmodel.dart';

class ProjectsListScreen extends ConsumerWidget {
  const ProjectsListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(projectsViewModelProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Projetos')),
      body: state.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Erro: $e'),
              ElevatedButton(
                onPressed: () =>
                    ref.read(projectsViewModelProvider.notifier).fetchProjects(),
                child: const Text('Tentar novamente'),
              ),
            ],
          ),
        ),
        data: (projects) => RefreshIndicator(
          onRefresh: () =>
              ref.read(projectsViewModelProvider.notifier).fetchProjects(),
          child: ListView.builder(
            itemCount: projects.length,
            itemBuilder: (_, i) {
              final project = projects[i];
              return ListTile(
                title: Text(project.title),
                subtitle: Text('R\$ ${project.budget.toStringAsFixed(2)}'),
                trailing: Chip(label: Text(project.status)),
                onTap: () => context.go('/projects/${project.id}'),
              );
            },
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.go('/projects/new'),
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

### 4.5 ProjectDetailScreen

```dart
// lib/features/projects/view/project_detail_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

final projectDetailProvider =
    FutureProvider.family<ProjectModel, String>((ref, id) {
  return ref.read(projectRepositoryProvider).getProjectById(id);
});

class ProjectDetailScreen extends ConsumerWidget {
  final String projectId;

  const ProjectDetailScreen({super.key, required this.projectId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(projectDetailProvider(projectId));

    return Scaffold(
      appBar: AppBar(title: const Text('Detalhes do Projeto')),
      body: state.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erro: $e')),
        data: (project) => Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(project.title,
                  style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 8),
              Text(project.description),
              const SizedBox(height: 16),
              Text('Orçamento: R\$ ${project.budget.toStringAsFixed(2)}'),
              Text('Prazo: ${project.deadline.toLocal()}'),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => context.go('/projects/$projectId/bid'),
                child: const Text('Submeter Proposta'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

## 5. Feature: Bidding

### 5.1 BidModel

```dart
// lib/features/bidding/model/bid_model.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'bid_model.freezed.dart';
part 'bid_model.g.dart';

@freezed
class BidModel with _$BidModel {
  const factory BidModel({
    required String id,
    required String projectId,
    required String specialistId,
    required double proposedValue,
    required String coverLetter,
    required int estimatedDays,
    required String status, // 'pending' | 'accepted' | 'rejected'
    DateTime? createdAt,
    String? specialistName,
  }) = _BidModel;

  factory BidModel.fromJson(Map<String, dynamic> json) =>
      _$BidModelFromJson(json);
}
```

### 5.2 BidRepository

```dart
// lib/features/bidding/repository/bid_repository.dart
import 'package:meraki/core/api/api_client.dart';
import 'package:meraki/core/services/storage_service.dart';
import 'package:meraki/features/bidding/model/bid_model.dart';

class BidRepository {
  final ApiClient _apiClient;
  final StorageService _storage;

  BidRepository({required ApiClient apiClient, required StorageService storage})
      : _apiClient = apiClient,
        _storage = storage;

  Future<List<BidModel>> getBidsByProject(String projectId) async {
    try {
      final response = await _apiClient.get<List<dynamic>>(
        '/bidding/project/$projectId',
      );
      final bids = (response.data as List)
          .map((j) => BidModel.fromJson(j as Map<String, dynamic>))
          .toList();
      await _storage.saveBids(bids);
      return bids;
    } catch (_) {
      return _storage.getBids();
    }
  }

  Future<BidModel> submitBid({
    required String projectId,
    required double proposedValue,
    required String coverLetter,
    required int estimatedDays,
  }) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      '/bidding',
      data: {
        'projectId': projectId,
        'proposedValue': proposedValue,
        'coverLetter': coverLetter,
        'estimatedDays': estimatedDays,
      },
    );
    return BidModel.fromJson(response.data!);
  }
}
```

### 5.3 BidViewModel

```dart
// lib/features/bidding/viewmodel/bid_viewmodel.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:meraki/features/auth/viewmodel/auth_viewmodel.dart';
import 'package:meraki/features/bidding/model/bid_model.dart';
import 'package:meraki/features/bidding/repository/bid_repository.dart';

final bidRepositoryProvider = Provider<BidRepository>((ref) {
  return BidRepository(
    apiClient: ref.read(apiClientProvider),
    storage: ref.read(storageServiceProvider),
  );
});

class BidSubmitState {
  final bool isLoading;
  final String? error;
  final bool success;

  const BidSubmitState({
    this.isLoading = false,
    this.error,
    this.success = false,
  });

  BidSubmitState copyWith({bool? isLoading, String? error, bool? success}) {
    return BidSubmitState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      success: success ?? this.success,
    );
  }
}

class BidViewModel extends StateNotifier<BidSubmitState> {
  final BidRepository _repository;

  BidViewModel(this._repository) : super(const BidSubmitState());

  Future<void> submitBid({
    required String projectId,
    required double proposedValue,
    required String coverLetter,
    required int estimatedDays,
  }) async {
    state = state.copyWith(isLoading: true);
    try {
      await _repository.submitBid(
        projectId: projectId,
        proposedValue: proposedValue,
        coverLetter: coverLetter,
        estimatedDays: estimatedDays,
      );
      state = state.copyWith(isLoading: false, success: true);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Erro ao submeter proposta.',
      );
    }
  }
}

final bidViewModelProvider =
    StateNotifierProvider<BidViewModel, BidSubmitState>((ref) {
  return BidViewModel(ref.read(bidRepositoryProvider));
});
```

### 5.4 SubmitBidScreen

```dart
// lib/features/bidding/view/submit_bid_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:meraki/features/bidding/viewmodel/bid_viewmodel.dart';

class SubmitBidScreen extends ConsumerStatefulWidget {
  final String projectId;

  const SubmitBidScreen({super.key, required this.projectId});

  @override
  ConsumerState<SubmitBidScreen> createState() => _SubmitBidScreenState();
}

class _SubmitBidScreenState extends ConsumerState<SubmitBidScreen> {
  final _formKey = GlobalKey<FormState>();
  final _valueController = TextEditingController();
  final _letterController = TextEditingController();
  final _daysController = TextEditingController();

  @override
  void dispose() {
    _valueController.dispose();
    _letterController.dispose();
    _daysController.dispose();
    super.dispose();
  }

  Future<void> _onSubmit() async {
    if (!_formKey.currentState!.validate()) return;
    await ref.read(bidViewModelProvider.notifier).submitBid(
          projectId: widget.projectId,
          proposedValue: double.parse(_valueController.text),
          coverLetter: _letterController.text,
          estimatedDays: int.parse(_daysController.text),
        );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(bidViewModelProvider);

    ref.listen(bidViewModelProvider, (_, next) {
      if (next.success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Proposta enviada com sucesso!')),
        );
        context.pop();
      }
    });

    return Scaffold(
      appBar: AppBar(title: const Text('Submeter Proposta')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _valueController,
                decoration: const InputDecoration(labelText: 'Valor proposto (R\$)'),
                keyboardType: TextInputType.number,
                validator: (v) => v == null || v.isEmpty ? 'Informe o valor' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _daysController,
                decoration: const InputDecoration(labelText: 'Prazo estimado (dias)'),
                keyboardType: TextInputType.number,
                validator: (v) => v == null || v.isEmpty ? 'Informe o prazo' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _letterController,
                decoration: const InputDecoration(labelText: 'Carta de apresentação'),
                maxLines: 5,
                validator: (v) => v == null || v.isEmpty ? 'Escreva uma apresentação' : null,
              ),
              const SizedBox(height: 24),
              if (state.error != null)
                Text(state.error!, style: const TextStyle(color: Colors.red)),
              ElevatedButton(
                onPressed: state.isLoading ? null : _onSubmit,
                child: state.isLoading
                    ? const CircularProgressIndicator()
                    : const Text('Enviar Proposta'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

## 6. Feature: Portfolio

### 6.1 PortfolioModel

```dart
// lib/features/portfolio/model/portfolio_model.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'portfolio_model.freezed.dart';
part 'portfolio_model.g.dart';

@freezed
class PortfolioItemModel with _$PortfolioItemModel {
  const factory PortfolioItemModel({
    required String id,
    required String title,
    required String description,
    String? imageUrl,
    String? projectUrl,
    List<String>? technologies,
    DateTime? completedAt,
  }) = _PortfolioItemModel;

  factory PortfolioItemModel.fromJson(Map<String, dynamic> json) =>
      _$PortfolioItemModelFromJson(json);
}

@freezed
class SpecialistProfileModel with _$SpecialistProfileModel {
  const factory SpecialistProfileModel({
    required String id,
    required String name,
    required String email,
    String? bio,
    String? avatarUrl,
    List<String>? skills,
    double? averageRating,
    int? completedProjects,
    List<PortfolioItemModel>? portfolio,
  }) = _SpecialistProfileModel;

  factory SpecialistProfileModel.fromJson(Map<String, dynamic> json) =>
      _$SpecialistProfileModelFromJson(json);
}

@freezed
class CompanyProfileModel with _$CompanyProfileModel {
  const factory CompanyProfileModel({
    required String id,
    required String name,
    required String email,
    String? description,
    String? logoUrl,
    String? website,
    String? industry,
    int? activeProjects,
    double? averageRating,
  }) = _CompanyProfileModel;

  factory CompanyProfileModel.fromJson(Map<String, dynamic> json) =>
      _$CompanyProfileModelFromJson(json);
}
```

### 6.2 PortfolioRepository

```dart
// lib/features/portfolio/repository/portfolio_repository.dart
import 'package:meraki/core/api/api_client.dart';
import 'package:meraki/features/portfolio/model/portfolio_model.dart';

class PortfolioRepository {
  final ApiClient _apiClient;

  PortfolioRepository({required ApiClient apiClient})
      : _apiClient = apiClient;

  // RF12: Perfil público do especialista
  Future<SpecialistProfileModel> getSpecialistProfile(String specialistId) async {
    final response = await _apiClient.get<Map<String, dynamic>>(
      '/portfolio/specialist/$specialistId',
    );
    return SpecialistProfileModel.fromJson(response.data!);
  }

  // RF13: Perfil público da empresa
  Future<CompanyProfileModel> getCompanyProfile(String companyId) async {
    final response = await _apiClient.get<Map<String, dynamic>>(
      '/portfolio/company/$companyId',
    );
    return CompanyProfileModel.fromJson(response.data!);
  }

  Future<PortfolioItemModel> addPortfolioItem({
    required String title,
    required String description,
    String? imageUrl,
    String? projectUrl,
    List<String>? technologies,
  }) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      '/portfolio/items',
      data: {
        'title': title,
        'description': description,
        'imageUrl': imageUrl,
        'projectUrl': projectUrl,
        'technologies': technologies ?? [],
      },
    );
    return PortfolioItemModel.fromJson(response.data!);
  }
}
```

### 6.3 PortfolioViewModel

```dart
// lib/features/portfolio/viewmodel/portfolio_viewmodel.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:meraki/features/auth/viewmodel/auth_viewmodel.dart';
import 'package:meraki/features/portfolio/model/portfolio_model.dart';
import 'package:meraki/features/portfolio/repository/portfolio_repository.dart';

final portfolioRepositoryProvider = Provider<PortfolioRepository>((ref) {
  return PortfolioRepository(apiClient: ref.read(apiClientProvider));
});

// RF12: Perfil público do especialista
final specialistProfileProvider =
    FutureProvider.family<SpecialistProfileModel, String>((ref, id) {
  return ref.read(portfolioRepositoryProvider).getSpecialistProfile(id);
});

// RF13: Perfil público da empresa
final companyProfileProvider =
    FutureProvider.family<CompanyProfileModel, String>((ref, id) {
  return ref.read(portfolioRepositoryProvider).getCompanyProfile(id);
});
```

---

## 7. Injeção de Dependência com Riverpod Providers

Todos os providers são declarados em uma hierarquia clara: core → repository → viewmodel.

```dart
// lib/core/providers.dart

// ─── CORE ───────────────────────────────────────────────────────────────────
final storageServiceProvider = Provider<StorageService>(
  (ref) => StorageService(),
);

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(storageService: ref.read(storageServiceProvider));
});

// ─── AUTH ────────────────────────────────────────────────────────────────────
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    apiClient: ref.read(apiClientProvider),
    storage: ref.read(storageServiceProvider),
  );
});

final authViewModelProvider =
    StateNotifierProvider<AuthViewModel, AuthState>((ref) {
  return AuthViewModel(ref.read(authRepositoryProvider));
});

// ─── PROJECTS ────────────────────────────────────────────────────────────────
final projectRepositoryProvider = Provider<ProjectRepository>((ref) {
  return ProjectRepository(
    apiClient: ref.read(apiClientProvider),
    storage: ref.read(storageServiceProvider),
  );
});

final projectsViewModelProvider =
    AsyncNotifierProvider<ProjectsViewModel, List<ProjectModel>>(
  ProjectsViewModel.new,
);

// ─── BIDDING ─────────────────────────────────────────────────────────────────
final bidRepositoryProvider = Provider<BidRepository>((ref) {
  return BidRepository(
    apiClient: ref.read(apiClientProvider),
    storage: ref.read(storageServiceProvider),
  );
});

final bidViewModelProvider =
    StateNotifierProvider<BidViewModel, BidSubmitState>((ref) {
  return BidViewModel(ref.read(bidRepositoryProvider));
});

// ─── PORTFOLIO ───────────────────────────────────────────────────────────────
final portfolioRepositoryProvider = Provider<PortfolioRepository>((ref) {
  return PortfolioRepository(apiClient: ref.read(apiClientProvider));
});
```
