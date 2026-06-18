import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
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
      'proposedBudget': double.parse(_valueCtrl.text.replaceAll(',', '.')),
      'estimatedDuration': int.parse(_daysCtrl.text),
      'proposal': _coverCtrl.text.trim(),
    };
    final ok = await ref.read(myBidsViewModelProvider.notifier).submit(dto);
    if (!mounted) return;
    if (ok) {
      context.pop();
    } else {
      setState(() {
        _isLoading = false;
        _error =
            'Erro ao enviar proposta. Verifique se já enviou uma para este projeto.';
      });
    }
  }

  InputDecoration _inputDecoration(String label, {IconData? icon}) {
    return InputDecoration(
      labelText: label,
      labelStyle: GoogleFonts.sourceCodePro(
          color: AppTheme.slate500, fontSize: 12),
      prefixIcon: icon != null
          ? Icon(icon, color: AppTheme.slate500, size: 18)
          : null,
      filled: true,
      fillColor: AppTheme.slate100,
      border: OutlineInputBorder(
        borderSide: BorderSide(color: AppTheme.slate200),
        borderRadius: BorderRadius.circular(4),
      ),
      enabledBorder: OutlineInputBorder(
        borderSide: BorderSide(color: AppTheme.slate200),
        borderRadius: BorderRadius.circular(4),
      ),
      focusedBorder: OutlineInputBorder(
        borderSide: const BorderSide(color: AppTheme.brand),
        borderRadius: BorderRadius.circular(4),
      ),
      errorBorder: OutlineInputBorder(
        borderSide: const BorderSide(color: AppTheme.danger),
        borderRadius: BorderRadius.circular(4),
      ),
      errorStyle: GoogleFonts.sourceCodePro(
          color: AppTheme.danger, fontSize: 10),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.slate900,
      appBar: AppBar(
        backgroundColor: AppTheme.slate900,
        surfaceTintColor: Colors.transparent,
        iconTheme: const IconThemeData(color: AppTheme.slate400),
        title: RichText(
          text: TextSpan(
            style: GoogleFonts.sourceCodePro(
                fontSize: 13, color: AppTheme.slate500),
            children: [
              const TextSpan(text: 'MERAKI // '),
              TextSpan(
                text: 'ENVIAR PROPOSTA',
                style: GoogleFonts.sourceCodePro(
                    fontSize: 13,
                    color: Colors.white,
                    fontWeight: FontWeight.w700),
              ),
            ],
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _valueCtrl,
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
                style: GoogleFonts.sourceCodePro(
                    color: Colors.white, fontSize: 13),
                decoration:
                    _inputDecoration('Valor proposto (R\$)', icon: Icons.attach_money),
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
                style: GoogleFonts.sourceCodePro(
                    color: Colors.white, fontSize: 13),
                decoration: _inputDecoration('Prazo estimado (dias)',
                    icon: Icons.timer_outlined),
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
                style: GoogleFonts.sourceCodePro(
                    color: Colors.white, fontSize: 13),
                decoration: _inputDecoration('Carta de apresentação'),
                validator: (v) => (v == null || v.length < 20)
                    ? 'Descreva sua proposta (mín. 20 caracteres)'
                    : null,
              ),
              if (_error != null) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppTheme.dangerLight,
                    border: Border.all(color: AppTheme.danger),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    _error!,
                    style: GoogleFonts.sourceCodePro(
                        color: AppTheme.danger, fontSize: 11),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
              const SizedBox(height: 24),
              SizedBox(
                height: 44,
                child: FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: AppTheme.brand,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(4)),
                  ),
                  onPressed: _isLoading ? null : _submit,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white),
                        )
                      : Text(
                          'ENVIAR PROPOSTA',
                          style: GoogleFonts.sourceCodePro(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.5,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
