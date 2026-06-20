import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
import '../../auth/viewmodel/auth_viewmodel.dart';
import '../model/delivery_model.dart';
import '../viewmodel/delivery_viewmodel.dart';

class KanbanBoardScreen extends ConsumerStatefulWidget {
  final String projectId;
  const KanbanBoardScreen({super.key, required this.projectId});

  @override
  ConsumerState<KanbanBoardScreen> createState() => _KanbanBoardScreenState();
}

class _KanbanBoardScreenState extends ConsumerState<KanbanBoardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(kanbanViewModelProvider.notifier).load(widget.projectId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final boardAsync = ref.watch(kanbanViewModelProvider);
    final isCompany = ref.watch(authViewModelProvider).user?.isCompany ?? false;

    return Scaffold(
      backgroundColor: AppTheme.slate900,
      appBar: AppBar(
        backgroundColor: AppTheme.slate900,
        surfaceTintColor: Colors.transparent,
        title: RichText(
          text: TextSpan(
            style: GoogleFonts.sourceCodePro(
                fontSize: 13, color: AppTheme.slate500),
            children: [
              const TextSpan(text: 'KANBAN // '),
              TextSpan(
                text: 'MILESTONES',
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
            icon: const Icon(Icons.refresh, size: 20),
            onPressed: () => ref
                .read(kanbanViewModelProvider.notifier)
                .load(widget.projectId),
          ),
        ],
      ),
      body: boardAsync.when(
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(
          message: e.toString(),
          onRetry: () =>
              ref.read(kanbanViewModelProvider.notifier).load(widget.projectId),
        ),
        data: (columns) => columns.isEmpty
            ? Center(
                child: Text('Nenhuma coluna encontrada',
                    style: AppTheme.mono(color: AppTheme.slate500)))
            : _KanbanBoard(
                columns: columns,
                isCompany: isCompany,
                projectId: widget.projectId,
              ),
      ),
    );
  }
}

class _KanbanBoard extends ConsumerWidget {
  final List<KanbanColumnModel> columns;
  final bool isCompany;
  final String projectId;

  const _KanbanBoard({
    required this.columns,
    required this.isCompany,
    required this.projectId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Determine which milestone can be started (RN04)
    String? nextStartableId;
    final allCards = columns.expand((c) => c.cards).toList();
    allCards.sort((a, b) => a.order.compareTo(b.order));

    // Find the pending column
    final pendingCol = columns.where((c) =>
        c.name.toUpperCase().contains('PENDING')).toList();
    final approvedCol = columns.where((c) =>
        c.name.toUpperCase().contains('APPROVED')).toList();
    final approvedIds = approvedCol.isNotEmpty
        ? approvedCol.first.cards.map((c) => c.milestoneId).toSet()
        : <String?>{};

    if (pendingCol.isNotEmpty) {
      for (final card in allCards) {
        if (pendingCol.first.cards.any((c) => c.id == card.id)) {
          // Check if all predecessors are approved
          final predecessors = allCards.where((c) => c.order < card.order);
          final allPredApproved =
              predecessors.every((c) => approvedIds.contains(c.milestoneId));
          if (allPredApproved) {
            nextStartableId = card.milestoneId;
            break;
          }
        }
      }
    }

    return ListView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.all(12),
      children: columns.map((col) {
        final colColor = _columnColor(col.name);
        return Container(
          width: 280,
          margin: const EdgeInsets.only(right: 10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Column header
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: AppTheme.slate100,
                  border: Border(
                    top: BorderSide(color: colColor, width: 2),
                    left: BorderSide(color: AppTheme.slate200),
                    right: BorderSide(color: AppTheme.slate200),
                  ),
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(4)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        col.name.toUpperCase(),
                        style: GoogleFonts.sourceCodePro(
                          color: colColor,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1,
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: colColor.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '${col.cards.length}',
                        style: GoogleFonts.sourceCodePro(
                            color: colColor,
                            fontSize: 10,
                            fontWeight: FontWeight.w700),
                      ),
                    ),
                  ],
                ),
              ),
              // Cards
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: AppTheme.slate50,
                    border: Border.all(color: AppTheme.slate200),
                    borderRadius: const BorderRadius.vertical(
                        bottom: Radius.circular(4)),
                  ),
                  child: col.cards.isEmpty
                      ? Center(
                          child: Text('—',
                              style: GoogleFonts.sourceCodePro(
                                  color: AppTheme.slate500, fontSize: 11)))
                      : ListView(
                          padding: const EdgeInsets.all(8),
                          children: col.cards.map((card) {
                            final canStart = !isCompany &&
                                card.milestoneId == nextStartableId &&
                                col.name
                                    .toUpperCase()
                                    .contains('PENDING');
                            final isInProgress = col.name
                                .toUpperCase()
                                .contains('IN_PROGRESS');
                            final isSubmitted = col.name
                                .toUpperCase()
                                .contains('SUBMITTED');
                            final isApproved = col.name
                                .toUpperCase()
                                .contains('APPROVED');

                            return _MilestoneCard(
                              card: card,
                              isCompany: isCompany,
                              canStart: canStart,
                              showDeliverBtn:
                                  !isCompany && isInProgress,
                              showApproveReject:
                                  isCompany && isSubmitted,
                              isApproved: isApproved,
                              projectId: projectId,
                            );
                          }).toList(),
                        ),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Color _columnColor(String name) {
    final upper = name.toUpperCase();
    if (upper.contains('PENDING')) return AppTheme.warning;
    if (upper.contains('IN_PROGRESS')) return AppTheme.info;
    if (upper.contains('SUBMITTED')) return AppTheme.brand;
    if (upper.contains('APPROVED')) return AppTheme.slate400;
    return AppTheme.slate500;
  }
}

class _MilestoneCard extends ConsumerWidget {
  final KanbanCardModel card;
  final bool isCompany;
  final bool canStart;
  final bool showDeliverBtn;
  final bool showApproveReject;
  final bool isApproved;
  final String projectId;

  const _MilestoneCard({
    required this.card,
    required this.isCompany,
    required this.canStart,
    required this.showDeliverBtn,
    required this.showApproveReject,
    required this.isApproved,
    required this.projectId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppTheme.slate100,
        border: Border.all(
          color: isApproved
              ? AppTheme.slate200
              : AppTheme.slate200,
        ),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AppTheme.brandLight,
                  borderRadius: BorderRadius.circular(2),
                ),
                child: Text(
                  'M${card.order + 1}',
                  style: GoogleFonts.sourceCodePro(
                    color: AppTheme.brand,
                    fontSize: 9,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  card.title,
                  style: GoogleFonts.sourceCodePro(
                    color: isApproved ? AppTheme.slate500 : Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    decoration:
                        isApproved ? TextDecoration.lineThrough : null,
                  ),
                ),
              ),
            ],
          ),
          // Action buttons
          if (canStart) ...[
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: _SmallButton(
                label: 'INICIAR TRABALHO',
                color: AppTheme.brand,
                onTap: () => _startMilestone(context, ref),
              ),
            ),
          ],
          if (showDeliverBtn && card.milestoneId != null) ...[
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: _SmallButton(
                label: 'SUBMETER ENTREGA',
                color: AppTheme.info,
                onTap: () => _showDeliveryDialog(context, ref),
              ),
            ),
          ],
          if (showApproveReject && card.milestoneId != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: _SmallButton(
                    label: 'REJEITAR',
                    color: AppTheme.danger,
                    onTap: () => _showRejectDialog(context, ref),
                  ),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: _SmallButton(
                    label: 'APROVAR',
                    color: AppTheme.brand,
                    onTap: () => _showApproveDialog(context, ref),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  void _startMilestone(BuildContext context, WidgetRef ref) async {
    if (card.milestoneId == null) return;
    final ok = await ref
        .read(kanbanViewModelProvider.notifier)
        .startMilestone(card.milestoneId!);
    if (!ok && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Erro ao iniciar milestone')),
      );
    }
  }

  void _showDeliveryDialog(BuildContext context, WidgetRef ref) {
    final repoCtrl = TextEditingController();
    final notesCtrl = TextEditingController();
    String? error;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.slate100,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setInner) => Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom,
          ),
          child: Container(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('SUBMETER ENTREGA',
                    style: GoogleFonts.sourceCodePro(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1)),
                const SizedBox(height: 4),
                Text('M${card.order + 1}: ${card.title}',
                    style: GoogleFonts.sourceCodePro(
                        color: AppTheme.brand, fontSize: 11)),
                const SizedBox(height: 16),
                Text('REPOSITÓRIO / URL *',
                    style: GoogleFonts.sourceCodePro(
                        color: AppTheme.slate500,
                        fontSize: 9,
                        letterSpacing: 1)),
                const SizedBox(height: 6),
                TextField(
                  controller: repoCtrl,
                  style: GoogleFonts.sourceCodePro(
                      color: Colors.white, fontSize: 12),
                  decoration: InputDecoration(
                    hintText: 'https://github.com/...',
                    hintStyle:
                        GoogleFonts.sourceCodePro(color: AppTheme.slate500),
                  ),
                ),
                const SizedBox(height: 12),
                Text('NOTAS (opcional)',
                    style: GoogleFonts.sourceCodePro(
                        color: AppTheme.slate500,
                        fontSize: 9,
                        letterSpacing: 1)),
                const SizedBox(height: 6),
                TextField(
                  controller: notesCtrl,
                  maxLines: 3,
                  style: GoogleFonts.sourceCodePro(
                      color: Colors.white, fontSize: 12),
                  decoration: InputDecoration(
                    hintText: 'Release notes, observações...',
                    hintStyle:
                        GoogleFonts.sourceCodePro(color: AppTheme.slate500),
                  ),
                ),
                if (error != null) ...[
                  const SizedBox(height: 8),
                  Text(error!,
                      style: GoogleFonts.sourceCodePro(
                          color: AppTheme.danger, fontSize: 10)),
                ],
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(ctx),
                        child: Text('CANCELAR',
                            style: GoogleFonts.sourceCodePro(
                                fontSize: 11, letterSpacing: 1)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: FilledButton(
                        onPressed: () async {
                          final repo = repoCtrl.text.trim();
                          if (repo.isEmpty) {
                            setInner(
                                () => error = 'URL do repositório é obrigatória');
                            return;
                          }
                          final ok = await ref
                              .read(kanbanViewModelProvider.notifier)
                              .submitDelivery(
                                card.milestoneId!,
                                deliveredFiles: [repo],
                                deliveryNotes: notesCtrl.text.trim(),
                              );
                          if (ctx.mounted) {
                            Navigator.pop(ctx);
                            if (!ok) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                    content: Text('Erro ao enviar entrega')),
                              );
                            }
                          }
                        },
                        child: Text('ENVIAR',
                            style: GoogleFonts.sourceCodePro(
                                fontSize: 11, letterSpacing: 1)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    ).whenComplete(() {
      repoCtrl.dispose();
      notesCtrl.dispose();
    });
  }

  void _showApproveDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.slate100,
        title: Text('Aprovar M${card.order + 1}?',
            style: GoogleFonts.sourceCodePro(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(card.title,
                style: GoogleFonts.sourceCodePro(
                    color: AppTheme.brand, fontSize: 12)),
            const SizedBox(height: 12),
            Text(
              'Ao aprovar, o pagamento será liberado ao especialista. Esta ação é irreversível.',
              style: GoogleFonts.sourceCodePro(
                  color: AppTheme.slate400, fontSize: 11, height: 1.4),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('CANCELAR'),
          ),
          FilledButton(
            onPressed: () async {
              Navigator.pop(ctx);
              final ok = await ref
                  .read(kanbanViewModelProvider.notifier)
                  .approveMilestone(card.milestoneId!);
              if (!ok && context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Erro ao aprovar milestone')),
                );
              }
            },
            child: const Text('CONFIRMAR'),
          ),
        ],
      ),
    );
  }

  void _showRejectDialog(BuildContext context, WidgetRef ref) {
    final reasonCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.slate100,
        title: Text('Rejeitar M${card.order + 1}?',
            style: GoogleFonts.sourceCodePro(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'A milestone voltará ao estado Em Andamento.',
              style: GoogleFonts.sourceCodePro(
                  color: AppTheme.slate400, fontSize: 11),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: reasonCtrl,
              maxLines: 3,
              style: GoogleFonts.sourceCodePro(
                  color: Colors.white, fontSize: 12),
              decoration: InputDecoration(
                hintText: 'Motivo da rejeição *',
                hintStyle:
                    GoogleFonts.sourceCodePro(color: AppTheme.slate500),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('CANCELAR'),
          ),
          TextButton(
            onPressed: () async {
              if (reasonCtrl.text.trim().isEmpty) return;
              Navigator.pop(ctx);
              final ok = await ref
                  .read(kanbanViewModelProvider.notifier)
                  .rejectMilestone(
                      card.milestoneId!, reasonCtrl.text.trim());
              if (!ok && context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                      content: Text('Erro ao rejeitar milestone')),
                );
              }
            },
            child: Text('REJEITAR',
                style: TextStyle(color: AppTheme.danger)),
          ),
        ],
      ),
    ).whenComplete(reasonCtrl.dispose);
  }
}

class _SmallButton extends StatelessWidget {
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _SmallButton({
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 6),
        decoration: BoxDecoration(
          border: Border.all(color: color.withOpacity(0.5)),
          borderRadius: BorderRadius.circular(2),
        ),
        child: Center(
          child: Text(
            label,
            style: GoogleFonts.sourceCodePro(
              color: color,
              fontSize: 9,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.5,
            ),
          ),
        ),
      ),
    );
  }
}
