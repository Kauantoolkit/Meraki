import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../features/auth/viewmodel/auth_viewmodel.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
import '../model/project_model.dart';
import '../viewmodel/projects_viewmodel.dart';

class ProjectDetailScreen extends ConsumerStatefulWidget {
  final String projectId;
  const ProjectDetailScreen({super.key, required this.projectId});

  @override
  ConsumerState<ProjectDetailScreen> createState() =>
      _ProjectDetailScreenState();
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
    final isInProgress = project?.status == 'IN_PROGRESS';
    final isAssigned = project != null && project.specialistId == user?.id;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Projeto'),
        actions: [
          if (projectAsync.hasValue) ...[
            // ─── Histórico (RF11) ────────────────────────────────────
            if (isInProgress || project?.status == 'COMPLETED')
              IconButton(
                icon: const Icon(Icons.history_rounded),
                tooltip: 'Histórico de entregas',
                onPressed: () =>
                    context.go('/projects/${widget.projectId}/history'),
              ),
            if (isSpecialist && isOpen)
              TextButton.icon(
                onPressed: () =>
                    context.go('/projects/${widget.projectId}/bid'),
                icon: const Icon(Icons.send_rounded, size: 16),
                label: const Text('Propor'),
              ),
            if (isSpecialist && isAssigned)
              TextButton.icon(
                onPressed: () =>
                    context.go('/projects/${widget.projectId}/kanban'),
                icon: const Icon(Icons.view_kanban_rounded, size: 16),
                label: const Text('Kanban'),
              ),
            if (isCompany && (isOpen || isInProgress))
              TextButton.icon(
                onPressed: () =>
                    context.go('/projects/${widget.projectId}/bids'),
                icon: const Icon(Icons.group_rounded, size: 16),
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

// ─── Content ──────────────────────────────────────────────────────────────────

class _ProjectContent extends ConsumerWidget {
  final ProjectModel project;
  final dynamic user;
  const _ProjectContent({required this.project, required this.user});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statusColor = AppTheme.statusColor(project.status);
    final statusBg = AppTheme.statusBg(project.status);
    final statusLabel = AppTheme.statusLabel(project.status);

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ─── Header ──────────────────────────────────────────────────
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  project.title,
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
              ),
              const SizedBox(width: 10),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: statusBg,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  statusLabel,
                  style: TextStyle(
                    color: statusColor,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // ─── Meta info ───────────────────────────────────────────────
          Container(
            padding: const EdgeInsets.all(14),
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
                _InfoRow(
                  Icons.attach_money_rounded,
                  'R\$ ${project.budget.toStringAsFixed(2)}',
                  label: 'Orçamento',
                ),
                const Divider(height: 12),
                _InfoRow(
                  Icons.calendar_today_rounded,
                  project.deadline.substring(0, 10),
                  label: 'Prazo',
                ),
                if (project.specialistId != null) ...[
                  const Divider(height: 12),
                  _InfoRow(
                    Icons.person_rounded,
                    'Especialista contratado',
                    label: 'Status',
                    valueColor: AppTheme.success,
                  ),
                ],
              ],
            ),
          ),

          // ─── Descrição ───────────────────────────────────────────────
          const SizedBox(height: 24),
          _SectionTitle('Descrição'),
          const SizedBox(height: 8),
          Text(
            project.description,
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(color: AppTheme.slate700, height: 1.6),
          ),

          // ─── Requisitos ──────────────────────────────────────────────
          if (project.requirements.isNotEmpty) ...[
            const SizedBox(height: 24),
            _SectionTitle('Requisitos'),
            const SizedBox(height: 8),
            ...project.requirements.map(
              (r) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.check_circle_rounded,
                        size: 16, color: AppTheme.success),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(r,
                          style:
                              Theme.of(context).textTheme.bodyMedium),
                    ),
                  ],
                ),
              ),
            ),
          ],

          // ─── Milestones ──────────────────────────────────────────────
          if (project.milestones.isNotEmpty) ...[
            const SizedBox(height: 24),
            _SectionTitle('Milestones'),
            const SizedBox(height: 8),
            // Determina o índice da milestone desbloqueada (RN04)
            ...List.generate(project.milestones.length, (i) {
              final m = project.milestones[i];
              // Uma milestone está bloqueada se a anterior não foi aprovada
              final previousApproved = i == 0 ||
                  project.milestones[i - 1].status == 'APPROVED';
              return _MilestoneTile(
                milestone: m,
                project: project,
                user: user,
                isBlocked: !previousApproved,
              );
            }),
          ],
        ],
      ),
    );
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

