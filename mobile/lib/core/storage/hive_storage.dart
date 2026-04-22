import 'package:hive_flutter/hive_flutter.dart';

class HiveStorage {
  static const String authBox = 'auth';
  static const String projectsBox = 'projects';
  static const String cacheBox = 'cache';

  static Future<void> initialize() async {
    await Hive.initFlutter();
    await Hive.openBox<String>(authBox);
    await Hive.openBox<Map>(projectsBox);
    await Hive.openBox<dynamic>(cacheBox);
  }
}
