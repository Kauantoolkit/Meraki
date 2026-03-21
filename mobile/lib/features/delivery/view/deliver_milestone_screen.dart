import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../viewmodel/delivery_viewmodel.dart';

class DeliverMilestoneScreen extends ConsumerStatefulWidget {
  final String projectId;
  final String milestoneId;

  const DeliverMilestoneScreen({
    super.key,
    required this.projectId,
    required this.milestoneId,
  });

  @override
  ConsumerState<DeliverMilestoneScreen> createState() =>
      _DeliverMilestoneScreenState();
}

class _DeliverMilestoneScreenState
    extends ConsumerState<DeliverMilestoneScreen> {
  final _ctrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    ref.listenManual(deliverMilestoneViewModelProvider, (_, next) {
      if (next.success && mounted) context.pop(true);
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final vmState = ref.watch(deliverMilestoneViewModelProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Registrar Entrega')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _ctrl,
              maxLines: 8,
              decoration: const InputDecoration(
                labelText: 'Descrição da entrega',
                border: OutlineInputBorder(),
                alignLabelWithHint: true,
              ),
            ),
            if (vmState.error != null) ...[
              const SizedBox(height: 8),
              Text(
                vmState.error!,
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            ],
            const SizedBox(height: 16),
            FilledButton(
              onPressed: vmState.isLoading
                  ? null
                  : () => ref
                      .read(deliverMilestoneViewModelProvider.notifier)
                      .submit(
                        milestoneId: widget.milestoneId,
                        description: _ctrl.text,
                      ),
              child: vmState.isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Confirmar Entrega'),
            ),
          ],
        ),
      ),
    );
  }
}
