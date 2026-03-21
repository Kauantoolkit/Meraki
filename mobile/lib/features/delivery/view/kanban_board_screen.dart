import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
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

    return Scaffold(
      appBar: AppBar(title: const Text('Kanban')),
      body: boardAsync.when(
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(
          message: e.toString(),
          onRetry: () =>
              ref.read(kanbanViewModelProvider.notifier).load(widget.projectId),
        ),
        data: (columns) => columns.isEmpty
            ? const Center(child: Text('Nenhuma coluna encontrada'))
            : _KanbanBoard(columns: columns),
      ),
    );
  }
}

class _KanbanBoard extends ConsumerWidget {
  final List<KanbanColumnModel> columns;
  const _KanbanBoard({required this.columns});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.all(16),
      children: columns
          .map((col) => _KanbanColumn(column: col))
          .toList(),
    );
  }
}

class _KanbanColumn extends ConsumerWidget {
  final KanbanColumnModel column;
  const _KanbanColumn({required this.column});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      width: 260,
      margin: const EdgeInsets.only(right: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primaryContainer,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    column.name,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
                Chip(
                  label: Text('${column.cards.length}'),
                  padding: EdgeInsets.zero,
                  labelPadding: const EdgeInsets.symmetric(horizontal: 8),
                ),
              ],
            ),
          ),
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surfaceContainerHighest,
                borderRadius: const BorderRadius.vertical(
                  bottom: Radius.circular(8),
                ),
              ),
              child: column.cards.isEmpty
                  ? const Center(
                      child: Text('Vazio', style: TextStyle(color: Colors.grey)),
                    )
                  : ListView(
                      padding: const EdgeInsets.all(8),
                      children: column.cards
                          .map((card) => _KanbanCard(card: card))
                          .toList(),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

class _KanbanCard extends ConsumerWidget {
  final KanbanCardModel card;
  const _KanbanCard({required this.card});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(card.title, style: const TextStyle(fontWeight: FontWeight.w500)),
            if (card.milestoneId != null) ...[
              const SizedBox(height: 8),
              FilledButton.tonal(
                onPressed: () => _showDeliveryDialog(context, ref, card),
                child: const Text('Entregar'),
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showDeliveryDialog(
      BuildContext context, WidgetRef ref, KanbanCardModel card) {
    final ctrl = TextEditingController();
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Registrar entrega'),
        content: TextField(
          controller: ctrl,
          maxLines: 4,
          decoration: const InputDecoration(
            labelText: 'Descrição da entrega',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () async {
              final ok = await ref
                  .read(kanbanViewModelProvider.notifier)
                  .submitDelivery(card.milestoneId!, ctrl.text);
              if (context.mounted) {
                Navigator.pop(context);
                if (!ok) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Erro ao registrar entrega')),
                  );
                }
              }
            },
            child: const Text('Confirmar'),
          ),
        ],
      ),
    ).whenComplete(ctrl.dispose);
  }
}
