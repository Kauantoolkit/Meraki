import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
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
      appBar: AppBar(
        title: const Text('Propostas recebidas'),
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
                  Icon(Icons.inbox_outlined,
                      size: 64,
                      color: Theme.of(context).colorScheme.outline),
                  const SizedBox(height: 16),
                  Text('Nenhuma proposta recebida ainda',
                      style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 8),
                  Text(
                    'As propostas dos especialistas aparecem aqui',
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.outline),
                  ),
                ],
              ),
            );
          }

          final pending = bids.where((b) => b.isPending).toList();
          final decided = bids.where((b) => !b.isPending).toList();

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              if (pending.isNotEmpty) ...[
                _SectionHeader(
                  title: 'Aguardando avaliação',
                  count: pending.length,
                  color: Colors.orange,
                ),
                const SizedBox(height: 8),
                ...pending.map((b) => _BidCard(bid: b)),
              ],
              if (decided.isNotEmpty) ...[
                if (pending.isNotEmpty) const SizedBox(height: 16),
                _SectionHeader(
                  title: 'Já avaliadas',
                  count: decided.length,
                  color: Theme.of(context).colorScheme.outline,
                ),
                const SizedBox(height: 8),
                ...decided.map((b) => _BidCard(bid: b)),
              ],
            ],
          );
        },
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final int count;
  final Color color;
  const _SectionHeader(
      {required this.title, required this.count, required this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(title,
            style: Theme.of(context)
                .textTheme
                .labelLarge
                ?.copyWith(color: color)),
        const SizedBox(width: 8),
        CircleAvatar(
            radius: 10,
            backgroundColor: color.withOpacity(0.2),
            child: Text('$count',
                style: TextStyle(fontSize: 11, color: color))),
      ],
    );
  }
}

class _BidCard extends ConsumerWidget {
  final BidModel bid;
  const _BidCard({required this.bid});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final (statusLabel, statusColor) = switch (bid.status) {
      'ACCEPTED' => ('Aceita', Colors.green),
      'REJECTED' => ('Rejeitada', Colors.red),
      _ => ('Pendente', Colors.orange),
    };

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ─── Header: valor + status + perfil ─────────────────────
            Row(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'R\$ ${bid.proposedValue.toStringAsFixed(2)}',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                    ),
                    Text(
                      '${bid.estimatedDays} dias estimados',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
                const Spacer(),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                            color: statusColor.withOpacity(0.4)),
                      ),
                      child: Text(
                        statusLabel,
                        style: TextStyle(
                            color: statusColor,
                            fontSize: 11,
                            fontWeight: FontWeight.w600),
                      ),
                    ),
                    const SizedBox(height: 4),
                    GestureDetector(
                      onTap: () => context.go(
                          '/portfolio/${bid.specialistId}'),
                      child: Text(
                        'Ver perfil',
                        style: TextStyle(
                          fontSize: 12,
                          color: Theme.of(context).colorScheme.primary,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),

            // ─── Cover letter ─────────────────────────────────────────
            if (bid.coverLetter.isNotEmpty) ...[
              const SizedBox(height: 12),
              const Divider(height: 1),
              const SizedBox(height: 10),
              Text(
                bid.coverLetter,
                maxLines: 4,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],

            // ─── Ações ────────────────────────────────────────────────
            if (bid.isPending) ...[
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.red,
                          side: const BorderSide(color: Colors.red)),
                      onPressed: () => ref
                          .read(projectBidsViewModelProvider.notifier)
                          .reject(bid.id),
                      icon: const Icon(Icons.close),
                      label: const Text('Rejeitar'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: () => ref
                          .read(projectBidsViewModelProvider.notifier)
                          .accept(bid.id),
                      icon: const Icon(Icons.check),
                      label: const Text('Aceitar'),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
