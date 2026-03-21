import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../features/auth/viewmodel/auth_viewmodel.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
import '../model/portfolio_model.dart';
import '../viewmodel/portfolio_viewmodel.dart';

class PortfolioScreen extends ConsumerWidget {
  const PortfolioScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authViewModelProvider).user;
    final isSpecialist = user?.isSpecialist ?? false;

    if (!isSpecialist) {
      return _CompanyProfileScreen(user: user);
    }

    final portfolioAsync = ref.watch(portfolioViewModelProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Meu Perfil'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined),
            tooltip: 'Editar bio',
            onPressed: () => _showEditBioDialog(
                context, ref, portfolioAsync.valueOrNull?.bio ?? ''),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Sair',
            onPressed: () async {
              await ref.read(authViewModelProvider.notifier).logout();
              if (context.mounted) context.go('/login');
            },
          ),
        ],
      ),
      body: portfolioAsync.when(
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(
          message: e.toString(),
          onRetry: () => ref.read(portfolioViewModelProvider.notifier).refresh(),
        ),
        data: (portfolio) =>
            _PortfolioContent(portfolio: portfolio, user: user),
      ),
      floatingActionButton: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          FloatingActionButton(
            heroTag: 'skill',
            mini: true,
            onPressed: () => _showAddSkillDialog(context, ref),
            tooltip: 'Adicionar habilidade',
            child: const Icon(Icons.psychology_outlined),
          ),
          const SizedBox(height: 8),
          FloatingActionButton.extended(
            heroTag: 'cert',
            onPressed: () => _showAddCertDialog(context, ref),
            icon: const Icon(Icons.verified_outlined),
            label: const Text('Certificação'),
          ),
        ],
      ),
    );
  }

  void _showEditBioDialog(
      BuildContext context, WidgetRef ref, String currentBio) {
    final ctrl = TextEditingController(text: currentBio);
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Editar bio'),
        content: TextField(
          controller: ctrl,
          maxLines: 4,
          decoration: const InputDecoration(
            border: OutlineInputBorder(),
            hintText: 'Conte um pouco sobre você...',
          ),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancelar')),
          FilledButton(
            onPressed: () {
              ref.read(portfolioViewModelProvider.notifier).updateBio(ctrl.text);
              Navigator.pop(context);
            },
            child: const Text('Salvar'),
          ),
        ],
      ),
    ).whenComplete(ctrl.dispose);
  }

  void _showAddSkillDialog(BuildContext context, WidgetRef ref) {
    final ctrl = TextEditingController();
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Adicionar Habilidade'),
        content: TextField(
          controller: ctrl,
          autofocus: true,
          decoration: const InputDecoration(
            labelText: 'Ex: Flutter, Node.js, PostgreSQL',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancelar')),
          FilledButton(
            onPressed: () {
              ref
                  .read(portfolioViewModelProvider.notifier)
                  .addSkill(ctrl.text);
              Navigator.pop(context);
            },
            child: const Text('Adicionar'),
          ),
        ],
      ),
    ).whenComplete(ctrl.dispose);
  }

  void _showAddCertDialog(BuildContext context, WidgetRef ref) {
    final titleCtrl = TextEditingController();
    final instCtrl = TextEditingController();
    final urlCtrl = TextEditingController();
    void disposeAll() {
      titleCtrl.dispose();
      instCtrl.dispose();
      urlCtrl.dispose();
    }

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Adicionar Certificação'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: titleCtrl,
              decoration: const InputDecoration(
                labelText: 'Título',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: instCtrl,
              decoration: const InputDecoration(
                labelText: 'Instituição',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: urlCtrl,
              decoration: const InputDecoration(
                labelText: 'URL (opcional)',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancelar')),
          FilledButton(
            onPressed: () {
              ref.read(portfolioViewModelProvider.notifier).addCertification(
                    title: titleCtrl.text,
                    institution: instCtrl.text,
                    credentialUrl: urlCtrl.text,
                  );
              Navigator.pop(context);
            },
            child: const Text('Adicionar'),
          ),
        ],
      ),
    ).whenComplete(disposeAll);
  }
}

// ─── Company profile ────────────────────────────────────────────────────────

