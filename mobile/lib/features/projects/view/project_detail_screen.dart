import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../features/auth/viewmodel/auth_viewmodel.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
import '../model/project_model.dart';
import '../viewmodel/projects_viewmodel.dart';

class ProjectDetailScreen extends ConsumerStatefulWidget {
  final String projectId;
  const ProjectDetailScreen({super.key, required this.projectId});

  @override
  ConsumerState<ProjectDetailScreen> createState() => _ProjectDetailScreenState();
}

class _ProjectDetailScreenState extends ConsumerState<ProjectDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(projectDetailViewModelProvider.notifier).load(widget.projectId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final projectAsync = ref.watch(projectDetailViewModelProvider);
    final user = ref.watch(authViewModelProvider).user;
    final project = projectAsync.valueOrNull;

    final isSpecialist = user?.isSpecialist == true;
    final isCompany = user?.isCompany == true;
    final isOpen = project?.status == 'OPEN';
    final isAssigned = project != null && project.specialistId == user?.id;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Projeto'),
        actions: [
          if (projectAsync.hasValue) ...[
            if (isSpecialist && isOpen)
              TextButton.icon(
                onPressed: () =>
                    context.go('/projects/${widget.projectId}/bid'),
                icon: const Icon(Icons.send_outlined),
                label: const Text('Propor'),
              ),
            if (isSpecialist && isAssigned)
              TextButton.icon(
                onPressed: () =>
                    context.go('/projects/${widget.projectId}/kanban'),
                icon: const Icon(Icons.view_kanban_outlined),
                label: const Text('Kanban'),
              ),
            if (isCompany && (isOpen || project?.status == 'IN_PROGRESS'))
              TextButton.icon(
                onPressed: () =>
                    context.go('/projects/${widget.projectId}/bids'),
                icon: const Icon(Icons.group_outlined),
                label: const Text('Propostas'),
              ),
          ],
        ],
      ),
      body: projectAsync.when(
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(
          message: e.toString(),
          onRetry: () => ref
              .read(projectDetailViewModelProvider.notifier)
              .load(widget.projectId),
        ),
        data: (project) => _ProjectContent(project: project, user: user),
      ),
    );
  }
}

class _ProjectContent extends ConsumerWidget {
  final ProjectModel project;
  final dynamic user;
  const _ProjectContent({required this.project, required this.user});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statusColor = switch (project.status) {
      'OPEN' => Colors.green,
      'IN_PROGRESS' => Colors.blue,
      'COMPLETED' => Colors.grey,
      _ => Colors.orange,
    };
    final statusLabel = switch (project.status) {
      'OPEN' => 'Aberto',
      'IN_PROGRESS' => 'Em andamento',
      'COMPLETED' => 'Concluído',
      _ => project.status,
    };

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ─── Header ───────────────────────────────────────────────────
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  project.title,
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
              ),
              const SizedBox(width: 8),
              Chip(
                label: Text(statusLabel),
                labelStyle: TextStyle(color: statusColor, fontSize: 12),
                side: BorderSide(color: statusColor),
                backgroundColor: Colors.transparent,
              ),
            ],
          ),
          const SizedBox(height: 12),
          _InfoRow(
            Icons.attach_money,
            'R\$ ${project.budget.toStringAsFixed(2)}',
            label: 'Orçamento',
          ),
          _InfoRow(
            Icons.calendar_today,
            project.deadline.substring(0, 10),
            label: 'Prazo',
          ),
          if (project.specialistId != null)
            _InfoRow(
              Icons.person_outline,
              'Especialista contratado',
              label: 'Status',
            ),

          // ─── Descrição ────────────────────────────────────────────────
          const SizedBox(height: 20),
          Text('Descrição', style: Theme.of(context).textTheme.titleMedium),
          const Divider(height: 12),
          Text(project.description,
              style: Theme.of(context).textTheme.bodyMedium),

          // ─── Requisitos ───────────────────────────────────────────────
          if (project.requirements.isNotEmpty) ...[
            const SizedBox(height: 20),
            Text('Requisitos', style: Theme.of(context).textTheme.titleMedium),
            const Divider(height: 12),
            ...project.requirements.map(
              (r) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 3),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.check_circle_outline,
                        size: 16,
                        color: Theme.of(context).colorScheme.primary),
                    const SizedBox(width: 8),
                    Expanded(child: Text(r)),
                  ],
                ),
              ),
            ),
          ],

          // ─── Milestones ───────────────────────────────────────────────
          if (project.milestones.isNotEmpty) ...[
            const SizedBox(height: 24),
            Text('Milestones', style: Theme.of(context).textTheme.titleMedium),
            const Divider(height: 12),
            ...project.milestones.map(
              (m) => _MilestoneTile(milestone: m, project: project, user: user),
            ),
          ],
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  const _InfoRow(this.icon, this.value, {required this.label});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 16, color: Theme.of(context).colorScheme.outline),
          const SizedBox(width: 6),
          Text(label,
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(color: Theme.of(context).colorScheme.outline)),
          const SizedBox(width: 6),
          Text(value,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

class _MilestoneTile extends ConsumerWidget {
  final MilestoneModel milestone;
  final ProjectModel project;
  final dynamic user;
  const _MilestoneTile(
      {required this.milestone, required this.project, required this.user});

  Color _statusColor() => switch (milestone.status) {
        'APPROVED' => Colors.green,
        'IN_PROGRESS' => Colors.blue,
        'SUBMITTED' => Colors.orange,
        'REJECTED' => Colors.red,
        _ => Colors.grey,
      };

  String _statusLabel() => switch (milestone.status) {
        'APPROVED' => 'Aprovado',
        'IN_PROGRESS' => 'Em andamento',
        'SUBMITTED' => 'Enviado',
        'REJECTED' => 'Rejeitado',
        'PENDING' => 'Pendente',
        _ => milestone.status,
      };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final action = _buildAction(context, ref);
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: _statusColor(),
              child: Text(
                '${milestone.order}',
                style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 13),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(milestone.title,
                      style:
                          const TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Text(
                        'R\$ ${milestone.value.toStringAsFixed(2)}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: _statusColor().withOpacity(0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          _statusLabel(),
                          style: TextStyle(
                              color: _statusColor(), fontSize: 11),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            if (action != null) action,
          ],
        ),
      ),
    );
  }

  Widget? _buildAction(BuildContext context, WidgetRef ref) {
    final isSpecialist = user?.isSpecialist == true;
    final isCompany = user?.isCompany == true;
    final isAssigned = project.specialistId == user?.id;

    if (isSpecialist && isAssigned && milestone.status == 'IN_PROGRESS') {
      return FilledButton.tonal(
        onPressed: () => context.go(
          '/projects/${project.id}/milestones/${milestone.id}/deliver',
        ),
        child: const Text('Entregar'),
      );
    }
    if (isCompany && milestone.status == 'SUBMITTED') {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            icon: const Icon(Icons.check_circle, color: Colors.green),
            tooltip: 'Aprovar',
            onPressed: () => ref
                .read(projectDetailViewModelProvider.notifier)
                .updateMilestone(milestone.id, 'approve'),
          ),
          IconButton(
            icon: const Icon(Icons.cancel, color: Colors.red),
            tooltip: 'Rejeitar',
            onPressed: () => ref
                .read(projectDetailViewModelProvider.notifier)
                .updateMilestone(milestone.id, 'reject'),
          ),
        ],
      );
    }
    return null;
  }
}
