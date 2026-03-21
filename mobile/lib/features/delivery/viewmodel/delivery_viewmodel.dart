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

  Future<bool> submitDelivery(String milestoneId, String description) async {
    try {
      await ref
          .read(deliveryRepositoryProvider)
          .submitDelivery(milestoneId, description);
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
    required String description,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await ref
          .read(deliveryRepositoryProvider)
          .submitDelivery(milestoneId, description);
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
