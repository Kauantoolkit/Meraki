import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
import '../model/payment_model.dart';
import '../viewmodel/payment_viewmodel.dart';

class PaymentsScreen extends ConsumerWidget {
  const PaymentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final paymentsAsync = ref.watch(paymentsViewModelProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Pagamentos')),
      body: paymentsAsync.when(
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(
          message: e.toString(),
          onRetry: () => ref.read(paymentsViewModelProvider.notifier).refresh(),
        ),
        data: (payments) {
          if (payments.isEmpty) {
            return const Center(child: Text('Nenhum pagamento encontrado'));
          }
          final totalReceived = payments
              .where((p) => p.isReleased)
              .fold(0.0, (sum, p) => sum + p.specialistAmount);

          return RefreshIndicator(
            onRefresh: () =>
                ref.read(paymentsViewModelProvider.notifier).refresh(),
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: _SummaryCard(totalReceived: totalReceived),
                ),
                SliverPadding(
                  padding: const EdgeInsets.all(16),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (_, i) => _PaymentCard(payment: payments[i]),
                      childCount: payments.length,
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final double totalReceived;
  const _SummaryCard({required this.totalReceived});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primaryContainer,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Text(
            'Total recebido',
            style: Theme.of(context).textTheme.labelLarge,
          ),
          const SizedBox(height: 8),
          Text(
            'R\$ ${totalReceived.toStringAsFixed(2)}',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.onPrimaryContainer,
                ),
          ),
        ],
      ),
    );
  }
}

class _PaymentCard extends StatelessWidget {
  final PaymentModel payment;
  const _PaymentCard({required this.payment});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: payment.isReleased
                    ? Colors.green.withOpacity(0.1)
                    : Colors.orange.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                payment.isReleased ? Icons.check_circle : Icons.pending,
                color: payment.isReleased ? Colors.green : Colors.orange,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    payment.isReleased ? 'Pagamento liberado' : 'Em escrow',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  Text(
                    payment.createdAt.substring(0, 10),
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  if (payment.isReleased)
                    Text(
                      'Taxa: R\$ ${payment.platformFee.toStringAsFixed(2)}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.grey,
                          ),
                    ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  'R\$ ${payment.specialistAmount.toStringAsFixed(2)}',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: payment.isReleased ? Colors.green : null,
                      ),
                ),
                Text(
                  'de R\$ ${payment.amount.toStringAsFixed(2)}',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
