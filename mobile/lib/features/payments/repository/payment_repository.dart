import '../../../core/api/api_client.dart';
import '../model/payment_model.dart';

class PaymentRepository {
  final ApiClient _apiClient;

  PaymentRepository({required ApiClient apiClient}) : _apiClient = apiClient;

  Future<List<PaymentModel>> listMyPayments() async {
    final response = await _apiClient.get<dynamic>('/payments/my');
    final list = response.data is List ? response.data as List : [];
    return list.map((e) => PaymentModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<PaymentModel>> listProjectPayments(String projectId) async {
    final response = await _apiClient.get<dynamic>('/payments/project/$projectId');
    final list = response.data is List ? response.data as List : [];
    return list.map((e) => PaymentModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<PaymentModel>> listMilestonePayments(String milestoneId) async {
    final response = await _apiClient.get<dynamic>('/payments/milestone/$milestoneId');
    final data = response.data;
    if (data is List) return data.map((e) => PaymentModel.fromJson(e as Map<String, dynamic>)).toList();
    if (data is Map) return [PaymentModel.fromJson(data as Map<String, dynamic>)];
    return [];
  }

  Future<List<PaymentModel>> listByCompany() async {
    final response = await _apiClient.get<dynamic>('/payments/company');
    final data = response.data;
    // Backend may return { data: [...] } or direct array
    List list;
    if (data is Map && data.containsKey('data')) {
      list = data['data'] as List;
    } else if (data is List) {
      list = data;
    } else {
      list = [];
    }
    return list.map((e) => PaymentModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<void> releaseMilestone(String milestoneId) async {
    await _apiClient.post('/payments/release', data: {
      'milestoneId': milestoneId,
    });
  }
}
