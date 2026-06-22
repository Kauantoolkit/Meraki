import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers.dart';
import '../model/skill_model.dart';

class EditQuestionDialog extends ConsumerStatefulWidget {
  final SkillQuestionModel question;
  final VoidCallback onSaved;

  const EditQuestionDialog({
    super.key,
    required this.question,
    required this.onSaved,
  });

  @override
  ConsumerState<EditQuestionDialog> createState() =>
      _EditQuestionDialogState();
}

class _EditQuestionDialogState extends ConsumerState<EditQuestionDialog> {
  late final TextEditingController _textCtrl;
  late final List<TextEditingController> _optionCtrls;
  late int _correctIndex;
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _textCtrl = TextEditingController(text: widget.question.text);
    _optionCtrls = widget.question.options
        .map((o) => TextEditingController(text: o))
        .toList();
    while (_optionCtrls.length < 4) {
      _optionCtrls.add(TextEditingController());
    }
    _correctIndex = widget.question.correctIndex ?? 0;
  }

  @override
  void dispose() {
    _textCtrl.dispose();
    for (final c in _optionCtrls) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _save() async {
    if (_textCtrl.text.trim().isEmpty) {
      setState(() => _error = 'Enunciado obrigatório.');
      return;
    }
    for (int o = 0; o < 4; o++) {
      if (_optionCtrls[o].text.trim().isEmpty) {
        setState(() => _error = 'Opção ${o + 1} obrigatória.');
        return;
      }
    }

    setState(() {
      _saving = true;
      _error = null;
    });

    try {
      await ref.read(skillRepositoryProvider).updateQuestion(
            widget.question.id,
            text: _textCtrl.text.trim(),
            options: _optionCtrls.map((c) => c.text.trim()).toList(),
            correctIndex: _correctIndex,
          );
      if (!mounted) return;
      widget.onSaved();
      Navigator.of(context).pop();
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _saving = false;
        _error = 'Erro ao salvar questão.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.65,
      maxChildSize: 0.85,
      minChildSize: 0.4,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: AppTheme.slate100,
            borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
          ),
          child: Column(
            children: [
              Container(
                margin: const EdgeInsets.symmetric(vertical: 8),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppTheme.slate500,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'EDITAR QUESTÃO',
                    style: GoogleFonts.sourceCodePro(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1,
                    ),
                  ),
                ),
              ),
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  children: [
                    Text('ENUNCIADO',
                        style: GoogleFonts.sourceCodePro(
                            color: AppTheme.brand,
                            fontSize: 10,
                            letterSpacing: 1)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _textCtrl,
                      maxLength: 300,
                      maxLines: 3,
                      style: GoogleFonts.sourceCodePro(
                          color: Colors.white, fontSize: 12),
                      decoration: InputDecoration(
                        hintText: 'Enunciado da questão',
                        hintStyle:
                            GoogleFonts.sourceCodePro(color: AppTheme.slate500),
                        counterStyle:
                            const TextStyle(color: AppTheme.slate500),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text('OPÇÕES',
                        style: GoogleFonts.sourceCodePro(
                            color: AppTheme.brand,
                            fontSize: 10,
                            letterSpacing: 1)),
                    const SizedBox(height: 8),
                    ...List.generate(4, (oi) {
                      final isCorrect = _correctIndex == oi;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          children: [
                            GestureDetector(
                              onTap: () =>
                                  setState(() => _correctIndex = oi),
                              child: Icon(
                                isCorrect
                                    ? Icons.radio_button_checked
                                    : Icons.radio_button_unchecked,
                                size: 18,
                                color: isCorrect
                                    ? AppTheme.brand
                                    : AppTheme.slate500,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: TextField(
                                controller: _optionCtrls[oi],
                                maxLength: 200,
                                style: GoogleFonts.sourceCodePro(
                                    color: Colors.white, fontSize: 11),
                                decoration: InputDecoration(
                                  hintText:
                                      'Opção ${oi + 1}${isCorrect ? ' (correta)' : ''}',
                                  hintStyle: GoogleFonts.sourceCodePro(
                                      color: AppTheme.slate500),
                                  counterText: '',
                                  isDense: true,
                                  contentPadding: const EdgeInsets.symmetric(
                                      horizontal: 10, vertical: 8),
                                  enabledBorder: UnderlineInputBorder(
                                    borderSide: BorderSide(
                                      color: isCorrect
                                          ? AppTheme.brand.withValues(alpha: 0.5)
                                          : AppTheme.slate200,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    }),
                    if (_error != null) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppTheme.dangerLight,
                          border: Border.all(
                              color: AppTheme.danger.withValues(alpha: 0.3)),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline,
                                color: AppTheme.danger, size: 14),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(_error!,
                                  style: GoogleFonts.sourceCodePro(
                                      color: AppTheme.danger, fontSize: 10)),
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => Navigator.of(context).pop(),
                            child: Text('CANCELAR',
                                style: GoogleFonts.sourceCodePro(
                                    fontSize: 11, letterSpacing: 1)),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: FilledButton(
                            onPressed: _saving ? null : _save,
                            child: _saving
                                ? const SizedBox(
                                    height: 16,
                                    width: 16,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2))
                                : Text('SALVAR',
                                    style: GoogleFonts.sourceCodePro(
                                        fontSize: 11, letterSpacing: 1)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
