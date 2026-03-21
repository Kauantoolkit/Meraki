import '../../../core/api/api_client.dart';
import '../model/portfolio_model.dart';

class PortfolioRepository {
  final ApiClient _apiClient;

  PortfolioRepository({required ApiClient apiClient}) : _apiClient = apiClient;

  Future<PortfolioModel> getMyPortfolio() async {
    final response =
        await _apiClient.get<Map<String, dynamic>>('/portfolio/me');
    return PortfolioModel.fromJson(response.data!);
  }

  Future<PortfolioModel> getPublicProfile(String specialistId) async {
    final response = await _apiClient
        .get<Map<String, dynamic>>('/portfolio/specialist/$specialistId');
    return PortfolioModel.fromJson(response.data!);
  }

  Future<void> updateBio(String bio) async {
    await _apiClient.patch<void>('/portfolio/me', data: {'bio': bio});
  }

  Future<void> addSkill(String skill) async {
    await _apiClient.post<void>('/portfolio/me/skills', data: {'skill': skill});
  }

  Future<void> addCertification(Map<String, dynamic> dto) async {
    await _apiClient.post<void>('/portfolio/me/certifications', data: dto);
  }

  Future<void> addReview(String specialistId, Map<String, dynamic> dto) async {
    await _apiClient.post<void>(
      '/portfolio/$specialistId/reviews',
      data: dto,
    );
  }
}
