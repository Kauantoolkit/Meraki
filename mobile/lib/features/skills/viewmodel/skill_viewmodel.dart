import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers.dart';
import '../model/skill_model.dart';
import '../repository/skill_repository.dart';

// ─── Catálogo de Skills ──────────────────────────────────────────────────────

final skillsCatalogProvider =
    AsyncNotifierProvider<SkillsCatalogViewModel, List<SkillModel>>(
  SkillsCatalogViewModel.new,
);

class SkillsCatalogViewModel extends AsyncNotifier<List<SkillModel>> {
  SkillRepository get _repo => ref.read(skillRepositoryProvider);

  @override
  Future<List<SkillModel>> build() => _repo.getAll();

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _repo.getAll());
  }

  Future<SkillModel?> createSkill({
    required String displayName,
    required List<CreateQuestionDto> questions,
  }) async {
    try {
      final skill =
          await _repo.create(displayName: displayName, questions: questions);
      await refresh();
      return skill;
    } catch (_) {
      return null;
    }
  }

  Future<bool> addQuestions(
      String skillId, List<CreateQuestionDto> questions) async {
    try {
      await _repo.addQuestions(skillId, questions);
      return true;
    } catch (_) {
      return false;
    }
  }
}

// ─── Questões de uma Skill ───────────────────────────────────────────────────

final skillQuestionsProvider = FutureProvider.family
    .autoDispose<List<SkillQuestionModel>, String>((ref, skillId) {
  return ref.read(skillRepositoryProvider).getQuestions(skillId);
});

// ─── Quiz Flow ───────────────────────────────────────────────────────────────

class SkillQuizState {
  final List<SkillQuestionModel> questions;
  final Map<String, int> answers; // questionId -> selectedIndex
  final bool isLoading;
  final QuizResultModel? result;
  final String? error;

  const SkillQuizState({
    this.questions = const [],
    this.answers = const {},
    this.isLoading = false,
    this.result,
    this.error,
  });

  SkillQuizState copyWith({
    List<SkillQuestionModel>? questions,
    Map<String, int>? answers,
    bool? isLoading,
    QuizResultModel? result,
    String? error,
  }) {
    return SkillQuizState(
      questions: questions ?? this.questions,
      answers: answers ?? this.answers,
      isLoading: isLoading ?? this.isLoading,
      result: result ?? this.result,
      error: error,
    );
  }

  bool get allAnswered => answers.length == questions.length;
}

final skillQuizProvider =
    NotifierProvider.autoDispose<SkillQuizViewModel, SkillQuizState>(
  SkillQuizViewModel.new,
);

class SkillQuizViewModel extends AutoDisposeNotifier<SkillQuizState> {
  @override
  SkillQuizState build() => const SkillQuizState();

  Future<void> loadQuestions(String skillId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final questions =
          await ref.read(skillRepositoryProvider).getRandomQuestions(skillId);
      state = SkillQuizState(questions: questions);
    } catch (e) {
      state = state.copyWith(
          isLoading: false, error: 'Erro ao carregar questões.');
    }
  }

  void selectAnswer(String questionId, int index) {
    final updated = Map<String, int>.from(state.answers);
    updated[questionId] = index;
    state = state.copyWith(answers: updated);
  }

  Future<QuizResultModel?> submitProfile(String skillId) async {
    if (!state.allAnswered) return null;
    state = state.copyWith(isLoading: true);
    try {
      final questionIds = state.questions.map((q) => q.id).toList();
      final answers = state.questions
          .map((q) => state.answers[q.id] ?? 0)
          .toList();
      final result = await ref.read(skillRepositoryProvider).attemptProfile(
            skillId: skillId,
            answers: answers,
            questionIds: questionIds,
          );
      state = state.copyWith(isLoading: false, result: result);
      return result;
    } catch (e) {
      state = state.copyWith(
          isLoading: false, error: 'Erro ao enviar respostas.');
      return null;
    }
  }

  Future<QuizResultModel?> submitProject(
      String skillId, String companyId) async {
    if (!state.allAnswered) return null;
    state = state.copyWith(isLoading: true);
    try {
      final questionIds = state.questions.map((q) => q.id).toList();
      final answers = state.questions
          .map((q) => state.answers[q.id] ?? 0)
          .toList();
      final result = await ref.read(skillRepositoryProvider).attemptProject(
            skillId: skillId,
            answers: answers,
            companyId: companyId,
            questionIds: questionIds,
          );
      state = state.copyWith(isLoading: false, result: result);
      return result;
    } catch (e) {
      state = state.copyWith(
          isLoading: false, error: 'Erro ao enviar respostas.');
      return null;
    }
  }
}

// ─── Minhas Validações ───────────────────────────────────────────────────────

final myValidationsProvider =
    FutureProvider.autoDispose<List<SkillValidationModel>>((ref) {
  return ref.read(skillRepositoryProvider).getMyValidations();
});
