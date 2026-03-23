import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
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
      return _CompanyOwnProfileScreen(user: user);
    }

    final portfolioAsync = ref.watch(portfolioViewModelProvider);

    return Scaffold(
      body: portfolioAsync.when(
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(
          message: e.toString(),
          onRetry: () =>
              ref.read(portfolioViewModelProvider.notifier).refresh(),
        ),
        data: (portfolio) =>
            _SpecialistProfileScreen(portfolio: portfolio, user: user, ref: ref),
      ),
    );
  }
}

// ─── Especialista — Perfil próprio ───────────────────────────────────────────

class _SpecialistProfileScreen extends StatelessWidget {
  final PortfolioModel portfolio;
  final dynamic user;
  final WidgetRef ref;
  const _SpecialistProfileScreen({
    required this.portfolio,
    required this.user,
    required this.ref,
  });

  @override
  Widget build(BuildContext context) {
    final initial =
        (user?.name ?? 'U').isNotEmpty ? (user?.name as String)[0].toUpperCase() : 'U';

    return CustomScrollView(
      slivers: [
        // ─── Hero header ─────────────────────────────────────────────────
        SliverAppBar(
          expandedHeight: 220,
          pinned: true,
          backgroundColor: AppTheme.slate900,
          surfaceTintColor: Colors.transparent,
          iconTheme: const IconThemeData(color: Colors.white),
          actions: [
            IconButton(
              icon: const Icon(Icons.edit_outlined, color: Colors.white),
              tooltip: 'Editar bio',
              onPressed: () => _showEditBioDialog(context, portfolio.bio),
            ),
            IconButton(
              icon: const Icon(Icons.logout, color: Colors.white),
              tooltip: 'Sair',
              onPressed: () async {
                await ref.read(authViewModelProvider.notifier).logout();
                if (context.mounted) context.go('/login');
              },
            ),
          ],
          flexibleSpace: FlexibleSpaceBar(
            background: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [AppTheme.slate900, Color(0xFF1E1B4B)],
                ),
              ),
              child: SafeArea(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(height: 48),
                    // Avatar
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                        ),
                        borderRadius: BorderRadius.circular(22),
                      ),
                      child: Center(
                        child: Text(
                          initial,
                          style: GoogleFonts.plusJakartaSans(
                            color: Colors.white,
                            fontSize: 30,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      user?.name ?? '',
                      style: GoogleFonts.plusJakartaSans(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.star_rounded,
                            color: Colors.amber, size: 16),
                        const SizedBox(width: 4),
                        Text(
                          portfolio.rating.toStringAsFixed(1),
                          style: GoogleFonts.plusJakartaSans(
                            color: Colors.white.withOpacity(0.8),
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Container(
                            width: 1, height: 12,
                            color: Colors.white24),
                        const SizedBox(width: 12),
                        Text(
                          '${portfolio.completedProjects} projetos',
                          style: GoogleFonts.plusJakartaSans(
                            color: Colors.white.withOpacity(0.8),
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),

        // ─── Stats row ───────────────────────────────────────────────────
        SliverToBoxAdapter(
          child: Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Row(
              children: [
                _StatItem(
                  value: portfolio.completedProjects.toString(),
                  label: 'Concluídos',
                  icon: Icons.check_circle_outline_rounded,
                ),
                Container(width: 1, height: 40, color: AppTheme.slate200),
                _StatItem(
                  value: portfolio.rating.toStringAsFixed(1),
                  label: 'Avaliação',
                  icon: Icons.star_outline_rounded,
                  iconColor: Colors.amber,
                ),
                Container(width: 1, height: 40, color: AppTheme.slate200),
                _StatItem(
                  value: portfolio.skills.length.toString(),
                  label: 'Habilidades',
                  icon: Icons.psychology_outlined,
                ),
              ],
            ),
          ),
        ),

        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 120),
          sliver: SliverList(
            delegate: SliverChildListDelegate([
              // ─── Bio ─────────────────────────────────────────────────
              _SectionHeader(
                icon: Icons.person_outline_rounded,
                title: 'Sobre mim',
                action: TextButton.icon(
                  onPressed: () =>
                      _showEditBioDialog(context, portfolio.bio),
                  icon: const Icon(Icons.edit_outlined, size: 14),
                  label: const Text('Editar', style: TextStyle(fontSize: 13)),
                ),
              ),
              const SizedBox(height: 10),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: _cardDecoration(),
                child: Text(
                  portfolio.bio.isNotEmpty
                      ? portfolio.bio
                      : 'Adicione uma bio para se apresentar às empresas.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: portfolio.bio.isNotEmpty
                            ? AppTheme.slate700
                            : AppTheme.slate400,
                        height: 1.6,
                      ),
                ),
              ),

              // ─── Habilidades ─────────────────────────────────────────
              const SizedBox(height: 24),
              _SectionHeader(
                icon: Icons.code_rounded,
                title: 'Habilidades',
                action: IconButton(
                  icon: const Icon(Icons.add_circle_outline_rounded, size: 20),
                  color: AppTheme.brand,
                  tooltip: 'Adicionar habilidade',
                  onPressed: () => _showAddSkillDialog(context),
                ),
              ),
              const SizedBox(height: 10),
              if (portfolio.skills.isEmpty)
                _EmptySectionHint('Adicione suas habilidades técnicas')
              else
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: portfolio.skills.map((s) {
                    return Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppTheme.brandLight,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                            color: AppTheme.brand.withOpacity(0.2)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.circle,
                              size: 6, color: AppTheme.brand),
                          const SizedBox(width: 6),
                          Text(
                            s,
                            style: const TextStyle(
                              color: AppTheme.brand,
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),

              // ─── Certificações ───────────────────────────────────────
              const SizedBox(height: 24),
              _SectionHeader(
                icon: Icons.verified_outlined,
                title: 'Certificações',
                action: IconButton(
                  icon: const Icon(Icons.add_circle_outline_rounded, size: 20),
                  color: AppTheme.brand,
                  tooltip: 'Adicionar certificação',
                  onPressed: () => _showAddCertDialog(context),
                ),
              ),
              const SizedBox(height: 10),
              if (portfolio.certifications.isEmpty)
                _EmptySectionHint('Adicione certificados e cursos relevantes')
              else
                ...portfolio.certifications.map((c) => Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(14),
                      decoration: _cardDecoration(),
                      child: Row(
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: const Color(0xFFEFF6FF),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.verified_rounded,
                                color: Color(0xFF3B82F6), size: 22),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  c.title,
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 14),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '${c.institution} · ${c.issuedAt.substring(0, 10)}',
                                  style: TextStyle(
                                      color: AppTheme.slate500,
                                      fontSize: 12),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    )),

              // ─── Avaliações ──────────────────────────────────────────
              if (portfolio.reviews.isNotEmpty) ...[
                const SizedBox(height: 24),
                _SectionHeader(
                  icon: Icons.star_outline_rounded,
                  title: 'Avaliações',
                ),
                const SizedBox(height: 10),
                ...portfolio.reviews.map((r) => Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(14),
                      decoration: _cardDecoration(),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  r.reviewerName,
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 14),
                                ),
                              ),
                              Row(
                                children: List.generate(
                                  5,
                                  (i) => Icon(
                                    i < r.rating.round()
                                        ? Icons.star_rounded
                                        : Icons.star_outline_rounded,
                                    color: Colors.amber,
                                    size: 16,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          if (r.comment.isNotEmpty) ...[
                            const SizedBox(height: 6),
                            Text(
                              r.comment,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(
                                      color: AppTheme.slate500, height: 1.5),
                            ),
                          ],
                        ],
                      ),
                    )),
              ],

              // ─── Histórico profissional ───────────────────────────────
              if (portfolio.workHistory.isNotEmpty) ...[
                const SizedBox(height: 24),
                _SectionHeader(
                  icon: Icons.work_history_outlined,
                  title: 'Histórico profissional',
                ),
                const SizedBox(height: 10),
                ...portfolio.workHistory.map((h) => Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      decoration: _cardDecoration(),
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 4),
                        leading: Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: AppTheme.slate100,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.business_rounded,
                              color: AppTheme.slate500, size: 20),
                        ),
                        title: Text(
                          h.projectTitle,
                          style: const TextStyle(
                              fontWeight: FontWeight.w600, fontSize: 14),
                        ),
                        subtitle: Text(
                          h.companyName,
                          style: TextStyle(
                            color: h.companyId != null
                                ? AppTheme.brand
                                : AppTheme.slate500,
                            fontSize: 12,
                          ),
                        ),
                        trailing: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              'R\$ ${h.earnedAmount.toStringAsFixed(0)}',
                              style: const TextStyle(
                                fontWeight: FontWeight.w700,
                                color: AppTheme.success,
                                fontSize: 14,
                              ),
                            ),
                            Text(
                              'recebido',
                              style: TextStyle(
                                  color: AppTheme.slate400, fontSize: 11),
                            ),
                          ],
                        ),
                        onTap: h.companyId != null
                            ? () => context.go('/company/${h.companyId}')
                            : null,
                      ),
                    )),
              ],
            ]),
          ),
        ),
      ],
    );
  }

  BoxDecoration _cardDecoration() => BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      );

  void _showEditBioDialog(BuildContext context, String currentBio) {
    final ctrl = TextEditingController(text: currentBio);
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Editar bio'),
        content: TextField(
          controller: ctrl,
          maxLines: 5,
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
              ref
                  .read(portfolioViewModelProvider.notifier)
                  .updateBio(ctrl.text);
              Navigator.pop(context);
            },
            child: const Text('Salvar'),
          ),
        ],
      ),
    ).whenComplete(ctrl.dispose);
  }

  void _showAddSkillDialog(BuildContext context) {
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

  void _showAddCertDialog(BuildContext context) {
    final titleCtrl = TextEditingController();
    final instCtrl = TextEditingController();
    final urlCtrl = TextEditingController();

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
                  labelText: 'Título', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: instCtrl,
              decoration: const InputDecoration(
                  labelText: 'Instituição', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: urlCtrl,
              decoration: const InputDecoration(
                  labelText: 'URL (opcional)',
                  border: OutlineInputBorder()),
            ),
          ],
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancelar')),
          FilledButton(
            onPressed: () {
              ref
                  .read(portfolioViewModelProvider.notifier)
                  .addCertification(
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
    ).whenComplete(() {
      titleCtrl.dispose();
      instCtrl.dispose();
      urlCtrl.dispose();
    });
  }
}

// ─── Empresa — Perfil próprio ─────────────────────────────────────────────────

class _CompanyOwnProfileScreen extends ConsumerWidget {
  final dynamic user;
  const _CompanyOwnProfileScreen({required this.user});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final name = (user?.name ?? 'Empresa') as String;
    final email = (user?.email ?? '') as String;
    final initial =
        name.isNotEmpty ? name[0].toUpperCase() : 'E';

    return CustomScrollView(
      slivers: [
        // ─── Hero header ─────────────────────────────────────────────────
        SliverAppBar(
          expandedHeight: 220,
          pinned: true,
          backgroundColor: AppTheme.slate900,
          surfaceTintColor: Colors.transparent,
          automaticallyImplyLeading: false,
          iconTheme: const IconThemeData(color: Colors.white),
          actions: [
            IconButton(
              icon: const Icon(Icons.logout, color: Colors.white),
              tooltip: 'Sair',
              onPressed: () async {
                await ref.read(authViewModelProvider.notifier).logout();
                if (context.mounted) context.go('/login');
              },
            ),
          ],
          flexibleSpace: FlexibleSpaceBar(
            background: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [AppTheme.slate900, Color(0xFF1E1B4B)],
                ),
              ),
              child: SafeArea(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(height: 48),
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                        ),
                        borderRadius: BorderRadius.circular(22),
                      ),
                      child: Center(
                        child: Text(
                          initial,
                          style: GoogleFonts.plusJakartaSans(
                            color: Colors.white,
                            fontSize: 30,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      name,
                      style: GoogleFonts.plusJakartaSans(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      email,
                      style: GoogleFonts.plusJakartaSans(
                        color: Colors.white.withOpacity(0.55),
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),

        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
          sliver: SliverList(
            delegate: SliverChildListDelegate([
              // ─── Atalhos rápidos ────────────────────────────────────
              _SectionHeader(
                icon: Icons.grid_view_rounded,
                title: 'Acesso rápido',
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _QuickCard(
                      icon: Icons.folder_open_rounded,
                      label: 'Meus Projetos',
                      subtitle: 'Gerenciar',
                      color: AppTheme.brand,
                      onTap: () => context.go('/projects'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _QuickCard(
                      icon: Icons.add_circle_outline_rounded,
                      label: 'Novo Projeto',
                      subtitle: 'Criar',
                      color: AppTheme.success,
                      onTap: () => context.go('/projects/create'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _QuickCard(
                      icon: Icons.payments_outlined,
                      label: 'Pagamentos',
                      subtitle: 'Ver histórico',
                      color: const Color(0xFFF59E0B),
                      onTap: () => context.go('/payments'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Placeholder para funcionalidade futura
                  Expanded(
                    child: _QuickCard(
                      icon: Icons.group_outlined,
                      label: 'Especialistas',
                      subtitle: 'Explorar perfis',
                      color: const Color(0xFF8B5CF6),
                      onTap: () => context.go('/specialists'),
                    ),
                  ),
                ],
              ),

              // ─── Info da conta ──────────────────────────────────────
              const SizedBox(height: 28),
              _SectionHeader(
                icon: Icons.business_rounded,
                title: 'Informações da conta',
              ),
              const SizedBox(height: 12),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    _InfoTile(
                      icon: Icons.badge_outlined,
                      label: 'Tipo de conta',
                      value: 'Empresa',
                    ),
                    const Divider(height: 1, indent: 56, endIndent: 16),
                    _InfoTile(
                      icon: Icons.email_outlined,
                      label: 'E-mail',
                      value: email,
                    ),
                  ],
                ),
              ),
            ]),
          ),
        ),
      ],
    );
  }
}

// ─── Sub-widgets compartilhados ───────────────────────────────────────────────

class _StatItem extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;
  final Color? iconColor;
  const _StatItem({
    required this.value,
    required this.label,
    required this.icon,
    this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 16, color: iconColor ?? AppTheme.brand),
              const SizedBox(width: 4),
              Text(
                value,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.slate900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 11,
              color: AppTheme.slate400,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final IconData icon;
  final String title;
  final Widget? action;
  const _SectionHeader({
    required this.icon,
    required this.title,
    this.action,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppTheme.brand),
        const SizedBox(width: 6),
        Text(
          title,
          style: GoogleFonts.plusJakartaSans(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: AppTheme.slate700,
          ),
        ),
        if (action != null) ...[
          const Spacer(),
          action!,
        ],
      ],
    );
  }
}

class _EmptySectionHint extends StatelessWidget {
  final String message;
  const _EmptySectionHint(this.message);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.slate50,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
            color: AppTheme.slate200, style: BorderStyle.solid),
      ),
      child: Text(
        message,
        style: TextStyle(color: AppTheme.slate400, fontSize: 13),
        textAlign: TextAlign.center,
      ),
    );
  }
}

class _QuickCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;
  const _QuickCard({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(height: 10),
            Text(
              label,
              style: const TextStyle(
                  fontWeight: FontWeight.w700, fontSize: 13),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: TextStyle(
                  color: AppTheme.slate400,
                  fontSize: 11),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoTile({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, size: 20, color: AppTheme.brand),
      title: Text(label,
          style: const TextStyle(fontSize: 12, color: AppTheme.slate400)),
      subtitle: Text(
        value,
        style: const TextStyle(
          color: AppTheme.slate900,
          fontWeight: FontWeight.w500,
          fontSize: 14,
        ),
      ),
      dense: true,
    );
  }
}
