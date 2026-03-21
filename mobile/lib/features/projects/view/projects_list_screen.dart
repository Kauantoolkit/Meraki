import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../features/auth/viewmodel/auth_viewmodel.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
import '../model/project_model.dart';
import '../viewmodel/projects_viewmodel.dart';

class ProjectsListScreen extends ConsumerStatefulWidget {
  const ProjectsListScreen({super.key});

  @override
  ConsumerState<ProjectsListScreen> createState() => _ProjectsListScreenState();
}

class _ProjectsListScreenState extends ConsumerState<ProjectsListScreen> {
  String? _statusFilter;

  static const _filterOptions = [
    (value: null, label: 'Todos'),
    (value: 'OPEN', label: 'Abertos'),
    (value: 'IN_PROGRESS', label: 'Em andamento'),
    (value: 'COMPLETED', label: 'Concluídos'),
  ];

  @override
  Widget build(BuildContext context) {
    final projectsAsync = ref.watch(projectsViewModelProvider);
    final user = ref.watch(authViewModelProvider).user;
    final isCompany = user?.isCompany ?? false;

    final filterLabel = _filterOptions
        .firstWhere((o) => o.value == _statusFilter,
            orElse: () => _filterOptions.first)
        .label;

    return Scaffold(
      appBar: AppBar(
        title: Text(isCompany ? 'Meus Projetos' : 'Projetos disponíveis'),
        actions: [
          PopupMenuButton<String?>(
            icon: Badge(
              isLabelVisible: _statusFilter != null,
              child: const Icon(Icons.filter_list),
            ),
            tooltip: 'Filtrar por status ($filterLabel)',
            onSelected: (v) {
              setState(() => _statusFilter = v);
              ref.read(projectsViewModelProvider.notifier).filterByStatus(v);
            },
            itemBuilder: (_) => _filterOptions
                .map((o) => PopupMenuItem(
                      value: o.value,
                      child: Row(
                        children: [
                          if (_statusFilter == o.value)
                            const Icon(Icons.check, size: 18)
                          else
                            const SizedBox(width: 18),
                          const SizedBox(width: 8),
                          Text(o.label),
                        ],
                      ),
                    ))
                .toList(),
          ),
        ],
      ),
      body: projectsAsync.when(
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(
          message: e.toString(),
          onRetry: () => ref.read(projectsViewModelProvider.notifier).refresh(),
        ),
        data: (projects) => projects.isEmpty
            ? _EmptyState(isCompany: isCompany)
            : RefreshIndicator(
                onRefresh: () =>
                    ref.read(projectsViewModelProvider.notifier).refresh(),
                child: ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: projects.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (_, i) =>
                      _ProjectCard(project: projects[i], user: user),
                ),
              ),
      ),
      floatingActionButton: isCompany
          ? FloatingActionButton.extended(
              onPressed: () => context.go('/projects/create'),
              icon: const Icon(Icons.add),
              label: const Text('Novo projeto'),
            )
          : null,
    );
  }
}

