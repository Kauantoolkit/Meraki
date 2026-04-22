import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../viewmodel/bid_viewmodel.dart';

class SubmitBidScreen extends ConsumerStatefulWidget {
  final String projectId;
  const SubmitBidScreen({super.key, required this.projectId});

  @override
  ConsumerState<SubmitBidScreen> createState() => _SubmitBidScreenState();
}

class _SubmitBidScreenState extends ConsumerState<SubmitBidScreen> {
  final _formKey = GlobalKey<FormState>();
  final _valueCtrl = TextEditingController();
  final _daysCtrl = TextEditingController();
  final _coverCtrl = TextEditingController();
  bool _isLoading = false;
  String? _error;

  @override
  void dispose() {
    _valueCtrl.dispose();
    _daysCtrl.dispose();
    _coverCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });
    final dto = {
      'projectId': widget.projectId,
      'proposedValue': double.parse(_valueCtrl.text.replaceAll(',', '.')),
      'estimatedDays': int.parse(_daysCtrl.text),
      'coverLetter': _coverCtrl.text.trim(),
    };
    final ok = await ref.read(myBidsViewModelProvider.notifier).submit(dto);
    if (!mounted) return;
    if (ok) {
      context.pop();
    } else {
      setState(() {
        _isLoading = false;
        _error = 'Erro ao enviar proposta. Verifique se já enviou uma para este projeto.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Enviar Proposta')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _valueCtrl,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(
                  labelText: 'Valor proposto (R\$)',
                  prefixIcon: Icon(Icons.attach_money),
                  border: OutlineInputBorder(),
                ),
                validator: (v) {
                  final val = double.tryParse(v?.replaceAll(',', '.') ?? '');
                  if (val == null || val <= 0) return 'Valor inválido';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _daysCtrl,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Prazo estimado (dias)',
                  prefixIcon: Icon(Icons.timer_outlined),
                  border: OutlineInputBorder(),
                ),
                validator: (v) {
                  final val = int.tryParse(v ?? '');
                  if (val == null || val <= 0) return 'Número de dias inválido';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _coverCtrl,
                maxLines: 6,
                decoration: const InputDecoration(
                  labelText: 'Carta de apresentação',
                  border: OutlineInputBorder(),
                  alignLabelWithHint: true,
                ),
                validator: (v) => (v == null || v.length < 20)
                    ? 'Descreva sua proposta (mín. 20 caracteres)'
                    : null,
              ),
              if (_error != null) ...[
                const SizedBox(height: 12),
                Text(
                  _error!,
                  style: TextStyle(color: Theme.of(context).colorScheme.error),
                  textAlign: TextAlign.center,
                ),
              ],
              const SizedBox(height: 24),
              FilledButton(
                onPressed: _isLoading ? null : _submit,
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Enviar Proposta'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
