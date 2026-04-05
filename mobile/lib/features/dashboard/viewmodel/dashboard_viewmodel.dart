import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../projects/model/project_model.dart';
import '../../payments/model/payment_model.dart';
import '../../../core/providers.dart';

class DashboardStats {
  final List<ProjectModel> projects;
  final List<PaymentModel> payments;

  const DashboardStats({
    this.projects = const [],
    this.payments = const [],
  });

  int get inProgress => projects.where((p) => p.status == 'IN_PROGRESS').length;
  int get open => projects.where((p) => p.status == 'OPEN').length;
  int get completed => projects.where((p) => p.status == 'COMPLETED').length;

  double get escrowBalance => payments
      .where((p) => p.status == 'PENDING')
      .fold(0.0, (sum, p) => sum + p.amount);

  double get totalEarned => payments
      .where((p) => p.isReleased)
      .fold(0.0, (sum, p) => sum + p.specialistAmount);

  double get availableBalance => totalEarned;
}

class DashboardViewModel extends AsyncNotifier<DashboardStats> {
  @override
  Future<DashboardStats> build() => _load();

  Future<DashboardStats> _load() async {
    final projectRepo = ref.read(projectRepositoryProvider);
    final paymentRepo = ref.read(paymentRepositoryProvider);

    final results = await Future.wait([
      projectRepo.listProjects().catchError((_) => <ProjectModel>[]),
      paymentRepo.listMyPayments().catchError((_) => <PaymentModel>[]),
    ]);

    return DashboardStats(
      projects: results[0] as List<ProjectModel>,
      payments: results[1] as List<PaymentModel>,
    );
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_load);
  }
}

final dashboardViewModelProvider =
    AsyncNotifierProvider<DashboardViewModel, DashboardStats>(
  DashboardViewModel.new,
);
