import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/storage/hive_storage.dart';
import 'core/theme/app_theme.dart';
import 'app_router.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await HiveStorage.initialize();

  runApp(
    const ProviderScope(
      child: MerakiApp(),
    ),
  );
}

class MerakiApp extends ConsumerWidget {
  const MerakiApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    return MaterialApp.router(
      title: 'Meraki',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      routerConfig: router,
    );
  }
}
