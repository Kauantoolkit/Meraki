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
    String milestoneId, {
    required List<String> deliveredFiles,
    String? deliveryNotes,
  }) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      '/milestones/$milestoneId/submit',
      data: {
        'deliveredFiles': deliveredFiles,
        if (deliveryNotes != null && deliveryNotes.isNotEmpty)
          'deliveryNotes': deliveryNotes,
      },
    );
    return DeliveryModel.fromJson(response.data!);
  }

  Future<DeliveryModel?> getDelivery(String milestoneId) async {
    final response = await _apiClient.get<Map<String, dynamic>>(
      '/milestones/$milestoneId/delivery',
    );
    if (response.data == null) return null;
    return DeliveryModel.fromJson(response.data!);
  }

  Future<void> startMilestone(String milestoneId) async {
    await _apiClient.put('/milestones/$milestoneId/start');
  }

  Future<void> approveMilestone(String milestoneId) async {
    await _apiClient.put('/milestones/$milestoneId/approve');
  }

  Future<void> rejectMilestone(String milestoneId, String reason) async {
    await _apiClient.put('/milestones/$milestoneId/reject', data: {
      'reason': reason,
    });
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
