import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers.dart';
import '../model/portfolio_model.dart';
import '../repository/portfolio_repository.dart';

class PortfolioViewModel extends AsyncNotifier<PortfolioModel> {
  @override
  Future<PortfolioModel> build() =>
      ref.read(portfolioRepositoryProvider).getMyPortfolio();

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(portfolioRepositoryProvider).getMyPortfolio(),
    );
  }

  Future<bool> updateBio(String bio) async {
    try {
      await ref.read(portfolioRepositoryProvider).updateBio(bio);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> addSkill(String skill) async {
    if (skill.trim().isEmpty) return false;
    try {
      await ref.read(portfolioRepositoryProvider).addSkill(skill.trim());
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> addCertification({
    required String title,
    required String institution,
    String? credentialUrl,
  }) async {
    try {
      await ref.read(portfolioRepositoryProvider).addCertification({
        'title': title,
        'institution': institution,
        'issuedAt': DateTime.now().toIso8601String(),
        if (credentialUrl != null && credentialUrl.isNotEmpty)
          'credentialUrl': credentialUrl,
      });
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }
}

final portfolioViewModelProvider =
    AsyncNotifierProvider<PortfolioViewModel, PortfolioModel>(
  PortfolioViewModel.new,
);
