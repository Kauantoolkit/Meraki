import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/viewmodel/auth_viewmodel.dart';
import 'financeiro_screen.dart';
import 'ganhos_screen.dart';

class PaymentsScreen extends ConsumerWidget {
  const PaymentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authViewModelProvider).user;
    final isSpecialist = user?.isSpecialist ?? false;

    if (isSpecialist) {
      return const GanhosScreen();
    }
    return const FinanceiroScreen();
  }
}
