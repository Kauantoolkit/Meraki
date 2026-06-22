import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
import '../model/bid_model.dart';
import '../viewmodel/bid_viewmodel.dart';

class ProjectBidsScreen extends ConsumerStatefulWidget {
  final String projectId;
  const ProjectBidsScreen({super.key, required this.projectId});

  @override
  ConsumerState<ProjectBidsScreen> createState() => _ProjectBidsScreenState();
}

class _ProjectBidsScreenState extends ConsumerState<ProjectBidsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(projectBidsViewModelProvider.notifier).load(widget.projectId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final bidsAsync = ref.watch(projectBidsViewModelProvider);

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
              const TextSpan(text: 'PROPOSTAS // '),
              TextSpan(
                text: 'AVALIAR',
                style: GoogleFonts.sourceCodePro(
                    fontSize: 13,
                    color: Colors.white,
                    fontWeight: FontWeight.w700),
              ),
            ],
          ),
        ),
      ),
      body: bidsAsync.when(
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(
          message: e.toString(),
          onRetry: () => ref
              .read(projectBidsViewModelProvider.notifier)
              .load(widget.projectId),
        ),
        data: (bids) {
          if (bids.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.inbox_outlined,
                      size: 48, color: AppTheme.slate500),
                  const SizedBox(height: 16),
                  Text('NENHUMA PROPOSTA RECEBIDA',
                      style: GoogleFonts.sourceCodePro(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1)),
                  const SizedBox(height: 8),
                  Text('Propostas dos especialistas aparecem aqui',
                      style: GoogleFonts.sourceCodePro(
                          color: AppTheme.slate500, fontSize: 11)),
                ],
              ),
            );
          }

          final pending = bids.where((b) => b.isPending).toList();
          final accepted = bids.where((b) => b.isAccepted).toList();
          final rejected = bids.where((b) => b.isRejected).toList();
          final hasAccepted = accepted.isNotEmpty;

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Stats bar
              Row(
                children: [
                  _StatChip(
                      label: 'PENDENTES',
                      count: pending.length,
                      color: AppTheme.warning),
                  const SizedBox(width: 8),
                  _StatChip(
                      label: 'ACEITAS',
                      count: accepted.length,
                      color: AppTheme.brand),
                  const SizedBox(width: 8),
                  _StatChip(
                      label: 'REJEITADAS',
                      count: rejected.length,
                      color: AppTheme.danger),
                ],
              ),
              // Winner banner
              if (hasAccepted) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.brandLight,
                    border: Border.all(color: AppTheme.brand.withValues(alpha: 0.4)),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle,
                          color: AppTheme.brand, size: 16),
                      const SizedBox(width: 8),
                      Text(
                        'Especialista selecionado para este projeto',
                        style: GoogleFonts.sourceCodePro(
                            color: AppTheme.brand, fontSize: 10),
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 16),
              // Bid cards
              ...bids.map((b) => _BidCard(
                    bid: b,
                    hasAccepted: hasAccepted,
                    projectId: widget.projectId,
                  )),
            ],
          );
        },
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final String label;
  final int count;
  final Color color;
  const _StatChip(
      {required this.label, required this.count, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: AppTheme.slate100,
          border: Border.all(color: AppTheme.slate200),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Column(
          children: [
            Text('$count',
                style: GoogleFonts.sourceCodePro(
                    color: color, fontSize: 16, fontWeight: FontWeight.w700)),
            Text(label,
                style: GoogleFonts.sourceCodePro(
                    color: AppTheme.slate500,
                    fontSize: 8,
                    letterSpacing: 0.5)),
          ],
        ),
      ),
    );
  }
}

class _BidCard extends ConsumerStatefulWidget {
  final BidModel bid;
  final bool hasAccepted;
  final String projectId;

  const _BidCard({
    required this.bid,
    required this.hasAccepted,
    required this.projectId,
  });

  @override
  ConsumerState<_BidCard> createState() => _BidCardState();
}