class _SectionTitle extends StatelessWidget {
  final String text;
  const _SectionTitle(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: Theme.of(context)
          .textTheme
          .titleMedium
          ?.copyWith(color: AppTheme.slate900),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  final Color? valueColor;
  const _InfoRow(this.icon, this.value,
      {required this.label, this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 15, color: AppTheme.slate400),
        const SizedBox(width: 6),
        Text(label,
            style: Theme.of(context)
                .textTheme
                .bodySmall
                ?.copyWith(color: AppTheme.slate400)),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            value,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w500,
                  color: valueColor,
                ),
            textAlign: TextAlign.end,
          ),
        ),
      ],
    );
  }
}

// ─── Milestone tile ───────────────────────────────────────────────────────────

class _MilestoneTile extends ConsumerWidget {
  final MilestoneModel milestone;
  final ProjectModel project;
  final dynamic user;
  final bool isBlocked; // RN04: milestone não sequencial
  const _MilestoneTile({
    required this.milestone,
    required this.project,
    required this.user,
    required this.isBlocked,
  });

  Color _statusColor() => AppTheme.statusColor(milestone.status);
  Color _statusBg() => AppTheme.statusBg(milestone.status);
  String _statusLabel() => AppTheme.statusLabel(milestone.status);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final action = _buildAction(context, ref);
    final color = _statusColor();
    final bg = _statusBg();

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
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
      child: ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Status accent strip
              Container(width: 4, color: color),
              // Content
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Row(
                    children: [
                      // Order circle
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: bg,
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text(
                            '${milestone.order}',
                            style: TextStyle(
                              color: color,
                              fontWeight: FontWeight.w800,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              milestone.title,
                              style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 14),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Text(
                                  'R\$ ${milestone.value.toStringAsFixed(2)}',
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodySmall
                                      ?.copyWith(
                                          color: AppTheme.slate500),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 7, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: bg,
                                    borderRadius:
                                        BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    _statusLabel(),
                                    style: TextStyle(
                                        color: color, fontSize: 11,
                                        fontWeight: FontWeight.w600),
                                  ),
                                ),
                              ],
                            ),
                            // RN04: aviso de bloqueio sequencial
                            if (isBlocked) ...[
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  Icon(Icons.lock_rounded,
                                      size: 12,
                                      color: AppTheme.slate400),
                                  const SizedBox(width: 4),
                                  Text(
                                    'Aguardando aprovação da anterior',
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: AppTheme.slate400,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                      if (action != null) ...[
                        const SizedBox(width: 8),
                        action,
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget? _buildAction(BuildContext context, WidgetRef ref) {
    final isSpecialist = user?.isSpecialist == true;
    final isCompany = user?.isCompany == true;
    final isAssigned = project.specialistId == user?.id;

    // Especialista: só pode entregar se não estiver bloqueada (RN04)
    if (isSpecialist && isAssigned && milestone.status == 'IN_PROGRESS') {
      return Tooltip(
        message: isBlocked ? 'Conclua a milestone anterior primeiro' : '',
        child: FilledButton.tonal(
          onPressed: isBlocked
              ? null
              : () => context.go(
                    '/projects/${project.id}/milestones/${milestone.id}/deliver',
                  ),
          style: FilledButton.styleFrom(
            padding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          ),
          child: const Text('Entregar', style: TextStyle(fontSize: 13)),
        ),
      );
    }

    // Empresa: aprovar/rejeitar milestone submetida
    if (isCompany && milestone.status == 'SUBMITTED') {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _ActionIcon(
            icon: Icons.check_circle_rounded,
            color: AppTheme.success,
            tooltip: 'Aprovar',
            onTap: () => ref
                .read(projectDetailViewModelProvider.notifier)
                .updateMilestone(milestone.id, 'approve'),
          ),
          const SizedBox(width: 4),
          _ActionIcon(
            icon: Icons.cancel_rounded,
            color: AppTheme.danger,
            tooltip: 'Rejeitar',
            onTap: () => ref
                .read(projectDetailViewModelProvider.notifier)
                .updateMilestone(milestone.id, 'reject'),
          ),
        ],
      );
    }

    return null;
  }
}

class _ActionIcon extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String tooltip;
  final VoidCallback onTap;
  const _ActionIcon({
    required this.icon,
    required this.color,
    required this.tooltip,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.all(6),
          child: Icon(icon, color: color, size: 24),
        ),
      ),
    );
  }
}
