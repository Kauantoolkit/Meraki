import '../../../core/api/api_client.dart';
import '../../../core/services/storage_service.dart';
import '../model/user_model.dart';

class AuthRepository {
  final ApiClient _apiClient;
  final StorageService _storage;

  AuthRepository({required ApiClient apiClient, required StorageService storage})
      : _apiClient = apiClient,
        _storage = storage;

  Future<UserModel> login(String email, String password) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      '/auth/login',
      data: {'email': email, 'password': password},
    );
    final data = response.data!;
    final token = (data['token'] ?? data['access_token'] ?? data['accessToken']) as String;
    final user = data['user'] != null
        ? UserModel.fromJson(data['user'] as Map<String, dynamic>)
        : UserModel.fromJson(data);

    await _storage.saveToken(token);
    await _storage.saveUser(user.copyWith(token: token).toJson());
    return user.copyWith(token: token);
  }

  Future<UserModel> register(Map<String, dynamic> dto) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      '/auth/register',
      data: dto,
    );
    final data = response.data!;
    final token = (data['token'] ?? data['access_token'] ?? data['accessToken']) as String?;
    final user = data['user'] != null
        ? UserModel.fromJson(data['user'] as Map<String, dynamic>)
        : UserModel.fromJson(data);

    if (token != null) {
      await _storage.saveToken(token);
      await _storage.saveUser(user.copyWith(token: token).toJson());
      return user.copyWith(token: token);
    }
    return user;
  }

  Future<void> logout() => _storage.clearAll();

  /// Throws if the current token is invalid or the user no longer exists.
  Future<void> validateSession() async {
    await _apiClient.get<Map<String, dynamic>>('/users/me');
  }

  UserModel? getCachedUser() {
    final raw = _storage.getUser();
    if (raw == null) return null;
    return UserModel.fromJson(raw);
  }

  bool isAuthenticated() => _storage.getToken() != null;
}
