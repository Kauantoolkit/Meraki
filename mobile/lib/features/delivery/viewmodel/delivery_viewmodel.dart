import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers.dart';
import '../model/delivery_model.dart';
import '../repository/delivery_repository.dart';

class KanbanViewModel extends AsyncNotifier<List<KanbanColumnModel>> {
  late String projectId;

  @override
  Future<List<KanbanColumnModel>> build() async => [];

  Future<void> load(String id) async {
    projectId = id;
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(deliveryRepositoryProvider).getKanbanBoard(id),
    );
  }

  Future<bool> submitDelivery(
    String milestoneId, {
    required List<String> deliveredFiles,
    String? deliveryNotes,
  }) async {
    try {
      await ref.read(deliveryRepositoryProvider).submitDelivery(
            milestoneId,
            deliveredFiles: deliveredFiles,
            deliveryNotes: deliveryNotes,
          );
      await load(projectId);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> startMilestone(String milestoneId) async {
    try {
      await ref.read(deliveryRepositoryProvider).startMilestone(milestoneId);
      await load(projectId);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> approveMilestone(String milestoneId) async {
    try {
      await ref.read(deliveryRepositoryProvider).approveMilestone(milestoneId);
      await load(projectId);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> rejectMilestone(String milestoneId, String reason) async {
    try {
      await ref
          .read(deliveryRepositoryProvider)
          .rejectMilestone(milestoneId, reason);
      await load(projectId);
      return true;
    } catch (_) {
      return false;
    }
  }
}

final kanbanViewModelProvider =
    AsyncNotifierProvider<KanbanViewModel, List<KanbanColumnModel>>(
  KanbanViewModel.new,
);

// ─── DeliverMilestone ───────────────────────────────────────────────────────

class DeliverMilestoneState {
  final bool isLoading;
  final String? error;
  final bool success;

  const DeliverMilestoneState({
    this.isLoading = false,
    this.error,
    this.success = false,
  });

  DeliverMilestoneState copyWith({bool? isLoading, String? error, bool? success}) =>
      DeliverMilestoneState(
        isLoading: isLoading ?? this.isLoading,
        error: error,
        success: success ?? this.success,
      );
}

class DeliverMilestoneViewModel extends Notifier<DeliverMilestoneState> {
  @override
  DeliverMilestoneState build() => const DeliverMilestoneState();

  Future<void> submit({
    required String milestoneId,
    required List<String> deliveredFiles,
    String? deliveryNotes,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await ref.read(deliveryRepositoryProvider).submitDelivery(
            milestoneId,
            deliveredFiles: deliveredFiles,
            deliveryNotes: deliveryNotes,
          );
      state = state.copyWith(isLoading: false, success: true);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

final deliverMilestoneViewModelProvider =
    NotifierProvider<DeliverMilestoneViewModel, DeliverMilestoneState>(
  DeliverMilestoneViewModel.new,
);

// ─── Project History (RF11) ──────────────────────────────────────────────────

class ProjectHistoryViewModel
    extends AsyncNotifier<List<ProjectHistoryModel>> {
  @override
  Future<List<ProjectHistoryModel>> build() async => [];

  Future<void> load(String projectId) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(deliveryRepositoryProvider).getProjectHistory(projectId),
    );
  }
}

final projectHistoryViewModelProvider =
    AsyncNotifierProvider<ProjectHistoryViewModel, List<ProjectHistoryModel>>(
  ProjectHistoryViewModel.new,
);

// ─── Delivery de uma milestone ───────────────────────────────────────────────
// Usado nos diálogos de aprovar/rejeitar para mostrar os entregáveis submetidos.
final deliveryProvider =
    FutureProvider.family.autoDispose<DeliveryModel?, String>(
  (ref, milestoneId) =>
      ref.read(deliveryRepositoryProvider).getDelivery(milestoneId),
);