class _BidCardState extends ConsumerState<_BidCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final bid = widget.bid;
    final (statusLabel, statusColor) = switch (bid.status) {
      'ACCEPTED' => ('ACEITA', AppTheme.brand),
      'REJECTED' => ('REJEITADA', AppTheme.danger),
      'WITHDRAWN' => ('RETIRADA', AppTheme.slate500),
      _ => ('PENDENTE', AppTheme.warning),
    };

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppTheme.slate100,
        border: Border.all(
          color: bid.isAccepted
              ? AppTheme.brand.withValues(alpha: 0.4)
              : AppTheme.slate200,
        ),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          InkWell(
            onTap: () => setState(() => _expanded = !_expanded),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              'R\$ ${bid.proposedValue.toStringAsFixed(2).replaceAll('.', ',')}',
                              style: GoogleFonts.sourceCodePro(
                                color: Colors.white,
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: statusColor.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(2),
                              ),
                              child: Text(
                                statusLabel,
                                style: GoogleFonts.sourceCodePro(
                                  color: statusColor,
                                  fontSize: 8,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${bid.estimatedDays} dias estimados',
                          style: GoogleFonts.sourceCodePro(
                              color: AppTheme.slate500, fontSize: 10),
                        ),
                      ],
                    ),
                  ),
                  GestureDetector(
                    onTap: () =>
                        context.go('/portfolio/${bid.specialistId}'),
                    child: Text(
                      'VER PERFIL',
                      style: GoogleFonts.sourceCodePro(
                        color: AppTheme.brand,
                        fontSize: 9,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Icon(
                    _expanded
                        ? Icons.keyboard_arrow_up
                        : Icons.keyboard_arrow_down,
                    color: AppTheme.slate500,
                    size: 18,
                  ),
                ],
              ),
            ),
          ),
          // Expanded content
          if (_expanded) ...[
            const Divider(color: AppTheme.slate200, height: 1),
            if (bid.coverLetter.isNotEmpty)
              Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('CARTA DE APRESENTAÇÃO',
                        style: GoogleFonts.sourceCodePro(
                            color: AppTheme.slate500,
                            fontSize: 9,
                            letterSpacing: 1)),
                    const SizedBox(height: 6),
                    Text(
                      bid.coverLetter,
                      style: GoogleFonts.sourceCodePro(
                          color: AppTheme.slate300,
                          fontSize: 10,
                          height: 1.5),
                    ),
                  ],
                ),
              ),
            // Actions
            if (bid.isPending && !widget.hasAccepted) ...[
              const Divider(color: AppTheme.slate200, height: 1),
              Padding(
                padding: const EdgeInsets.all(14),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppTheme.danger,
                          side: const BorderSide(color: AppTheme.danger),
                        ),
                        onPressed: () => _confirmReject(context, ref, bid),
                        child: Text('REJEITAR',
                            style: GoogleFonts.sourceCodePro(
                                fontSize: 11, letterSpacing: 1)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: FilledButton(
                        onPressed: () => _confirmAccept(context, ref, bid),
                        child: Text('ACEITAR',
                            style: GoogleFonts.sourceCodePro(
                                fontSize: 11, letterSpacing: 1)),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ],
      ),
    );
  }

  void _confirmAccept(BuildContext context, WidgetRef ref, BidModel bid) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.slate100,
        title: Text('Aceitar proposta?',
            style: GoogleFonts.sourceCodePro(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'R\$ ${bid.proposedValue.toStringAsFixed(2)} · ${bid.estimatedDays} dias',
              style: GoogleFonts.sourceCodePro(
                  color: AppTheme.brand, fontSize: 12),
            ),
            const SizedBox(height: 12),
            Text(
              'Ao aceitar, todas as outras propostas pendentes serão automaticamente rejeitadas. Esta ação é irreversível.',
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
                  .read(projectBidsViewModelProvider.notifier)
                  .accept(bid.id);
              if (ok && context.mounted) {
                // Navigate to kanban after acceptance
                Future.delayed(const Duration(milliseconds: 800), () {
                  if (context.mounted) {
                    context.go('/projects/${widget.projectId}/contract');
                  }
                });
              }
            },
            child: const Text('CONFIRMAR'),
          ),
        ],
      ),
    );
  }

  void _confirmReject(BuildContext context, WidgetRef ref, BidModel bid) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.slate100,
        title: Text('Rejeitar proposta?',
            style: GoogleFonts.sourceCodePro(color: Colors.white)),
        content: Text(
          'Esta ação não pode ser desfeita.',
          style: GoogleFonts.sourceCodePro(
              color: AppTheme.slate400, fontSize: 11),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('CANCELAR'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await ref
                  .read(projectBidsViewModelProvider.notifier)
                  .reject(bid.id);
            },
            child: const Text('REJEITAR',
                style: TextStyle(color: AppTheme.danger)),
          ),
        ],
      ),
    );
  }
}
