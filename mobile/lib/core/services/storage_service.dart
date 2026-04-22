import 'dart:convert';
import 'package:hive/hive.dart';
import '../storage/hive_storage.dart';

/// Abstração sobre Hive — persiste token JWT e cache de dados
class StorageService {
  static const _tokenKey = 'jwt_token';
  static const _userKey = 'current_user';

  Box<String> get _authBox => Hive.box<String>(HiveStorage.authBox);
  Box<Map> get _projectsBox => Hive.box<Map>(HiveStorage.projectsBox);
  Box<dynamic> get _cacheBox => Hive.box<dynamic>(HiveStorage.cacheBox);

  // ─── Token JWT ──────────────────────────────────────────────────────────
  Future<void> saveToken(String token) => _authBox.put(_tokenKey, token);
  String? getToken() => _authBox.get(_tokenKey);
  Future<void> clearToken() => _authBox.delete(_tokenKey);

  // ─── Usuário atual ───────────────────────────────────────────────────────
  Future<void> saveUser(Map<String, dynamic> user) =>
      _authBox.put(_userKey, jsonEncode(user));

  Map<String, dynamic>? getUser() {
    final raw = _authBox.get(_userKey);
    if (raw == null) return null;
    return jsonDecode(raw) as Map<String, dynamic>;
  }

  // ─── Cache de projetos ───────────────────────────────────────────────────
  Future<void> saveProjects(List<Map<String, dynamic>> projects) async {
    await _projectsBox.clear();
    for (final p in projects) {
      await _projectsBox.put(p['id'], p);
    }
  }

  List<Map<String, dynamic>> getProjects() {
    return _projectsBox.values
        .map((v) => Map<String, dynamic>.from(v as Map))
        .toList();
  }

  // ─── Cache genérico ──────────────────────────────────────────────────────
  Future<void> put(String key, dynamic value) => _cacheBox.put(key, value);
  dynamic get(String key) => _cacheBox.get(key);

  // ─── Clear all ───────────────────────────────────────────────────────────
  Future<void> clearAll() async {
    await _authBox.clear();
    await _projectsBox.clear();
    await _cacheBox.clear();
  }
}
