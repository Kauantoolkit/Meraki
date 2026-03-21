import '../../../core/api/api_client.dart';
import '../model/project_model.dart';

class ProjectRepository {
  final ApiClient _apiClient;

  ProjectRepository({required ApiClient apiClient}) : _apiClient = apiClient;

  Future<List<ProjectModel>> listProjects({String? status}) async {
    final response = await _apiClient.get<Map<String, dynamic>>(
      '/projects',
      queryParameters: status != null ? {'status': status} : null,
    );
    final list = (response.data?['data'] as List<dynamic>?) ?? [];
    return list.map((e) => ProjectModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<ProjectModel> getProject(String id) async {
    final response = await _apiClient.get<Map<String, dynamic>>('/projects/$id');
    return ProjectModel.fromJson(response.data!);
  }

  Future<ProjectModel> createProject(Map<String, dynamic> dto) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      '/projects',
      data: dto,
    );
    return ProjectModel.fromJson(response.data!);
  }

  Future<void> createMilestone(String projectId, Map<String, dynamic> dto) async {
    await _apiClient.post<void>('/projects/$projectId/milestones', data: dto);
  }

  Future<void> updateMilestoneDelivery(String milestoneId, String action) async {
    await _apiClient.put<void>('/milestones/$milestoneId/$action', data: {});
  }
}
