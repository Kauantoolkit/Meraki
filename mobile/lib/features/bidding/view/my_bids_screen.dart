import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
import '../model/bid_model.dart';
import '../viewmodel/bid_viewmodel.dart';

class MyBidsScreen extends ConsumerWidget {
  const MyBidsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bidsAsync = ref.watch(myBidsViewModelProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Minhas Propostas')),
      body: bidsAsync.when(
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(
          message: e.toString(),
          onRetry: () => ref.read(myBidsViewModelProvider.notifier).refresh(),
        ),
        data: (bids) => bids.isEmpty
            ? Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.send_outlined,
                        size: 64,
                        color: Theme.of(context).colorScheme.outline),
                    const SizedBox(height: 16),
                    Text(
                      'Nenhuma proposta enviada',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Explore projetos abertos e envie sua proposta',
                      style: TextStyle(
                          color: Theme.of(context).colorScheme.outline),
                    ),
                    const SizedBox(height: 24),
                    FilledButton.icon(
                      onPressed: () => context.go('/projects'),
                      icon: const Icon(Icons.search),
                      label: const Text('Ver projetos'),
                    ),
                  ],
                ),
              )
            : RefreshIndicator(
                onRefresh: () =>
                    ref.read(myBidsViewModelProvider.notifier).refresh(),
                child: ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: bids.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (_, i) => _BidCard(bid: bids[i]),
                ),
              ),
      ),
    );
  }
}

class _BidCard extends StatelessWidget {
  final BidModel bid;
  const _BidCard({required this.bid});

  Color _statusColor(BuildContext context) => switch (bid.status) {
        'ACCEPTED' => Colors.green,
        'REJECTED' => Colors.red,
        _ => Colors.orange,
      };

  String _statusLabel() => switch (bid.status) {
        'ACCEPTED' => 'Aceita',
        'REJECTED' => 'Recusada',
        _ => 'Pendente',
      };

  IconData _statusIcon() => switch (bid.status) {
        'ACCEPTED' => Icons.check_circle,
        'REJECTED' => Icons.cancel,
        _ => Icons.schedule,
      };

  @override
  Widget build(BuildContext context) {
    final color = _statusColor(context);
    return Card(
      child: InkWell(
        onTap: () => context.go('/projects/${bid.projectId}'),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(_statusIcon(), color: color, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _statusLabel(),
                      style: TextStyle(
                          color: color, fontWeight: FontWeight.w600),
                    ),
                  ),
                  Text(
                    bid.createdAt.isNotEmpty
                        ? bid.createdAt.substring(0, 10)
                        : '',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _InfoChip(
                    icon: Icons.attach_money,
                    label: 'R\$ ${bid.proposedValue.toStringAsFixed(2)}',
                  ),
                  const SizedBox(width: 8),
                  _InfoChip(
                    icon: Icons.schedule,
                    label: '${bid.estimatedDays} dias',
                  ),
                ],
              ),
              if (bid.coverLetter.isNotEmpty) ...[
                const SizedBox(height: 10),
                Text(
                  bid.coverLetter,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.open_in_new,
                      size: 14,
                      color: Theme.of(context).colorScheme.primary),
                  const SizedBox(width: 4),
                  Text(
                    'Ver projeto',
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                        fontSize: 12),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const _InfoChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(fontSize: 13)),
        ],
      ),
    );
  }
}
