import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'api/api_client.dart';
import 'services/storage_service.dart';
import '../features/auth/repository/auth_repository.dart';
import '../features/projects/repository/project_repository.dart';
import '../features/bidding/repository/bid_repository.dart';
import '../features/delivery/repository/delivery_repository.dart';
import '../features/payments/repository/payment_repository.dart';
import '../features/portfolio/repository/portfolio_repository.dart';

// ─── Camada 1: Core ────────────────────────────────────────────────────────

final storageServiceProvider = Provider<StorageService>((_) => StorageService());

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(ref.read(storageServiceProvider));
});

// ─── Camada 2: Repositories ────────────────────────────────────────────────

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    apiClient: ref.read(apiClientProvider),
    storage: ref.read(storageServiceProvider),
  );
});

final projectRepositoryProvider = Provider<ProjectRepository>((ref) {
  return ProjectRepository(apiClient: ref.read(apiClientProvider));
});

final bidRepositoryProvider = Provider<BidRepository>((ref) {
  return BidRepository(apiClient: ref.read(apiClientProvider));
});

final deliveryRepositoryProvider = Provider<DeliveryRepository>((ref) {
  return DeliveryRepository(apiClient: ref.read(apiClientProvider));
});

final paymentRepositoryProvider = Provider<PaymentRepository>((ref) {
  return PaymentRepository(apiClient: ref.read(apiClientProvider));
});

final portfolioRepositoryProvider = Provider<PortfolioRepository>((ref) {
  return PortfolioRepository(apiClient: ref.read(apiClientProvider));
});
