import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../features/auth/viewmodel/auth_viewmodel.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
import '../model/project_model.dart';
import '../viewmodel/projects_viewmodel.dart';

class ProjectsListScreen extends ConsumerStatefulWidget {
  const ProjectsListScreen({super.key});

  @override
  ConsumerState<ProjectsListScreen> createState() =>
      _ProjectsListScreenState();
}

class _ProjectsListScreenState extends ConsumerState<ProjectsListScreen> {
  String? _statusFilter;
  final _searchController = TextEditingController();
  String _searchQuery = '';
  bool _initialized = false;

  // Para empresa: começa sem filtro (ver todos os projetos delas)
  // Para especialista: começa em OPEN (descobrir oportunidades)
  static const _specialistFilters = [
    (value: 'OPEN', label: 'Abertos'),
    (value: null, label: 'Todos'),
    (value: 'IN_PROGRESS', label: 'Em andamento'),
    (value: 'COMPLETED', label: 'Concluídos'),
  ];

  static const _companyFilters = [
    (value: null, label: 'Todos'),
    (value: 'OPEN', label: 'Abertos'),
    (value: 'IN_PROGRESS', label: 'Em andamento'),
    (value: 'COMPLETED', label: 'Concluídos'),
  ];

  @override
  void initState() {
    super.initState();
    _searchController.addListener(
      () => setState(() => _searchQuery = _searchController.text),
    );
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_initialized) {
      _initialized = true;
      final user = ref.read(authViewModelProvider).user;
      if (user?.isSpecialist == true) {
        _statusFilter = 'OPEN';
        WidgetsBinding.instance.addPostFrameCallback((_) {
          ref
              .read(projectsViewModelProvider.notifier)
              .filterByStatus('OPEN');
        });
      }
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final projectsAsync = ref.watch(projectsViewModelProvider);
    final user = ref.watch(authViewModelProvider).user;
    final isCompany = user?.isCompany ?? false;
    final isSpecialist = user?.isSpecialist ?? false;
    final filters = isSpecialist ? _specialistFilters : _companyFilters;

    return Scaffold(
      body: projectsAsync.when(
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(
          message: e.toString(),
          onRetry: () =>
              ref.read(projectsViewModelProvider.notifier).refresh(),
        ),
        data: (projects) {
          // Filtro de busca client-side por título e descrição
          final filtered = _searchQuery.isEmpty
              ? projects
              : projects
                  .where((p) =>
                      p.title
                          .toLowerCase()
                          .contains(_searchQuery.toLowerCase()) ||
                      p.description
                          .toLowerCase()
                          .contains(_searchQuery.toLowerCase()))
                  .toList();

          return RefreshIndicator(
            onRefresh: () =>
                ref.read(projectsViewModelProvider.notifier).refresh(),
            child: CustomScrollView(
              slivers: [
                // ─── App bar ──────────────────────────────────────────────
                SliverAppBar.large(
                  title: Text(isCompany ? 'Meus Projetos' : 'Explorar'),
                  backgroundColor: AppTheme.slate100,
                  surfaceTintColor: Colors.transparent,
                  scrolledUnderElevation: 0,
                ),

                // ─── Search bar (especialista) ────────────────────────────
                if (isSpecialist)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
                      child: Container(
                        height: 48,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppTheme.slate200),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.04),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: TextField(
                          controller: _searchController,
                          style: const TextStyle(fontSize: 14, color: Colors.black87),
                          decoration: InputDecoration(
                            hintText: 'Buscar por título ou descrição...',
                            hintStyle: const TextStyle(
                              color: Color(0xFF9E9E9E),
                              fontSize: 14,
                            ),
                            prefixIcon: const Icon(
                              Icons.search_rounded,
                              size: 20,
                              color: Color(0xFF9E9E9E),
                            ),
                            filled: true,
                            fillColor: Colors.white,
                            suffixIcon: _searchQuery.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(
                                        Icons.close_rounded,
                                        size: 18),
                                    onPressed: _searchController.clear,
                                  )
                                : null,
                            border: InputBorder.none,
                            contentPadding:
                                const EdgeInsets.symmetric(vertical: 14),
                          ),
                        ),
                      ),
                    ),
                  ),

                // ─── Filter chips ─────────────────────────────────────────
                SliverToBoxAdapter(
                  child: SizedBox(
                    height: 46,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.fromLTRB(16, 4, 16, 4),
                      itemCount: filters.length,
                      separatorBuilder: (_, __) =>
                          const SizedBox(width: 8),
                      itemBuilder: (_, i) {
                        final f = filters[i];
                        final isSelected = _statusFilter == f.value;
                        return GestureDetector(
                          onTap: () {
                            setState(() => _statusFilter = f.value);
                            ref
                                .read(projectsViewModelProvider.notifier)
                                .filterByStatus(f.value);
                          },
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 180),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 6),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? AppTheme.brand
                                  : Colors.white,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: isSelected
                                    ? AppTheme.brand
                                    : AppTheme.slate200,
                              ),
                              boxShadow: isSelected
                                  ? [
                                      BoxShadow(
                                        color: AppTheme.brand
                                            .withOpacity(0.3),
                                        blurRadius: 8,
                                        offset: const Offset(0, 2),
                                      ),
                                    ]
                                  : null,
                            ),
                            child: Text(
                              f.label,
                              style: TextStyle(
                                color: isSelected
                                    ? Colors.white
                                    : AppTheme.slate700,
                                fontSize: 13,
                                fontWeight: isSelected
                                    ? FontWeight.w600
                                    : FontWeight.w400,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),

                const SliverToBoxAdapter(child: SizedBox(height: 8)),

                // ─── Lista de projetos ────────────────────────────────────
                if (filtered.isEmpty)
                  SliverFillRemaining(
                    child: _EmptyState(
                      isCompany: isCompany,
                      hasSearch: _searchQuery.isNotEmpty,
                    ),
                  )
                else
                  SliverPadding(
                    padding:
                        const EdgeInsets.fromLTRB(16, 0, 16, 100),
                    sliver: SliverList.separated(
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) =>
                          const SizedBox(height: 10),
                      itemBuilder: (_, i) => _ProjectCard(
                        project: filtered[i],
                        user: user,
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
      floatingActionButton: isCompany
          ? FloatingActionButton.extended(
              onPressed: () => context.go('/projects/create'),
              icon: const Icon(Icons.add_rounded),
              label: const Text('Novo projeto'),
            )
          : null,
    );
  }
}

// ─── Empty state ──────────────────────────────────────────────────────────────

class _EmptyState extends StatelessWidget {
  final bool isCompany;
  final bool hasSearch;
  const _EmptyState({required this.isCompany, required this.hasSearch});

  @override
  Widget build(BuildContext context) {
    final icon = hasSearch
        ? Icons.search_off_rounded
        : (isCompany ? Icons.folder_open_rounded : Icons.explore_off_rounded);
    final title = hasSearch
        ? 'Nenhum resultado encontrado'
        : (isCompany ? 'Nenhum projeto ainda' : 'Nenhuma oportunidade aberta');
    final subtitle = hasSearch
        ? 'Tente outras palavras-chave'
        : (isCompany
            ? 'Crie seu primeiro projeto e receba propostas de especialistas'
            : 'Novas oportunidades aparecerão aqui quando empresas publicarem projetos');

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppTheme.brandLight,
                borderRadius: BorderRadius.circular(24),
              ),
              child: Icon(icon, size: 40, color: AppTheme.brand),
            ),
            const SizedBox(height: 20),
            Text(
              title,
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(color: AppTheme.slate400),
              textAlign: TextAlign.center,
            ),
            if (isCompany && !hasSearch) ...[
              const SizedBox(height: 28),
              FilledButton.icon(
                onPressed: () => GoRouter.of(context).go('/projects/create'),
                icon: const Icon(Icons.add_rounded),
                label: const Text('Criar projeto'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ─── Project card ─────────────────────────────────────────────────────────────

class _ProjectCard extends StatelessWidget {
  final ProjectModel project;
  final dynamic user;
  const _ProjectCard({required this.project, required this.user});

  @override
  Widget build(BuildContext context) {
    final isSpecialist = user?.isSpecialist == true;
    final isCompany = user?.isCompany == true;
    final isAssigned = project.specialistId == user?.id;
    final isOpen = project.status == 'OPEN';
    final isInProgress = project.status == 'IN_PROGRESS';

    final statusColor = AppTheme.statusColor(project.status);
    final statusBg = AppTheme.statusBg(project.status);
    final statusLabel = AppTheme.statusLabel(project.status);

    final hasActions = (isSpecialist && isOpen) ||
        (isSpecialist && isAssigned && isInProgress) ||
        (isCompany && (isOpen || isInProgress));

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 28,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: () => context.go('/projects/${project.id}'),
          child: IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // ─── Accent strip ────────────────────────────────────
                Container(width: 4, color: statusColor),
                // ─── Content ─────────────────────────────────────────
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Título + badge de status
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Text(
                                project.title,
                                style: Theme.of(context)
                                    .textTheme
                                    .titleSmall
                                    ?.copyWith(
                                      color: AppTheme.slate900,
                                      height: 1.3,
                                    ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: statusBg,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                statusLabel,
                                style: TextStyle(
                                  color: statusColor,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          project.description,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(color: AppTheme.slate500),
                        ),
                        const SizedBox(height: 12),
                        // Meta info
                        Wrap(
                          spacing: 14,
                          runSpacing: 4,
                          children: [
                            _MetaChip(
                              icon: Icons.attach_money_rounded,
                              label:
                                  'R\$ ${project.budget.toStringAsFixed(0)}',
                            ),
                            _MetaChip(
                              icon: Icons.calendar_today_rounded,
                              label: project.deadline.substring(0, 10),
                            ),
                            if (project.milestones.isNotEmpty)
                              _MetaChip(
                                icon: Icons.flag_rounded,
                                label:
                                    '${project.milestones.length} milestones',
                              ),
                          ],
                        ),
                        // Ações contextuais
                        if (hasActions) ...[
                          const SizedBox(height: 12),
                          Container(height: 1, color: AppTheme.slate100),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              if (isSpecialist && isOpen)
                                _ActionButton(
                                  icon: Icons.send_rounded,
                                  label: 'Enviar proposta',
                                  onTap: () => context
                                      .go('/projects/${project.id}/bid'),
                                ),
                              if (isSpecialist && isAssigned && isInProgress)
                                _ActionButton(
                                  icon: Icons.view_kanban_rounded,
                                  label: 'Ver Kanban',
                                  onTap: () => context.go(
                                      '/projects/${project.id}/kanban'),
                                ),
                              if (isCompany && isOpen)
                                _ActionButton(
                                  icon: Icons.group_rounded,
                                  label: 'Ver propostas',
                                  onTap: () => context.go(
                                      '/projects/${project.id}/bids'),
                                ),
                              if (isCompany && isInProgress)
                                _ActionButton(
                                  icon: Icons.view_kanban_rounded,
                                  label: 'Kanban',
                                  onTap: () => context.go(
                                      '/projects/${project.id}/kanban'),
                                ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const _MetaChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: AppTheme.slate400),
        const SizedBox(width: 4),
        Text(
          label,
          style: Theme.of(context)
              .textTheme
              .bodySmall
              ?.copyWith(color: AppTheme.slate500),
        ),
      ],
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _ActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: AppTheme.brandLight,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 14, color: AppTheme.brand),
              const SizedBox(width: 5),
              Text(
                label,
                style: const TextStyle(
                  color: AppTheme.brand,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
