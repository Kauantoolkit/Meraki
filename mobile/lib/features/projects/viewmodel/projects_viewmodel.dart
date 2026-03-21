import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers.dart';
import '../model/project_model.dart';
import '../repository/project_repository.dart';

class ProjectsViewModel extends AsyncNotifier<List<ProjectModel>> {
  @override
  Future<List<ProjectModel>> build() => _load();

  Future<List<ProjectModel>> _load() =>
      ref.read(projectRepositoryProvider).listProjects();

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_load);
  }

  Future<void> filterByStatus(String? status) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(projectRepositoryProvider).listProjects(status: status),
    );
  }
}

class ProjectDetailViewModel extends AsyncNotifier<ProjectModel> {
  late String projectId;

  @override
  Future<ProjectModel> build() async {
    throw UnimplementedError('Use ProjectDetailViewModel.load(id)');
  }

  Future<void> load(String id) async {
    projectId = id;
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(projectRepositoryProvider).getProject(id),
    );
  }

  Future<void> updateMilestone(String milestoneId, String action) async {
    try {
      await ref
          .read(projectRepositoryProvider)
          .updateMilestoneDelivery(milestoneId, action);
      // Recarrega o projeto para refletir o novo status do milestone
      await load(projectId);
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }
}

// ─── CreateProject ─────────────────────────────────────────────────────────

class MilestoneDraft {
  final String title;
  final String description;
  final double amount;
  final String? dueDate;

  const MilestoneDraft({
    required this.title,
    required this.description,
    required this.amount,
    this.dueDate,
  });

  Map<String, dynamic> toJson() => {
        'title': title,
        'description': description,
        'amount': amount,
        if (dueDate != null) 'dueDate': dueDate,
      };
}

class CreateProjectState {
  final List<String> requirements;
  final List<MilestoneDraft> milestones;
  final bool isLoading;
  final String? error;

  const CreateProjectState({
    this.requirements = const [],
    this.milestones = const [],
    this.isLoading = false,
    this.error,
  });

  CreateProjectState copyWith({
    List<String>? requirements,
    List<MilestoneDraft>? milestones,
    bool? isLoading,
    String? error,
  }) =>
      CreateProjectState(
        requirements: requirements ?? this.requirements,
        milestones: milestones ?? this.milestones,
        isLoading: isLoading ?? this.isLoading,
        error: error,
      );
}

class CreateProjectViewModel extends Notifier<CreateProjectState> {
  @override
  CreateProjectState build() => const CreateProjectState();

  void addRequirement(String req) {
    if (req.trim().isEmpty) return;
    state = state.copyWith(requirements: [...state.requirements, req.trim()]);
  }

  void removeRequirement(int index) {
    final updated = [...state.requirements]..removeAt(index);
    state = state.copyWith(requirements: updated);
  }

  void addMilestone(MilestoneDraft draft) {
    state = state.copyWith(milestones: [...state.milestones, draft]);
  }

  void removeMilestone(int index) {
    final updated = [...state.milestones]..removeAt(index);
    state = state.copyWith(milestones: updated);
  }

  Future<bool> submit({
    required String title,
    required String description,
    required String budget,
    required String deadline,
  }) async {
    if (state.requirements.isEmpty) {
      state = state.copyWith(error: 'Adicione pelo menos um requisito');
      return false;
    }
    if (state.milestones.isEmpty) {
      state = state.copyWith(error: 'Adicione pelo menos um milestone');
      return false;
    }
    state = state.copyWith(isLoading: true, error: null);
    final repo = ref.read(projectRepositoryProvider);
    try {
      final project = await repo.createProject({
        'title': title.trim(),
        'description': description.trim(),
        'budget': double.parse(budget.replaceAll(',', '.')),
        'deadline': '${deadline}T00:00:00.000Z',
        'requirements': state.requirements,
      });
      for (final m in state.milestones) {
        await repo.createMilestone(project.id, m.toJson());
      }
      ref.read(projectsViewModelProvider.notifier).refresh();
      state = state.copyWith(isLoading: false);
      return true;
    } catch (_) {
      state = state.copyWith(
        isLoading: false,
        error: 'Erro ao criar projeto. Verifique os dados.',
      );
      return false;
    }
  }
}

final createProjectViewModelProvider =
    NotifierProvider<CreateProjectViewModel, CreateProjectState>(
  CreateProjectViewModel.new,
);

// ─── Providers ──────────────────────────────────────────────────────────────

final projectsViewModelProvider =
    AsyncNotifierProvider<ProjectsViewModel, List<ProjectModel>>(
  ProjectsViewModel.new,
);

final projectDetailViewModelProvider =
    AsyncNotifierProvider<ProjectDetailViewModel, ProjectModel>(
  ProjectDetailViewModel.new,
);
