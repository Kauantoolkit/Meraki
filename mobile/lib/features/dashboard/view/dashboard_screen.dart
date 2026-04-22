import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../features/auth/viewmodel/auth_viewmodel.dart';
import '../viewmodel/dashboard_viewmodel.dart';
import '../../projects/model/project_model.dart';

final _brl = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authViewModelProvider).user;
    final isCompany = user?.userType == 'COMPANY';

    return isCompany
        ? const _CompanyDashboard()
        : const _SpecialistDashboard();
  }
}

// ─── Company Dashboard ────────────────────────────────────────────────────────

class _CompanyDashboard extends ConsumerWidget {
  const _CompanyDashboard();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authViewModelProvider).user;
    final statsAsync = ref.watch(dashboardViewModelProvider);

    return Scaffold(
      backgroundColor: AppTheme.slate900,
      body: RefreshIndicator(
        color: AppTheme.brand,
        onRefresh: () => ref.read(dashboardViewModelProvider.notifier).refresh(),
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              pinned: true,
              backgroundColor: AppTheme.slate900,
              surfaceTintColor: Colors.transparent,
              title: RichText(
                text: TextSpan(
                  style: GoogleFonts.sourceCodePro(
                      fontSize: 13, color: AppTheme.slate500),
                  children: [
                    const TextSpan(text: 'MERAKI // '),
                    TextSpan(
                      text: 'MEUS PROJETOS',
                      style: GoogleFonts.sourceCodePro(
                          fontSize: 13,
                          color: Colors.white,
                          fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.notifications_outlined),
                  onPressed: () => context.push('/notifications'),
                ),
                IconButton(
                  icon: const Icon(Icons.settings_outlined),
                  onPressed: () => context.push('/settings'),
                ),
              ],
            ),

            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'MEUS PROJETOS',
                      style: GoogleFonts.sourceCodePro(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${user?.name ?? 'Empresa'} · gerencie milestones e acompanhe entregas.',
                      style: GoogleFonts.sourceCodePro(
                          color: AppTheme.slate500, fontSize: 11),
                    ),
                  ],
                ),
              ),
            ),

            statsAsync.when(
              loading: () => const SliverFillRemaining(
                child: Center(
                    child: CircularProgressIndicator(color: AppTheme.brand)),
              ),
              error: (e, _) => SliverFillRemaining(
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.error_outline,
                          color: AppTheme.danger, size: 40),
                      const SizedBox(height: 12),
                      Text('Erro ao carregar',
                          style: AppTheme.mono(color: AppTheme.slate500)),
                      const SizedBox(height: 8),
                      FilledButton(
                        onPressed: () =>
                            ref.read(dashboardViewModelProvider.notifier).refresh(),
                        child: const Text('Tentar novamente'),
                      ),
                    ],
                  ),
                ),
              ),
              data: (stats) => SliverList(
                delegate: SliverChildListDelegate([
                  // ── Stats row ──────────────────────────────────────────
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
                    child: Row(
                      children: [
                        Expanded(
                          child: _StatBox(
                            label: 'PROJETOS ATIVOS',
                            value: stats.inProgress.toString().padLeft(2, '0'),
                            icon: Icons.rocket_launch_outlined,
                            color: AppTheme.brand,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _StatBox(
                            label: 'AGUARDANDO PROPOSTAS',
                            value: stats.open.toString().padLeft(2, '0'),
                            icon: Icons.inbox_outlined,
                            color: AppTheme.info,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _StatBox(
                            label: 'ORÇAMENTO',
                            value: 'R\$ ${(stats.escrowBalance / 1000).toStringAsFixed(0)}k',
                            icon: Icons.lock_outline_rounded,
                            color: AppTheme.warning,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // ── Quick actions ──────────────────────────────────────
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                    child: Row(
                      children: [
                        Expanded(
                          child: _ActionButton(
                            label: '+ CRIAR PROJETO',
                            onTap: () => context.push('/projects/create'),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _ActionButton(
                            label: 'VER TALENTOS',
                            onTap: () => context.push('/specialists'),
                            outlined: true,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // ── Section header ─────────────────────────────────────
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 28, 16, 12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.chevron_right,
                                size: 14, color: AppTheme.brand),
                            const SizedBox(width: 4),
                            Text(
                              'PROJETOS RECENTES',
                              style: GoogleFonts.sourceCodePro(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 1.5,
                              ),
                            ),
                          ],
                        ),
                        GestureDetector(
                          onTap: () => context.go('/projects'),
                          child: Text(
                            'VER TODOS →',
                            style: GoogleFonts.sourceCodePro(
                                color: AppTheme.brand,
                                fontSize: 10,
                                letterSpacing: 1),
                          ),
                        ),
                      ],
                    ),
                  ),

                  if (stats.projects.isEmpty)
                    _EmptyProjects(
                        onCreateProject: () =>
                            context.push('/projects/create'))
                  else
                    ...stats.projects.take(5).map((p) => Padding(
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                          child: _ProjectCard(project: p),
                        )),

                  const SizedBox(height: 100),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Specialist Dashboard ─────────────────────────────────────────────────────

class _SpecialistDashboard extends ConsumerWidget {
  const _SpecialistDashboard();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authViewModelProvider).user;
    final statsAsync = ref.watch(dashboardViewModelProvider);

    return Scaffold(
      backgroundColor: AppTheme.slate900,
      body: RefreshIndicator(
        color: AppTheme.brand,
        onRefresh: () => ref.read(dashboardViewModelProvider.notifier).refresh(),
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              pinned: true,
              backgroundColor: AppTheme.slate900,
              surfaceTintColor: Colors.transparent,
              title: RichText(
                text: TextSpan(
                  style: GoogleFonts.sourceCodePro(
                      fontSize: 13, color: AppTheme.slate500),
                  children: [
                    const TextSpan(text: 'MERAKI // '),
                    TextSpan(
                      text: 'TERMINAL',
                      style: GoogleFonts.sourceCodePro(
                          fontSize: 13,
                          color: Colors.white,
                          fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.notifications_outlined),
                  onPressed: () => context.push('/notifications'),
                ),
                IconButton(
                  icon: const Icon(Icons.settings_outlined),
                  onPressed: () => context.push('/settings'),
                ),
              ],
            ),

            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'TERMINAL DO ESPECIALISTA',
                      style: GoogleFonts.sourceCodePro(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Olá, ${user?.name.split(' ').first ?? 'Especialista'} · acompanhe e gerencie suas propostas submetidas.',
                      style: GoogleFonts.sourceCodePro(
                          color: AppTheme.slate500, fontSize: 11),
                    ),
                  ],
                ),
              ),
            ),

            statsAsync.when(
              loading: () => const SliverFillRemaining(
                child: Center(
                    child: CircularProgressIndicator(color: AppTheme.brand)),
              ),
              error: (e, _) => SliverFillRemaining(
                child: Center(
                  child: FilledButton(
                    onPressed: () =>
                        ref.read(dashboardViewModelProvider.notifier).refresh(),
                    child: const Text('Tentar novamente'),
                  ),
                ),
              ),
              data: (stats) => SliverList(
                delegate: SliverChildListDelegate([
                  // ── Stats row ──────────────────────────────────────────
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
                    child: Row(
                      children: [
                        Expanded(
                          child: _StatBox(
                            label: 'EM ANDAMENTO',
                            value: stats.inProgress.toString().padLeft(2, '0'),
                            icon: Icons.trending_up_rounded,
                            color: AppTheme.brand,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _StatBox(
                            label: 'PROPOSTAS',
                            value: stats.completed.toString().padLeft(2, '0'),
                            icon: Icons.description_outlined,
                            color: AppTheme.info,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _StatBox(
                            label: 'GANHOS',
                            value: 'R\$ ${(stats.totalEarned / 1000).toStringAsFixed(1)}k',
                            icon: Icons.savings_outlined,
                            color: AppTheme.success,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // ── Quick action ───────────────────────────────────────
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                    child: _ActionButton(
                      label: '> PROCURAR PROJETOS',
                      onTap: () => context.push('/projects'),
                    ),
                  ),

                  // ── Opportunities ──────────────────────────────────────
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 28, 16, 12),
                    child: Row(
                      children: [
                        const Icon(Icons.chevron_right,
                            size: 14, color: AppTheme.brand),
                        const SizedBox(width: 4),
                        Text(
                          'OPORTUNIDADES E CONVITES',
                          style: GoogleFonts.sourceCodePro(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),

                  ...stats.projects
                      .where((p) => p.status == 'OPEN')
                      .take(3)
                      .map((p) => Padding(
                            padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                            child: _ProjectCard(project: p, showBidButton: true),
                          )),

                  if (stats.projects.where((p) => p.status == 'OPEN').isEmpty)
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
                      child: _EmptyCard(
                        icon: Icons.search_rounded,
                        label: 'Nenhuma oportunidade no momento',
                        action: 'EXPLORAR PROJETOS',
                        onTap: () => context.go('/projects'),
                      ),
                    ),

                  // ── Active work ────────────────────────────────────────
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
                    child: Row(
                      children: [
                        const Icon(Icons.chevron_right,
                            size: 14, color: AppTheme.brand),
                        const SizedBox(width: 4),
                        Text(
                          'TRABALHOS EM EXECUÇÃO (MILESTONES)',
                          style: GoogleFonts.sourceCodePro(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),

                  ...stats.projects
                      .where((p) => p.status == 'IN_PROGRESS')
                      .take(3)
                      .map((p) => Padding(
                            padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                            child: _ProjectCard(project: p),
                          )),

                  if (stats.projects
                      .where((p) => p.status == 'IN_PROGRESS')
                      .isEmpty)
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
                      child: _EmptyCard(
                        icon: Icons.work_outline_rounded,
                        label: 'Nenhum projeto ativo',
                        action: 'EXPLORAR PROJETOS',
                        onTap: () => context.go('/projects'),
                      ),
                    ),

                  const SizedBox(height: 100),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Shared widgets ───────────────────────────────────────────────────────────

class _StatBox extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _StatBox({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.slate100,
        border: Border.all(color: AppTheme.slate200),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(height: 8),
          Text(
            value,
            style: GoogleFonts.sourceCodePro(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: GoogleFonts.sourceCodePro(
                color: AppTheme.slate500, fontSize: 9, letterSpacing: 0.5),
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final bool outlined;

  const _ActionButton({
    required this.label,
    required this.onTap,
    this.outlined = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: outlined ? Colors.transparent : AppTheme.brand,
          border: Border.all(
              color: outlined ? AppTheme.slate200 : AppTheme.brand),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Center(
          child: Text(
            label,
            style: GoogleFonts.sourceCodePro(
              color: outlined ? AppTheme.slate400 : AppTheme.slate900,
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.5,
            ),
          ),
        ),
      ),
    );
  }
}

class _ProjectCard extends StatelessWidget {
  final ProjectModel project;
  final bool showBidButton;
  const _ProjectCard({required this.project, this.showBidButton = false});

  @override
  Widget build(BuildContext context) {
    final color = AppTheme.statusColor(project.status);
    final bg = AppTheme.statusBg(project.status);
    final label = AppTheme.statusLabel(project.status);

    return GestureDetector(
      onTap: () => context.push('/projects/${project.id}'),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppTheme.slate100,
          border: Border.all(color: AppTheme.slate200),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: bg,
                    borderRadius: BorderRadius.circular(2),
                    border: Border.all(color: color.withOpacity(0.3)),
                  ),
                  child: Text(
                    label,
                    style: GoogleFonts.sourceCodePro(
                        color: color,
                        fontSize: 9,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1),
                  ),
                ),
                const Spacer(),
                Text(
                  _brl.format(project.budget),
                  style: GoogleFonts.sourceCodePro(
                      color: AppTheme.brand,
                      fontSize: 12,
                      fontWeight: FontWeight.w700),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              project.title,
              style: GoogleFonts.sourceCodePro(
                color: Colors.white,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            if (showBidButton) ...[
              const SizedBox(height: 10),
              GestureDetector(
                onTap: () => context.push('/projects/${project.id}/bid'),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppTheme.brandLight,
                    border: Border.all(
                        color: AppTheme.brand.withOpacity(0.4)),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    'APLI. RÁPIDA',
                    style: GoogleFonts.sourceCodePro(
                        color: AppTheme.brand,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _EmptyCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String action;
  final VoidCallback onTap;

  const _EmptyCard({
    required this.icon,
    required this.label,
    required this.action,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppTheme.slate100,
        border: Border.all(color: AppTheme.slate200),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        children: [
          Icon(icon, color: AppTheme.slate500, size: 32),
          const SizedBox(height: 12),
          Text(
            label,
            style: GoogleFonts.sourceCodePro(
                color: AppTheme.slate500, fontSize: 12),
          ),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: onTap,
            child: Text(
              action,
              style: GoogleFonts.sourceCodePro(
                  color: AppTheme.brand,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1),
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyProjects extends StatelessWidget {
  final VoidCallback onCreateProject;
  const _EmptyProjects({required this.onCreateProject});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
      child: Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: AppTheme.slate100,
          border: Border.all(color: AppTheme.slate200),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Column(
          children: [
            const Icon(Icons.folder_open_rounded,
                color: AppTheme.slate500, size: 40),
            const SizedBox(height: 16),
            Text(
              'NENHUM PROJETO CRIADO',
              style: GoogleFonts.sourceCodePro(
                fontWeight: FontWeight.w700,
                fontSize: 13,
                color: Colors.white,
                letterSpacing: 1,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Crie seu primeiro projeto e comece\na contratar especialistas',
              style: GoogleFonts.sourceCodePro(
                  fontSize: 11, color: AppTheme.slate500, height: 1.5),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            GestureDetector(
              onTap: onCreateProject,
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 20, vertical: 10),
                decoration: BoxDecoration(
                  color: AppTheme.brand,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  '+ CRIAR PROJETO',
                  style: GoogleFonts.sourceCodePro(
                    color: AppTheme.slate900,
                    fontWeight: FontWeight.w700,
                    fontSize: 12,
                    letterSpacing: 1.5,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