class _CompanyProfileScreen extends ConsumerWidget {
  final dynamic user;
  const _CompanyProfileScreen({required this.user});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Minha Empresa'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Sair',
            onPressed: () async {
              await ref.read(authViewModelProvider.notifier).logout();
              if (context.mounted) context.go('/login');
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // ─── Header ───────────────────────────────────────────────
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              color: Theme.of(context).colorScheme.primaryContainer,
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor:
                        Theme.of(context).colorScheme.primary,
                    child: Text(
                      (user?.name ?? 'E').substring(0, 1).toUpperCase(),
                      style: Theme.of(context)
                          .textTheme
                          .headlineMedium
                          ?.copyWith(color: Colors.white),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    user?.name ?? '',
                    style: Theme.of(context)
                        .textTheme
                        .titleLarge
                        ?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user?.email ?? '',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context)
                              .colorScheme
                              .onPrimaryContainer
                              .withOpacity(0.7),
                        ),
                  ),
                ],
              ),
            ),

            // ─── Info tiles ───────────────────────────────────────────
            const SizedBox(height: 8),
            ListTile(
              leading: Icon(Icons.badge_outlined,
                  color: Theme.of(context).colorScheme.primary),
              title: const Text('Tipo de conta'),
              trailing: Chip(
                label: const Text('Empresa'),
                backgroundColor:
                    Theme.of(context).colorScheme.primaryContainer,
              ),
            ),
            const Divider(indent: 16, endIndent: 16),
            ListTile(
              leading: Icon(Icons.email_outlined,
                  color: Theme.of(context).colorScheme.primary),
              title: const Text('E-mail'),
              subtitle: Text(user?.email ?? ''),
            ),
            const Divider(indent: 16, endIndent: 16),
            ListTile(
              leading: Icon(Icons.work_outline,
                  color: Theme.of(context).colorScheme.primary),
              title: const Text('Seus projetos'),
              subtitle: const Text('Gerencie projetos na aba Projetos'),
              trailing: const Icon(Icons.arrow_forward_ios, size: 16),
              onTap: () => context.go('/projects'),
            ),
            const Divider(indent: 16, endIndent: 16),
            ListTile(
              leading: Icon(Icons.payments_outlined,
                  color: Theme.of(context).colorScheme.primary),
              title: const Text('Pagamentos'),
              subtitle: const Text('Visualize pagamentos na aba Pagamentos'),
              trailing: const Icon(Icons.arrow_forward_ios, size: 16),
              onTap: () => context.go('/payments'),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Specialist content ─────────────────────────────────────────────────────

class _PortfolioContent extends StatelessWidget {
  final PortfolioModel portfolio;
  final dynamic user;
  const _PortfolioContent({required this.portfolio, required this.user});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _ProfileHeader(portfolio: portfolio, user: user),
          if (portfolio.bio.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Text(portfolio.bio),
            ),
          if (portfolio.skills.isNotEmpty)
            _SkillsSection(skills: portfolio.skills),
          if (portfolio.certifications.isNotEmpty)
            _CertificationsSection(certifications: portfolio.certifications),
          if (portfolio.reviews.isNotEmpty)
            _ReviewsSection(reviews: portfolio.reviews),
          if (portfolio.workHistory.isNotEmpty)
            _WorkHistorySection(history: portfolio.workHistory),
          const SizedBox(height: 100),
        ],
      ),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  final PortfolioModel portfolio;
  final dynamic user;
  const _ProfileHeader({required this.portfolio, required this.user});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Row(
        children: [
          CircleAvatar(
            radius: 36,
            backgroundColor: Theme.of(context).colorScheme.primaryContainer,
            child: Text(
              (user?.name ?? 'U').substring(0, 1).toUpperCase(),
              style: Theme.of(context).textTheme.headlineMedium,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(user?.name ?? '',
                    style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.star, color: Colors.amber, size: 18),
                    const SizedBox(width: 4),
                    Text(portfolio.rating.toStringAsFixed(1)),
                    const SizedBox(width: 12),
                    const Icon(Icons.check_circle, color: Colors.green, size: 18),
                    const SizedBox(width: 4),
                    Text('${portfolio.completedProjects} projetos'),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SkillsSection extends StatelessWidget {
  final List<String> skills;
  const _SkillsSection({required this.skills});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Habilidades', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 4,
            children: skills
                .map((s) => Chip(
                      avatar: const Icon(Icons.code, size: 16),
                      label: Text(s),
                    ))
                .toList(),
          ),
        ],
      ),
    );
  }
}

class _CertificationsSection extends StatelessWidget {
  final List<CertificationModel> certifications;
  const _CertificationsSection({required this.certifications});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Certificações',
              style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          ...certifications.map(
            (c) => Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading:
                    const Icon(Icons.verified, color: Colors.blue, size: 28),
                title: Text(c.title,
                    style: const TextStyle(fontWeight: FontWeight.w600)),
                subtitle: Text(
                    '${c.institution} · ${c.issuedAt.substring(0, 10)}'),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ReviewsSection extends StatelessWidget {
  final List<ReviewModel> reviews;
  const _ReviewsSection({required this.reviews});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Avaliações', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          ...reviews.map(
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
                      const SizedBox(height: 6),
                      Text(r.comment,
                          style: Theme.of(context).textTheme.bodySmall),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _WorkHistorySection extends StatelessWidget {
  final List<WorkHistoryModel> history;
  const _WorkHistorySection({required this.history});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Histórico profissional',
              style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          ...history.map(
            (h) => Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor:
                      Theme.of(context).colorScheme.secondaryContainer,
                  child: const Icon(Icons.work_history_outlined, size: 20),
                ),
                title: Text(h.projectTitle,
                    style: const TextStyle(fontWeight: FontWeight.w600)),
                subtitle: Text(h.companyName),
                trailing: Text(
                  'R\$ ${h.earnedAmount.toStringAsFixed(0)}',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
