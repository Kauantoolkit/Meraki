import '../../../core/api/api_client.dart';
import '../model/delivery_model.dart';

class DeliveryRepository {
  final ApiClient _apiClient;

  DeliveryRepository({required ApiClient apiClient}) : _apiClient = apiClient;

  Future<List<KanbanColumnModel>> getKanbanBoard(String projectId) async {
    final response = await _apiClient.get<Map<String, dynamic>>(
      '/projects/$projectId/kanban',
    );
    final columns =
        (response.data?['columns'] as List<dynamic>?) ?? [];
    return columns
        .map((e) => KanbanColumnModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<DeliveryModel> submitDelivery(
    String milestoneId,
    String description,
  ) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      '/milestones/$milestoneId/submit',
      data: {'description': description},
    );
    return DeliveryModel.fromJson(response.data!);
  }

  Future<List<ProjectHistoryModel>> getProjectHistory(String projectId) async {
    final response = await _apiClient.get<List<dynamic>>(
      '/projects/$projectId/history',
    );
    return (response.data ?? [])
        .map((e) =>
            ProjectHistoryModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
