import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
import '../model/portfolio_model.dart';
import '../repository/portfolio_repository.dart';

final _publicProfileProvider =
    FutureProvider.family<PortfolioModel, String>((ref, specialistId) {
  return ref.read(portfolioRepositoryProvider).getPublicProfile(specialistId);
});

class SpecialistPortfolioScreen extends ConsumerWidget {
  final String specialistId;
  const SpecialistPortfolioScreen({super.key, required this.specialistId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(_publicProfileProvider(specialistId));

    return Scaffold(
      appBar: AppBar(title: const Text('Perfil do Especialista')),
      body: profileAsync.when(
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(message: e.toString()),
        data: (portfolio) => _PublicProfileContent(portfolio: portfolio),
      ),
    );
  }
}

class _PublicProfileContent extends StatelessWidget {
  final PortfolioModel portfolio;
  const _PublicProfileContent({required this.portfolio});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 32,
                backgroundColor: AppTheme.brandLight,
                child: const Icon(Icons.person, size: 32, color: AppTheme.brand),
              ),
              const SizedBox(width: 16),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.star, color: Colors.amber, size: 18),
                      const SizedBox(width: 4),
                      Text(
                        portfolio.rating.toStringAsFixed(1),
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    '${portfolio.completedProjects} projetos concluídos',
                    style: const TextStyle(color: AppTheme.slate300, fontSize: 12),
                  ),
                ],
              ),
            ],
          ),
          if (portfolio.bio.isNotEmpty) ...[
            const SizedBox(height: 16),
            const Text('Sobre',
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            Text(portfolio.bio,
                style: const TextStyle(color: AppTheme.slate300, height: 1.5)),
          ],
          if (portfolio.skills.isNotEmpty) ...[
            const SizedBox(height: 16),
            const Text('Habilidades',
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 4,
              children: portfolio.skills
                  .map(
                    (s) => Chip(
                      label: Text(s,
                          style: const TextStyle(
                              color: AppTheme.slate300, fontSize: 11)),
                      backgroundColor: AppTheme.slate700,
                      side: const BorderSide(color: AppTheme.slate200),
                    ),
                  )
                  .toList(),
            ),
          ],
          if (portfolio.certifications.isNotEmpty) ...[
            const SizedBox(height: 16),
            const Text('Certificações',
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
            ...portfolio.certifications.map(
              (c) => ListTile(
                dense: true,
                leading: const Icon(Icons.verified, color: Colors.blue),
                title: Text(c.title,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                subtitle: Text(c.institution,
                    style: const TextStyle(color: AppTheme.slate400)),
              ),
            ),
          ],
          if (portfolio.reviews.isNotEmpty) ...[
            const SizedBox(height: 16),
            const Text('Avaliações',
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            ...portfolio.reviews.map(
              (r) => Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(r.reviewerName,
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600)),
                          const Spacer(),
                          Row(
                            children: List.generate(
                              5,
                              (i) => Icon(
                                i < r.rating ? Icons.star : Icons.star_border,
                                color: Colors.amber,
                                size: 16,
                              ),
                            ),
                          ),
                        ],
                      ),
                      if (r.comment.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(r.comment,
                            style: const TextStyle(color: AppTheme.slate300)),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
