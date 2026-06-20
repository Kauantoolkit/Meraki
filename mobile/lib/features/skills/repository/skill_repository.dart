import '../../../core/api/api_client.dart';
import '../model/skill_model.dart';

class SkillRepository {
  final ApiClient _apiClient;

  SkillRepository({required ApiClient apiClient}) : _apiClient = apiClient;

  Future<List<SkillModel>> getAll() async {
    final response = await _apiClient.get<List<dynamic>>('/skills');
    return (response.data ?? [])
        .map((e) => SkillModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<SkillModel> create({
    required String displayName,
    required List<CreateQuestionDto> questions,
  }) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      '/skills',
      data: {
        'displayName': displayName,
        'questions': questions.map((q) => q.toJson()).toList(),
      },
    );
    return SkillModel.fromJson(response.data!);
  }

  Future<void> addQuestions(
      String skillId, List<CreateQuestionDto> questions) async {
    await _apiClient.post(
      '/skills/$skillId/questions',
      data: {'questions': questions.map((q) => q.toJson()).toList()},
    );
  }

  Future<List<SkillQuestionModel>> getQuestions(String skillId) async {
    final response =
        await _apiClient.get<List<dynamic>>('/skills/$skillId/questions');
    return (response.data ?? [])
        .map((e) => SkillQuestionModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<SkillQuestionModel>> getRandomQuestions(String skillId) async {
    final response =
        await _apiClient.get<List<dynamic>>('/skills/$skillId/questions/random');
    return (response.data ?? [])
        .map((e) => SkillQuestionModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<SkillQuestionModel>> getCompanyQuestions(
      String skillId, String companyId) async {
    final response = await _apiClient
        .get<List<dynamic>>('/skills/$skillId/questions/by-company/$companyId');
    return (response.data ?? [])
        .map((e) => SkillQuestionModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<QuizResultModel> attemptProfile({
    required String skillId,
    required List<int> answers,
    required List<String> questionIds,
  }) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      '/skills/$skillId/attempt-profile',
      data: {'answers': answers, 'questionIds': questionIds},
    );
    return QuizResultModel.fromJson(response.data!);
  }

  Future<QuizResultModel> attemptProject({
    required String skillId,
    required List<int> answers,
    required String companyId,
    required List<String> questionIds,
  }) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      '/skills/$skillId/attempt-project',
      data: {
        'answers': answers,
        'companyId': companyId,
        'questionIds': questionIds,
      },
    );
    return QuizResultModel.fromJson(response.data!);
  }

  Future<void> updateQuestion(
    String questionId, {
    required String text,
    required List<String> options,
    required int correctIndex,
  }) async {
    await _apiClient.patch('/skills/questions/$questionId', data: {
      'text': text,
      'options': options,
      'correctIndex': correctIndex,
    });
  }

  Future<void> deleteQuestion(String questionId) async {
    await _apiClient.delete('/skills/questions/$questionId');
  }

  Future<List<SkillValidationModel>> getMyValidations() async {
    final response =
        await _apiClient.get<List<dynamic>>('/skills/my-validations');
    return (response.data ?? [])
        .map((e) => SkillValidationModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
