# MERAKI - Armazenamento Local com Hive (Flutter)

## 1. Visão Geral

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FLUTTER APP (Android / iOS)                          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                  HIVE LOCAL DATABASE (lib/core/storage/)             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│           │                      │                       │                  │
│           ▼                      ▼                       ▼                  │
│  ┌─────────────────┐  ┌─────────────────────┐  ┌─────────────────┐        │
│  │    authBox      │  │      cacheBox       │  │   prefsBox      │        │
│  │  (AES encrypted)│  │  (projetos, bids)   │  │ (preferências)  │        │
│  │                 │  │                     │  │                 │        │
│  │ - access_token  │  │ - projects_list     │  │ - theme         │        │
│  │ - refresh_token │  │ - my_bids           │  │ - language      │        │
│  │ - user_id       │  │ - portfolio_cache   │  │                 │        │
│  └─────────────────┘  └─────────────────────┘  └─────────────────┘        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    userBox (HiveObject)                              │    │
│  │  userId | name | email | userType | avatarUrl                       │    │
│  │  (exibição do perfil sem nova requisição à API)                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Estratégia de Armazenamento

| Dado                | Box Hive                     | Motivo                                                    |
|---------------------|------------------------------|-----------------------------------------------------------|
| JWT access token    | `authBox` (AES encrypted)    | Segurança — criptografado no dispositivo                  |
| JWT refresh token   | `authBox` (AES encrypted)    | Renovação automática de sessão sem novo login             |
| Dados do usuário    | `userBox`                    | Perfil disponível offline, sem requisição extra           |
| Cache de projetos   | `cacheBox` (com TTL)         | Reduz chamadas à API, suporte offline                     |
| Preferências        | `prefsBox`                   | Tema, idioma — persistência simples                       |
| Rascunhos de form   | `draftsBox` (temporário)     | Recuperar formulários em caso de crash                    |

---

## 3. Configuração do Hive

### 3.1 Dependências (pubspec.yaml)

```yaml
dependencies:
  hive: ^2.2.3
  hive_flutter: ^1.1.0

dev_dependencies:
  hive_generator: ^2.0.1
  build_runner: ^2.4.6
```

### 3.2 Inicialização no main.dart

```dart
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Inicializa Hive no diretório de documentos do app
  await Hive.initFlutter();

  // Registra TypeAdapters
  Hive.registerAdapter(UserModelAdapter());
  Hive.registerAdapter(ProjectModelAdapter());
  Hive.registerAdapter(CacheEntryAdapter());

  // Gera chave de criptografia (armazenada no Keystore/Keychain)
  final secureStorage = FlutterSecureStorage();
  var encryptionKeyString = await secureStorage.read(key: 'hive_key');
  if (encryptionKeyString == null) {
    final key = Hive.generateSecureKey();
    encryptionKeyString = base64UrlEncode(key);
    await secureStorage.write(key: 'hive_key', value: encryptionKeyString);
  }
  final encryptionKey = base64Url.decode(encryptionKeyString);

  // Abre as boxes
  await Hive.openBox<String>(
    'authBox',
    encryptionCipher: HiveAesCipher(encryptionKey),
  );
  await Hive.openBox<UserModel>('userBox');
  await Hive.openBox<CacheEntry>('cacheBox');
  await Hive.openBox('prefsBox');

  runApp(ProviderScope(child: MerakiApp()));
}
```

---

## 4. TypeAdapters (Modelos Hive)

### 4.1 UserModel

```dart
// lib/features/auth/data/models/user_model.dart
import 'package:hive/hive.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_model.g.dart';

@HiveType(typeId: 0)
class UserModel extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String name;

  @HiveField(2)
  final String email;

  @HiveField(3)
  final String userType; // 'company' | 'specialist'

  @HiveField(4)
  final String? avatarUrl;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.userType,
    this.avatarUrl,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
    id: json['id'],
    name: json['name'],
    email: json['email'],
    userType: json['userType'],
    avatarUrl: json['avatarUrl'],
  );
}
```

### 4.2 CacheEntry (com TTL)

```dart
// lib/core/storage/models/cache_entry.dart
@HiveType(typeId: 2)
class CacheEntry extends HiveObject {
  @HiveField(0)
  final String data; // JSON serializado

  @HiveField(1)
  final DateTime cachedAt;

  @HiveField(2)
  final int ttlMinutes;

  CacheEntry({
    required this.data,
    required this.cachedAt,
    required this.ttlMinutes,
  });

  bool get isExpired =>
      DateTime.now().difference(cachedAt).inMinutes > ttlMinutes;
}
```

---

## 5. HiveRepository Pattern