class _EmptyState extends StatelessWidget {
  final bool isCompany;
  const _EmptyState({required this.isCompany});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isCompany ? Icons.folder_open : Icons.search_off,
              size: 72,
              color: Theme.of(context).colorScheme.outline,
            ),
            const SizedBox(height: 16),
            Text(
              isCompany
                  ? 'Você ainda não criou nenhum projeto'
                  : 'Nenhum projeto encontrado',
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              isCompany
                  ? 'Crie seu primeiro projeto e receba propostas de especialistas'
                  : 'Tente outro filtro ou volte mais tarde',
              style: TextStyle(color: Theme.of(context).colorScheme.outline),
              textAlign: TextAlign.center,
            ),
            if (isCompany) ...[
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: () => context.go('/projects/create'),
                icon: const Icon(Icons.add),
                label: const Text('Criar projeto'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ProjectCard extends StatelessWidget {
  final ProjectModel project;
  final dynamic user;
  const _ProjectCard({required this.project, required this.user});

  Color _statusColor() => switch (project.status) {
        'OPEN' => Colors.green,
        'IN_PROGRESS' => Colors.blue,
        'COMPLETED' => Colors.grey,
        _ => Colors.orange,
      };

  String _statusLabel() => switch (project.status) {
        'OPEN' => 'Aberto',
        'IN_PROGRESS' => 'Em andamento',
        'COMPLETED' => 'Concluído',
        'CANCELLED' => 'Cancelado',
        _ => project.status,
      };

  @override
  Widget build(BuildContext context) {
    final isSpecialist = user?.isSpecialist == true;
    final isCompany = user?.isCompany == true;
    final isAssigned = project.specialistId == user?.id;
    final isOpen = project.status == 'OPEN';
    final isInProgress = project.status == 'IN_PROGRESS';
    final color = _statusColor();

    return Card(
      child: InkWell(
        onTap: () => context.go('/projects/${project.id}'),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ─── Título + status ──────────────────────────────────
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      project.title,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: color.withOpacity(0.4)),
                    ),
                    child: Text(
                      _statusLabel(),
                      style: TextStyle(
                          color: color,
                          fontSize: 11,
                          fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                project.description,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant),
              ),
              const SizedBox(height: 12),

              // ─── Métricas ─────────────────────────────────────────
              Wrap(
                spacing: 12,
                runSpacing: 4,
                children: [
                  _MetaChip(
                    icon: Icons.attach_money,
                    label: 'R\$ ${project.budget.toStringAsFixed(0)}',
                  ),
                  _MetaChip(
                    icon: Icons.calendar_today,
                    label: project.deadline.substring(0, 10),
                  ),
                  if (project.milestones.isNotEmpty)
                    _MetaChip(
                      icon: Icons.flag_outlined,
                      label: '${project.milestones.length} milestones',
                    ),
                ],
              ),

              // ─── Ações rápidas ────────────────────────────────────
              if ((isSpecialist && isOpen) ||
                  (isSpecialist && isAssigned && isInProgress) ||
                  (isCompany && (isOpen || isInProgress))) ...[
                const SizedBox(height: 12),
                const Divider(height: 1),
                const SizedBox(height: 8),
                Row(
                  children: [
                    if (isSpecialist && isOpen)
                      _QuickAction(
                        icon: Icons.send_outlined,
                        label: 'Propor',
                        onTap: () =>
                            context.go('/projects/${project.id}/bid'),
                      ),
                    if (isSpecialist && isAssigned && isInProgress)
                      _QuickAction(
                        icon: Icons.view_kanban_outlined,
                        label: 'Kanban',
                        onTap: () =>
                            context.go('/projects/${project.id}/kanban'),
                      ),
                    if (isCompany && isOpen)
                      _QuickAction(
                        icon: Icons.group_outlined,
                        label: 'Ver propostas',
                        onTap: () =>
                            context.go('/projects/${project.id}/bids'),
                      ),
                    if (isCompany && isInProgress)
                      _QuickAction(
                        icon: Icons.view_kanban_outlined,
                        label: 'Kanban',
                        onTap: () =>
                            context.go('/projects/${project.id}/kanban'),
                      ),
                  ],
                ),
              ],
            ],
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
        Icon(icon,
            size: 14, color: Theme.of(context).colorScheme.outline),
        const SizedBox(width: 4),
        Text(label,
            style: Theme.of(context)
                .textTheme
                .bodySmall
                ?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant)),
      ],
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _QuickAction(
      {required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon,
                  size: 16, color: Theme.of(context).colorScheme.primary),
              const SizedBox(width: 4),
              Text(
                label,
                style: TextStyle(
                    color: Theme.of(context).colorScheme.primary,
                    fontSize: 13,
                    fontWeight: FontWeight.w500),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
