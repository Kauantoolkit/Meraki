import '../../../core/api/api_client.dart';
import '../model/bid_model.dart';

class BidRepository {
  final ApiClient _apiClient;

  BidRepository({required ApiClient apiClient}) : _apiClient = apiClient;

  Future<List<BidModel>> listBidsForProject(String projectId) async {
    final response = await _apiClient.get<List<dynamic>>(
      '/bids/project/$projectId',
    );
    return (response.data ?? [])
        .map((e) => BidModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<BidModel>> listMyBids() async {
    final response = await _apiClient.get<List<dynamic>>('/bids/my-bids');
    return (response.data ?? [])
        .map((e) => BidModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<BidModel> submitBid(Map<String, dynamic> dto) async {
    final response =
        await _apiClient.post<Map<String, dynamic>>('/bids', data: dto);
    return BidModel.fromJson(response.data!);
  }

  Future<BidModel> acceptBid(String bidId) async {
    final response =
        await _apiClient.put<Map<String, dynamic>>('/bids/$bidId/accept');
    return BidModel.fromJson(response.data!);
  }

  Future<BidModel> rejectBid(String bidId) async {
    final response =
        await _apiClient.put<Map<String, dynamic>>('/bids/$bidId/reject');
    return BidModel.fromJson(response.data!);
  }
}
