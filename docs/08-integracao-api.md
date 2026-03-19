# MERAKI - Integração com API (Flutter + Dio)

## 1. Visão Geral da Integração

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FLUTTER APP (Android / iOS)                          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      DIO CLIENT (core/network/dio_client.dart)       │    │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐            │    │
│  │  │ AuthInterceptor│  │LoggingIntercep│  │ErrorInterceptor│           │    │
│  │  │ (Bearer JWT)  │  │ (dev debug)   │  │ (DioException)│            │    │
│  │  └───────────────┘  └───────────────┘  └───────────────┘            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         API CLIENTS LAYER                            │    │
│  │  AuthApiClient │ ProjectApiClient │ BiddingApiClient                │    │
│  │  DeliveryApiClient │ PaymentApiClient │ PortfolioApiClient           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS / JSON
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY (NestJS)                               │
│                        http://localhost:3000/api                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
┌─────────────────┐       ┌─────────────────┐     ┌─────────────────┐
│  user-service   │       │ project-service │     │ bidding-service │
│  /auth/*        │       │ /projects/*     │     │ /bids/*         │
└─────────────────┘       └─────────────────┘     └─────────────────┘
              │                       │                       │
              ▼                       ▼                       ▼
┌─────────────────┐       ┌─────────────────┐     ┌─────────────────┐
│delivery-service │       │payment-service  │     │portfolio-service│
│ /milestones/*   │       │ /payments/*     │     │ /portfolio/*    │
└─────────────────┘       └─────────────────┘     └─────────────────┘
```

---

## 2. Configuração do Dio

### 2.1 Dependências (`pubspec.yaml`)

```yaml
dependencies:
  dio: ^5.4.0
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  riverpod: ^2.5.1
  flutter_riverpod: ^2.5.1
  freezed_annotation: ^2.4.1
  json_annotation: ^4.8.1

dev_dependencies:
  build_runner: ^2.4.8
  freezed: ^2.4.7
  json_serializable: ^6.7.1
  hive_generator: ^2.0.1
```

### 2.2 DioClient (Singleton)

```dart
// lib/core/network/dio_client.dart
import 'package:dio/dio.dart';
import 'interceptors/auth_interceptor.dart';
import 'interceptors/logging_interceptor.dart';
import 'interceptors/error_interceptor.dart';

class DioClient {
  DioClient._();
  static final DioClient _instance = DioClient._();
  factory DioClient() => _instance;

  late final Dio _dio = _buildDio();

  Dio get dio => _dio;

  Dio _buildDio() {
    final dio = Dio(
      BaseOptions(
        baseUrl: 'http://localhost:3000/api',
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 30),
        sendTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.addAll([
      AuthInterceptor(),
      LoggingInterceptor(),
      ErrorInterceptor(),
    ]);

    return dio;
  }
}
```

---

## 3. Interceptors

### 3.1 AuthInterceptor — Injeção do Bearer Token

```dart
// lib/core/network/interceptors/auth_interceptor.dart
import 'package:dio/dio.dart';
import 'package:hive/hive.dart';

class AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final authBox = Hive.box('authBox');
    final token = authBox.get('accessToken') as String?;

    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    // Refresh automático do token quando 401
    if (err.response?.statusCode == 401) {
      final refreshed = await _tryRefreshToken();
      if (refreshed) {
        // Reenviar a requisição original com o novo token
        final authBox = Hive.box('authBox');
        final newToken = authBox.get('accessToken') as String?;

        err.requestOptions.headers['Authorization'] = 'Bearer $newToken';

        final dio = Dio();
        final clonedRequest = await dio.fetch(err.requestOptions);
        return handler.resolve(clonedRequest);
      }
    }

    handler.next(err);
  }

  Future<bool> _tryRefreshToken() async {
    try {
      final authBox = Hive.box('authBox');
      final refreshToken = authBox.get('refreshToken') as String?;
      if (refreshToken == null) return false;

      final dio = Dio();
      final response = await dio.post(
        'http://localhost:3000/api/auth/refresh',
        data: {'refreshToken': refreshToken},
      );

      final newAccessToken = response.data['data']['accessToken'] as String;
      await authBox.put('accessToken', newAccessToken);
      return true;
    } catch (_) {
      return false;
    }
  }
}
```

### 3.2 LoggingInterceptor — Debug em Desenvolvimento

```dart
// lib/core/network/interceptors/logging_interceptor.dart
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (kDebugMode) {
      debugPrint('[DIO] --> ${options.method} ${options.uri}');
      if (options.data != null) debugPrint('[DIO] Body: ${options.data}');
    }
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    if (kDebugMode) {
      debugPrint(
        '[DIO] <-- ${response.statusCode} ${response.requestOptions.uri}',
      );
    }
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (kDebugMode) {
      debugPrint(
        '[DIO] ERROR ${err.response?.statusCode} ${err.requestOptions.uri}: ${err.message}',
      );
    }
    handler.next(err);
  }
}
```

### 3.3 ErrorInterceptor — Mapeamento de Exceções

```dart
// lib/core/network/interceptors/error_interceptor.dart
import 'package:dio/dio.dart';
import '../exceptions/api_exceptions.dart';

class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final statusCode = err.response?.statusCode;
    final message =
        err.response?.data?['message'] as String? ?? 'Erro inesperado';

    switch (err.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return handler.reject(
          DioException(
            requestOptions: err.requestOptions,
            error: NetworkException('Tempo limite de conexão excedido'),
            type: err.type,
          ),
        );
      case DioExceptionType.connectionError:
        return handler.reject(
          DioException(
            requestOptions: err.requestOptions,
            error: NetworkException('Sem conexão com a internet'),
            type: err.type,
          ),
        );
      case DioExceptionType.badResponse:
        switch (statusCode) {
          case 401:
            return handler.reject(
              DioException(
                requestOptions: err.requestOptions,
                error: UnauthorizedException(message),
                type: err.type,
                response: err.response,
              ),
            );
          case 403:
            return handler.reject(
              DioException(
                requestOptions: err.requestOptions,
                error: ForbiddenException(message),
                type: err.type,
                response: err.response,
              ),
            );
          case 404:
            return handler.reject(
              DioException(
                requestOptions: err.requestOptions,
                error: NotFoundException(message),
                type: err.type,
                response: err.response,
              ),
            );
          case 422:
            return handler.reject(
              DioException(
                requestOptions: err.requestOptions,
                error: ValidationException(message),
                type: err.type,
                response: err.response,
              ),
            );
        }
        break;
      default:
        break;
    }

    handler.next(err);
  }
}
```

### 3.4 Exceções Customizadas

```dart
// lib/core/network/exceptions/api_exceptions.dart

class ApiException implements Exception {
  final String message;
  const ApiException(this.message);

  @override
  String toString() => message;
}

class UnauthorizedException extends ApiException {
  const UnauthorizedException(super.message);
}

class ForbiddenException extends ApiException {
  const ForbiddenException(super.message);
}

class NotFoundException extends ApiException {
  const NotFoundException(super.message);
}

class ValidationException extends ApiException {
  const ValidationException(super.message);
}

class NetworkException extends ApiException {
  const NetworkException(super.message);
}
```

---

## 4. Models com Freezed e JSON Serialization

```dart
// lib/features/auth/data/models/auth_response_model.dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'user_model.dart';

part 'auth_response_model.freezed.dart';
part 'auth_response_model.g.dart';

@freezed
class AuthResponseModel with _$AuthResponseModel {
  const factory AuthResponseModel({
    required String accessToken,
    String? refreshToken,
    required UserModel user,
  }) = _AuthResponseModel;

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) =>
      _$AuthResponseModelFromJson(json);
}
```

```dart
// lib/features/auth/data/models/user_model.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

@freezed
class UserModel with _$UserModel {
  const factory UserModel({
    required String id,
    required String email,
    required String name,
    required String userType, // 'COMPANY' | 'SPECIALIST'
    required String createdAt,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);
}
```

```dart
// lib/features/projects/data/models/project_model.dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'milestone_model.dart';

part 'project_model.freezed.dart';
part 'project_model.g.dart';

@freezed
class ProjectModel with _$ProjectModel {
  const factory ProjectModel({
    required String id,
    required String title,
    required String description,
    required List<String> requirements,
    required double budget,
    required String status,
    required String companyId,
    String? specialistId,
    required List<MilestoneModel> milestones,
    required String deadline,
    required String createdAt,
    required String updatedAt,
  }) = _ProjectModel;

  factory ProjectModel.fromJson(Map<String, dynamic> json) =>
      _$ProjectModelFromJson(json);
}
```

Gere os arquivos `.freezed.dart` e `.g.dart` executando:

```bash
dart run build_runner build --delete-conflicting-outputs
```

---

## 5. Implementação dos API Clients

### 5.1 AuthApiClient

```dart
// lib/features/auth/data/datasources/auth_api_client.dart
import 'package:dio/dio.dart';
import '../models/auth_response_model.dart';

class AuthApiClient {
  AuthApiClient(this._dio);
  final Dio _dio;

  Future<AuthResponseModel> login(String email, String password) async {
    final response = await _dio.post(
      '/auth/login',
      data: {'email': email, 'password': password},
    );
    return AuthResponseModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  Future<AuthResponseModel> register({
    required String email,
    required String password,
    required String name,
    required String userType,
  }) async {
    final response = await _dio.post(
      '/auth/register',
      data: {
        'email': email,
        'password': password,
        'name': name,
        'userType': userType,
      },
    );
    return AuthResponseModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  Future<AuthResponseModel> refreshToken(String refreshToken) async {
    final response = await _dio.post(
      '/auth/refresh',
      data: {'refreshToken': refreshToken},
    );
    return AuthResponseModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  Future<void> logout() async {
    await _dio.post('/auth/logout');
  }
}
```

### 5.2 ProjectApiClient

```dart
// lib/features/projects/data/datasources/project_api_client.dart
import 'package:dio/dio.dart';
import '../models/project_model.dart';

class ProjectApiClient {
  ProjectApiClient(this._dio);
  final Dio _dio;

  Future<List<ProjectModel>> getProjects({
    int page = 1,
    int limit = 20,
    String? status,
  }) async {
    final response = await _dio.get(
      '/projects',
      queryParameters: {
        'page': page,
        'limit': limit,
        if (status != null) 'status': status,
      },
    );
    final data = response.data['data'] as List<dynamic>;
    return data
        .map((e) => ProjectModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<ProjectModel> getProjectById(String id) async {
    final response = await _dio.get('/projects/$id');
    return ProjectModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  Future<ProjectModel> createProject({
    required String title,
    required String description,
    required List<String> requirements,
    required double budget,
    required String deadline,
  }) async {
    final response = await _dio.post(
      '/projects',
      data: {
        'title': title,
        'description': description,
        'requirements': requirements,
        'budget': budget,
        'deadline': deadline,
      },
    );
    return ProjectModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  Future<ProjectModel> updateProject(
    String id,
    Map<String, dynamic> data,
  ) async {
    final response = await _dio.patch('/projects/$id', data: data);
    return ProjectModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  Future<void> deleteProject(String id) async {
    await _dio.delete('/projects/$id');
  }
}
```

### 5.3 BiddingApiClient

```dart
// lib/features/bidding/data/datasources/bidding_api_client.dart
import 'package:dio/dio.dart';
import '../models/bid_model.dart';

class BiddingApiClient {
  BiddingApiClient(this._dio);
  final Dio _dio;

  Future<BidModel> createBid({
    required String projectId,
    required String proposal,
    required double proposedBudget,
    required int estimatedDuration,
  }) async {
    final response = await _dio.post(
      '/bids',
      data: {
        'projectId': projectId,
        'proposal': proposal,
        'proposedBudget': proposedBudget,
        'estimatedDuration': estimatedDuration,
      },
    );
    return BidModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  Future<List<BidModel>> getBidsByProject(String projectId) async {
    final response = await _dio.get('/bids/project/$projectId');
    final data = response.data['data'] as List<dynamic>;
    return data
        .map((e) => BidModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<BidModel> acceptBid(String bidId) async {
    final response = await _dio.patch('/bids/$bidId/accept');
    return BidModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  Future<BidModel> rejectBid(String bidId) async {
    final response = await _dio.patch('/bids/$bidId/reject');
    return BidModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }
}
```

### 5.4 DeliveryApiClient

```dart
// lib/features/delivery/data/datasources/delivery_api_client.dart
import 'package:dio/dio.dart';
import '../models/milestone_model.dart';

class DeliveryApiClient {
  DeliveryApiClient(this._dio);
  final Dio _dio;

  Future<List<MilestoneModel>> getMilestonesByProject(String projectId) async {
    final response = await _dio.get('/projects/$projectId/milestones');
    final data = response.data['data'] as List<dynamic>;
    return data
        .map((e) => MilestoneModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<MilestoneModel> startMilestone(String milestoneId) async {
    final response = await _dio.patch('/milestones/$milestoneId/start');
    return MilestoneModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  Future<MilestoneModel> submitMilestone(
    String milestoneId, {
    required String notes,
    required List<String> files,
  }) async {
    final response = await _dio.patch(
      '/milestones/$milestoneId/submit',
      data: {'notes': notes, 'files': files},
    );
    return MilestoneModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  Future<MilestoneModel> approveMilestone(String milestoneId) async {
    final response = await _dio.patch('/milestones/$milestoneId/approve');
    return MilestoneModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  Future<MilestoneModel> rejectMilestone(
    String milestoneId, {
    required String reason,
  }) async {
    final response = await _dio.patch(
      '/milestones/$milestoneId/reject',
      data: {'reason': reason},
    );
    return MilestoneModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }
}
```

### 5.5 PaymentApiClient

```dart
// lib/features/payment/data/datasources/payment_api_client.dart
import 'package:dio/dio.dart';
import '../models/payment_model.dart';

class PaymentApiClient {
  PaymentApiClient(this._dio);
  final Dio _dio;

  Future<PaymentModel> releasePayment(String milestoneId) async {
    final response = await _dio.post('/payments/release/$milestoneId');
    return PaymentModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  Future<List<PaymentModel>> getPaymentsByProject(String projectId) async {
    final response = await _dio.get('/payments/project/$projectId');
    final data = response.data['data'] as List<dynamic>;
    return data
        .map((e) => PaymentModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
```

### 5.6 PortfolioApiClient

```dart
// lib/features/portfolio/data/datasources/portfolio_api_client.dart
import 'package:dio/dio.dart';
import '../models/portfolio_model.dart';

class PortfolioApiClient {
  PortfolioApiClient(this._dio);
  final Dio _dio;

  Future<PortfolioModel> getPublicProfile(String specialistId) async {
    final response = await _dio.get('/portfolio/$specialistId');
    return PortfolioModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  Future<PortfolioModel> updatePortfolio(Map<String, dynamic> data) async {
    final response = await _dio.patch('/portfolio', data: data);
    return PortfolioModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }
}
```

---

## 6. Injeção de Dependências com Riverpod

```dart
// lib/core/network/providers/dio_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../dio_client.dart';
import 'package:dio/dio.dart';

final dioProvider = Provider<Dio>((ref) {
  return DioClient().dio;
});

// lib/features/auth/providers/auth_api_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/datasources/auth_api_client.dart';
import '../../../core/network/providers/dio_provider.dart';

final authApiClientProvider = Provider<AuthApiClient>((ref) {
  final dio = ref.read(dioProvider);
  return AuthApiClient(dio);
});

// lib/features/projects/providers/project_api_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/datasources/project_api_client.dart';
import '../../../core/network/providers/dio_provider.dart';

final projectApiClientProvider = Provider<ProjectApiClient>((ref) {
  final dio = ref.read(dioProvider);
  return ProjectApiClient(dio);
});
```

---

## 7. Tratamento de Erros nas ViewModels

```dart
// lib/features/auth/presentation/viewmodels/auth_viewmodel.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../data/datasources/auth_api_client.dart';
import '../../../../core/network/exceptions/api_exceptions.dart';

class AuthState {
  final bool isLoading;
  final String? error;
  final String? userId;

  const AuthState({
    this.isLoading = false,
    this.error,
    this.userId,
  });

  AuthState copyWith({bool? isLoading, String? error, String? userId}) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      userId: userId ?? this.userId,
    );
  }
}

class AuthViewModel extends StateNotifier<AuthState> {
  AuthViewModel(this._authApiClient) : super(const AuthState());

  final AuthApiClient _authApiClient;

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _authApiClient.login(email, password);

      // Salvar tokens no Hive (ver doc 09)
      final authBox = Hive.box('authBox');
      await authBox.put('accessToken', response.accessToken);
      if (response.refreshToken != null) {
        await authBox.put('refreshToken', response.refreshToken);
      }
      await authBox.put('userId', response.user.id);
      await authBox.put('userType', response.user.userType);

      state = state.copyWith(isLoading: false, userId: response.user.id);
    } on DioException catch (e) {
      final msg = _mapDioError(e);
      state = state.copyWith(isLoading: false, error: msg);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Erro inesperado');
    }
  }

  String _mapDioError(DioException e) {
    if (e.error is UnauthorizedException) return 'Credenciais inválidas';
    if (e.error is NetworkException) return 'Sem conexão com a internet';
    if (e.error is ValidationException) return 'Dados inválidos';
    final statusCode = e.response?.statusCode;
    final message = e.response?.data?['message'] as String?;
    return message ?? 'Erro $statusCode';
  }
}

final authViewModelProvider =
    StateNotifierProvider<AuthViewModel, AuthState>((ref) {
  final client = ref.read(authApiClientProvider);
  return AuthViewModel(client);
});
```

---

## 8. Fluxo Completo: Login → Token Salvo → Requisição Autenticada

```dart
// Passo 1: Usuário preenche formulário e chama o ViewModel
// lib/features/auth/presentation/pages/login_page.dart

class LoginPage extends ConsumerWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(authViewModelProvider);
    final viewModel = ref.read(authViewModelProvider.notifier);

    // Observar mudanças de estado para navegar após login
    ref.listen<AuthState>(authViewModelProvider, (previous, next) {
      if (next.userId != null && previous?.userId == null) {
        Navigator.of(context).pushReplacementNamed('/projects');
      }
      if (next.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(next.error!)),
        );
      }
    });

    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'MERAKI',
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 32),
            // Campos email e senha omitidos para brevidade
            ElevatedButton(
              onPressed: state.isLoading
                  ? null
                  : () => viewModel.login('email@ex.com', 'senha123'),
              child: state.isLoading
                  ? const CircularProgressIndicator()
                  : const Text('Entrar'),
            ),
          ],
        ),
      ),
    );
  }
}

// Passo 2: AuthViewModel chama AuthApiClient → token salvo no Hive
// (ver seção 7 acima)

// Passo 3: AuthInterceptor lê o token do Hive e injeta no header de toda requisição
// → Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
// (ver seção 3.1 acima)

// Passo 4: Requisição autenticada (ex: buscar projetos)
// lib/features/projects/presentation/viewmodels/projects_viewmodel.dart

final projectsProvider = FutureProvider<List<ProjectModel>>((ref) async {
  final client = ref.read(projectApiClientProvider);
  return client.getProjects(page: 1, limit: 20);
});
```

### Exemplo de Resposta da API

```json
// POST /api/auth/login — Resposta de sucesso
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "company@example.com",
      "name": "Empresa XYZ",
      "userType": "COMPANY",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  }
}

// GET /api/projects — Resposta paginada
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Desenvolvimento de App Mobile",
      "description": "App Flutter para gestão de projetos",
      "budget": 25000.00,
      "status": "open",
      "companyId": "550e8400-e29b-41d4-a716-446655440000",
      "milestones": [],
      "deadline": "2025-03-15T00:00:00.000Z",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2
  }
}

// Resposta de erro
{
  "success": false,
  "message": "Credenciais inválidas",
  "statusCode": 401
}
```

---

## 9. Próximos Passos

- [ ] 09 - Armazenamento Local (Hive)
- [ ] 10 - Relatório Técnico
