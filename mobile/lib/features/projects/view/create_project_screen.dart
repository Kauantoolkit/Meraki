import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../viewmodel/projects_viewmodel.dart';

class CreateProjectScreen extends ConsumerWidget {
  const CreateProjectScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const _CreateProjectForm();
  }
}

class _CreateProjectForm extends ConsumerStatefulWidget {
  const _CreateProjectForm();

  @override
  ConsumerState<_CreateProjectForm> createState() => _CreateProjectFormState();
}

class _CreateProjectFormState extends ConsumerState<_CreateProjectForm> {
  final _formKey = GlobalKey<FormState>();
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _budgetCtrl = TextEditingController();
  final _deadlineCtrl = TextEditingController();
  final _reqCtrl = TextEditingController();

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _budgetCtrl.dispose();
    _deadlineCtrl.dispose();
    _reqCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDeadline() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: now.add(const Duration(days: 30)),
      firstDate: now.add(const Duration(days: 1)),
      lastDate: now.add(const Duration(days: 365 * 2)),
    );
    if (picked != null) {
      _deadlineCtrl.text = picked.toIso8601String().substring(0, 10);
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final ok = await ref.read(createProjectViewModelProvider.notifier).submit(
          title: _titleCtrl.text,
          description: _descCtrl.text,
          budget: _budgetCtrl.text,
          deadline: _deadlineCtrl.text,
        );
    if (ok && mounted) context.go('/projects');
  }

  void _showAddMilestoneDialog() {
    final titleCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final amountCtrl = TextEditingController();
    String? dueDate;

    void disposeAll() {
      titleCtrl.dispose();
      descCtrl.dispose();
      amountCtrl.dispose();
    }

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setInner) => AlertDialog(
          title: const Text('Novo Milestone'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: titleCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Título *',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: descCtrl,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'Descrição *',
                    border: OutlineInputBorder(),
                    alignLabelWithHint: true,
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: amountCtrl,
                  keyboardType:
                      const TextInputType.numberWithOptions(decimal: true),
                  decoration: const InputDecoration(
                    labelText: 'Valor (R\$) *',
                    prefixIcon: Icon(Icons.attach_money),
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () async {
                    final now = DateTime.now();
                    final picked = await showDatePicker(
                      context: ctx,
                      initialDate: now.add(const Duration(days: 30)),
                      firstDate: now.add(const Duration(days: 1)),
                      lastDate: now.add(const Duration(days: 365 * 2)),
                    );
                    if (picked != null) {
                      setInner(() {
                        dueDate = picked.toIso8601String().substring(0, 10);
                      });
                    }
                  },
                  icon: const Icon(Icons.calendar_today, size: 18),
                  label: Text(dueDate != null
                      ? 'Prazo: $dueDate'
                      : 'Prazo (opcional)'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancelar'),
            ),
            FilledButton(
              onPressed: () {
                final title = titleCtrl.text.trim();
                final desc = descCtrl.text.trim();
                final amount = double.tryParse(
                    amountCtrl.text.replaceAll(',', '.'));
                if (title.isEmpty || desc.isEmpty || amount == null || amount <= 0) {
                  return;
                }
                ref.read(createProjectViewModelProvider.notifier).addMilestone(
                      MilestoneDraft(
                        title: title,
                        description: desc,
                        amount: amount,
                        dueDate: dueDate,
                      ),
                    );
                Navigator.pop(ctx);
              },
              child: const Text('Adicionar'),
            ),
          ],
        ),
      ),
    ).whenComplete(disposeAll);
  }

  @override
  Widget build(BuildContext context) {
    final vmState = ref.watch(createProjectViewModelProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Novo Projeto')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ─── Informações básicas ───────────────────────────────────
              Text('Informações gerais',
                  style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 12),
              TextFormField(
                controller: _titleCtrl,
                decoration: const InputDecoration(
                  labelText: 'Título',
                  border: OutlineInputBorder(),
                ),
                validator: (v) =>
                    (v == null || v.length < 10) ? 'Mínimo 10 caracteres' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _descCtrl,
                maxLines: 4,
                decoration: const InputDecoration(
                  labelText: 'Descrição',
                  border: OutlineInputBorder(),
                  alignLabelWithHint: true,
                ),
                validator: (v) =>
                    (v == null || v.isEmpty) ? 'Obrigatório' : null,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _budgetCtrl,
                      keyboardType:
                          const TextInputType.numberWithOptions(decimal: true),
                      decoration: const InputDecoration(
                        labelText: 'Orçamento (R\$)',
                        prefixIcon: Icon(Icons.attach_money),
                        border: OutlineInputBorder(),
                      ),
                      validator: (v) {
                        final val =
                            double.tryParse(v?.replaceAll(',', '.') ?? '');
                        if (val == null || val <= 0) return 'Valor inválido';
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _deadlineCtrl,
                      readOnly: true,
                      onTap: _pickDeadline,
                      decoration: const InputDecoration(
                        labelText: 'Prazo final',
                        prefixIcon: Icon(Icons.calendar_today),
                        border: OutlineInputBorder(),
                      ),
                      validator: (v) =>
                          (v == null || v.isEmpty) ? 'Selecione o prazo' : null,
                    ),
                  ),
                ],
              ),

              // ─── Requisitos ────────────────────────────────────────────
              const SizedBox(height: 24),
              Text('Requisitos',
                  style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _reqCtrl,
                      decoration: const InputDecoration(
                        hintText: 'Ex: Experiência em Flutter',
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(
                    onPressed: () {
                      ref
                          .read(createProjectViewModelProvider.notifier)
                          .addRequirement(_reqCtrl.text);
                      _reqCtrl.clear();
                    },
                    icon: const Icon(Icons.add),
                  ),
                ],
              ),
              ...vmState.requirements.asMap().entries.map(
                    (e) => ListTile(
                      dense: true,
                      leading: const Icon(Icons.check_circle_outline, size: 20),
                      title: Text(e.value),
                      trailing: IconButton(
                        icon: const Icon(Icons.close, size: 18),
                        onPressed: () => ref
                            .read(createProjectViewModelProvider.notifier)
                            .removeRequirement(e.key),
                      ),
                    ),
                  ),

              // ─── Milestones ────────────────────────────────────────────
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: Text('Milestones',
                        style: Theme.of(context).textTheme.titleMedium),
                  ),
                  TextButton.icon(
                    onPressed: _showAddMilestoneDialog,
                    icon: const Icon(Icons.add, size: 18),
                    label: const Text('Adicionar'),
                  ),
                ],
              ),
              if (vmState.milestones.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Text(
                    'Nenhum milestone adicionado',
                    style: TextStyle(color: Theme.of(context).colorScheme.outline),
                  ),
                )
              else
                ...vmState.milestones.asMap().entries.map(
                      (e) => Card(
                        margin: const EdgeInsets.only(top: 8),
                        child: ListTile(
                          leading: CircleAvatar(
                            radius: 14,
                            child: Text('${e.key + 1}',
                                style: const TextStyle(fontSize: 12)),
                          ),
                          title: Text(e.value.title),
                          subtitle: Text(
                            'R\$ ${e.value.amount.toStringAsFixed(2)}'
                            '${e.value.dueDate != null ? ' · ${e.value.dueDate}' : ''}',
                          ),
                          trailing: IconButton(
                            icon: const Icon(Icons.close, size: 18),
                            onPressed: () => ref
                                .read(createProjectViewModelProvider.notifier)
                                .removeMilestone(e.key),
                          ),
                        ),
                      ),
                    ),

              // ─── Erro e botão ──────────────────────────────────────────
              if (vmState.error != null) ...[
                const SizedBox(height: 12),
                Text(
                  vmState.error!,
                  style:
                      TextStyle(color: Theme.of(context).colorScheme.error),
                  textAlign: TextAlign.center,
                ),
              ],
              const SizedBox(height: 24),
              FilledButton(
                onPressed: vmState.isLoading ? null : _submit,
                child: vmState.isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Criar Projeto'),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