```dart
// lib/core/storage/hive_storage.dart
abstract class ILocalStorage {
  Future<void> saveToken(String accessToken, String refreshToken);
  String? getAccessToken();
  Future<void> clearAuth();
  Future<void> saveUser(UserModel user);
  UserModel? getUser();
  Future<void> saveCache(String key, String jsonData, {int ttlMinutes = 15});
  String? getCache(String key);
}

class HiveStorage implements ILocalStorage {
  final Box<String> _authBox;
  final Box<UserModel> _userBox;
  final Box<CacheEntry> _cacheBox;

  HiveStorage({
    required Box<String> authBox,
    required Box<UserModel> userBox,
    required Box<CacheEntry> cacheBox,
  })  : _authBox = authBox,
        _userBox = userBox,
        _cacheBox = cacheBox;

  @override
  Future<void> saveToken(String accessToken, String refreshToken) async {
    await _authBox.put('access_token', accessToken);
    await _authBox.put('refresh_token', refreshToken);
  }

  @override
  String? getAccessToken() => _authBox.get('access_token');

  @override
  Future<void> clearAuth() async {
    await _authBox.clear();
    await _userBox.clear();
  }

  @override
  Future<void> saveUser(UserModel user) async {
    await _userBox.put('current_user', user);
  }

  @override
  UserModel? getUser() => _userBox.get('current_user');

  @override
  Future<void> saveCache(String key, String jsonData,
      {int ttlMinutes = 15}) async {
    await _cacheBox.put(
      key,
      CacheEntry(
        data: jsonData,
        cachedAt: DateTime.now(),
        ttlMinutes: ttlMinutes,
      ),
    );
  }

  @override
  String? getCache(String key) {
    final entry = _cacheBox.get(key);
    if (entry == null || entry.isExpired) {
      _cacheBox.delete(key);
      return null;
    }
    return entry.data;
  }
}
```

---

## 6. Integração com Riverpod

```dart
// lib/core/storage/storage_providers.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

final localStorageProvider = Provider<ILocalStorage>((ref) {
  return HiveStorage(
    authBox: Hive.box<String>('authBox'),
    userBox: Hive.box<UserModel>('userBox'),
    cacheBox: Hive.box<CacheEntry>('cacheBox'),
  );
});

// Uso no AuthRepository
final authRepositoryProvider = Provider<IAuthRepository>((ref) {
  final dio = ref.watch(dioClientProvider);
  final storage = ref.watch(localStorageProvider);
  return AuthRepository(dio: dio, storage: storage);
});
```

---

## 7. Estratégia de Cache com TTL

```dart
// Exemplo: ProjectRepository com cache Hive
class ProjectRepository implements IProjectRepository {
  final DioClient _dio;
  final ILocalStorage _storage;

  static const _cacheKey = 'projects_list';
  static const _cacheTtl = 15; // minutos

  @override
  Future<List<Project>> getProjects() async {
    // 1. Verifica cache
    final cached = _storage.getCache(_cacheKey);
    if (cached != null) {
      final list = (jsonDecode(cached) as List)
          .map((j) => ProjectModel.fromJson(j).toDomain())
          .toList();
      return list;
    }

    // 2. Busca da API
    final response = await _dio.get('/projects');
    final projects = (response.data as List)
        .map((j) => ProjectModel.fromJson(j))
        .toList();

    // 3. Salva no cache com TTL de 15 minutos
    await _storage.saveCache(
      _cacheKey,
      jsonEncode(projects.map((p) => p.toJson()).toList()),
      ttlMinutes: _cacheTtl,
    );

    return projects.map((p) => p.toDomain()).toList();
  }

  // Invalida cache após criar/atualizar projeto
  Future<void> invalidateCache() async {
    _storage.saveCache(_cacheKey, '', ttlMinutes: 0);
  }
}
```

---

## 8. Segurança do Token JWT

A chave de criptografia AES é gerada uma vez e armazenada no **Android Keystore** / **iOS Keychain** via `flutter_secure_storage`, garantindo que:

- O token JWT nunca é salvo em texto plano no dispositivo
- Mesmo com acesso ao arquivo do Hive, os dados são ilegíveis
- A chave é invalidada se o app for desinstalado

```dart
// Verificação de token na inicialização do app
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final storage = ref.watch(localStorageProvider);
  final token = storage.getAccessToken();
  // Se token existe, usuário continua logado
  final initialState = token != null
      ? AuthState.authenticated(storage.getUser()!)
      : AuthState.unauthenticated();
  return AuthNotifier(ref, initialState);
});
```

---

## 9. Testes

```dart
// test/core/storage/hive_storage_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:mockito/mockito.dart';

void main() {
  late HiveStorage storage;

  setUp(() async {
    // Hive em memória para testes
    Hive.init(Directory.systemTemp.path);
    Hive.registerAdapter(UserModelAdapter());
    Hive.registerAdapter(CacheEntryAdapter());

    final authBox = await Hive.openBox<String>('authBox_test');
    final userBox = await Hive.openBox<UserModel>('userBox_test');
    final cacheBox = await Hive.openBox<CacheEntry>('cacheBox_test');

    storage = HiveStorage(
      authBox: authBox,
      userBox: userBox,
      cacheBox: cacheBox,
    );
  });

  tearDown(() => Hive.deleteFromDisk());

  test('salva e recupera token', () async {
    await storage.saveToken('access123', 'refresh456');
    expect(storage.getAccessToken(), equals('access123'));
  });

  test('cache expirado retorna null', () async {
    await storage.saveCache('key', '{"data":1}', ttlMinutes: 0);
    // TTL 0 = expirado imediatamente
    expect(storage.getCache('key'), isNull);
  });

  test('clearAuth limpa tokens e usuário', () async {
    await storage.saveToken('token', 'refresh');
    await storage.clearAuth();
    expect(storage.getAccessToken(), isNull);
  });
}
```

---

## 10. Próximos Passos

- [x] 08 - Integração API com Dio
- [ ] 10 - Relatório Técnico
