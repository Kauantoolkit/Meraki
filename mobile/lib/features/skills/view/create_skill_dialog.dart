import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../model/skill_model.dart';
import '../viewmodel/skill_viewmodel.dart';

class CreateSkillDialog extends ConsumerStatefulWidget {
  final VoidCallback onCreated;
  final String? initialName;

  const CreateSkillDialog({
    super.key,
    required this.onCreated,
    this.initialName,
  });

  @override
  ConsumerState<CreateSkillDialog> createState() => _CreateSkillDialogState();
}

class _CreateSkillDialogState extends ConsumerState<CreateSkillDialog> {
  late final TextEditingController _nameCtrl;
  final List<_QuestionInput> _questions = [];
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController(text: widget.initialName ?? '');
    for (int i = 0; i < 10; i++) {
      _questions.add(_QuestionInput());
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    for (final q in _questions) {
      q.dispose();
    }
    super.dispose();
  }

  void _addQuestion() {
    if (_questions.length >= 20) return;
    setState(() => _questions.add(_QuestionInput()));
  }

  void _removeQuestion(int index) {
    if (_questions.length <= 10) return;
    setState(() {
      _questions[index].dispose();
      _questions.removeAt(index);
    });
  }

  Future<void> _save() async {
    final name = _nameCtrl.text.trim();
    if (name.isEmpty) {
      setState(() => _error = 'Nome da skill é obrigatório.');
      return;
    }
    if (_questions.length < 10) {
      setState(() => _error = 'Mínimo de 10 questões.');
      return;
    }
    for (int i = 0; i < _questions.length; i++) {
      final q = _questions[i];
      if (q.textCtrl.text.trim().isEmpty) {
        setState(() => _error = 'Questão ${i + 1}: enunciado obrigatório.');
        return;
      }
      for (int o = 0; o < 4; o++) {
        if (q.optionCtrls[o].text.trim().isEmpty) {
          setState(
              () => _error = 'Questão ${i + 1}: opção ${o + 1} obrigatória.');
          return;
        }
      }
    }

    setState(() {
      _saving = true;
      _error = null;
    });

    final dtos = _questions
        .map((q) => CreateQuestionDto(
              text: q.textCtrl.text.trim(),
              options: q.optionCtrls.map((c) => c.text.trim()).toList(),
              correctIndex: q.correctIndex,
            ))
        .toList();

    final result = await ref
        .read(skillsCatalogProvider.notifier)
        .createSkill(displayName: name, questions: dtos);

    if (!mounted) return;

    if (result != null) {
      widget.onCreated();
      Navigator.of(context).pop();
    } else {
      setState(() {
        _saving = false;
        _error = 'Erro ao criar skill.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.9,
      maxChildSize: 0.95,
      minChildSize: 0.5,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: AppTheme.slate100,
            borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
          ),
          child: Column(
            children: [
              // Handle
              Container(
                margin: const EdgeInsets.symmetric(vertical: 8),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppTheme.slate500,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              // Header
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'CRIAR NOVA SKILL',
                      style: GoogleFonts.sourceCodePro(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1,
                      ),
                    ),
                    Text(
                      '${_questions.length}/20 questões',
                      style: GoogleFonts.sourceCodePro(
                          color: AppTheme.slate500, fontSize: 10),
                    ),
                  ],
                ),
              ),
              // Body
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  children: [
                    // Skill name
                    Text('NOME DA SKILL',
                        style: GoogleFonts.sourceCodePro(
                            color: AppTheme.brand,
                            fontSize: 10,
                            letterSpacing: 1)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _nameCtrl,
                      maxLength: 60,
                      style: GoogleFonts.sourceCodePro(
                          color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'Ex: TypeScript',
                        hintStyle: GoogleFonts.sourceCodePro(
                            color: AppTheme.slate500),
                        counterStyle:
                            const TextStyle(color: AppTheme.slate500),
                      ),
                    ),
                    const SizedBox(height: 20),
                    // Questions
                    ..._questions.asMap().entries.map((entry) {
                      final i = entry.key;
                      final q = entry.value;
                      return _QuestionCard(
                        index: i,
                        input: q,
                        canRemove: _questions.length > 10,
                        onRemove: () => _removeQuestion(i),
                        onCorrectChanged: (v) =>
                            setState(() => q.correctIndex = v),
                      );
                    }),
                    const SizedBox(height: 8),
                    if (_questions.length < 20)
                      GestureDetector(
                        onTap: _addQuestion,
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            border: Border.all(
                                color: AppTheme.brand.withOpacity(0.5)),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Center(
                            child: Text(
                              '+ ADICIONAR QUESTÃO',
                              style: GoogleFonts.sourceCodePro(
                                color: AppTheme.brand,
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 1,
                              ),
                            ),
                          ),
                        ),
                      ),
                    if (_error != null) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppTheme.dangerLight,
                          border:
                              Border.all(color: AppTheme.danger.withOpacity(0.3)),
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
                                : Text('CRIAR SKILL',
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

// ─── Question Card ───────────────────────────────────────────────────────────

class _QuestionCard extends StatelessWidget {
  final int index;
  final _QuestionInput input;
  final bool canRemove;
  final VoidCallback onRemove;
  final ValueChanged<int> onCorrectChanged;

  const _QuestionCard({
    required this.index,
    required this.input,
    required this.canRemove,
    required this.onRemove,
    required this.onCorrectChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.slate50,
        border: Border.all(color: AppTheme.slate200),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Questão ${index + 1}',
                  style: GoogleFonts.sourceCodePro(
                      color: AppTheme.slate500, fontSize: 10)),
              if (canRemove)
                GestureDetector(
                  onTap: onRemove,
                  child: const Icon(Icons.close,
                      size: 14, color: AppTheme.danger),
                ),
            ],
          ),
          const SizedBox(height: 8),
          TextField(
            controller: input.textCtrl,
            maxLength: 300,
            style: GoogleFonts.sourceCodePro(
                color: Colors.white, fontSize: 11),
            decoration: InputDecoration(
              hintText: 'Enunciado da questão',
              hintStyle:
                  GoogleFonts.sourceCodePro(color: AppTheme.slate500),
              counterStyle: const TextStyle(color: AppTheme.slate500),
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(
                  horizontal: 10, vertical: 8),
            ),
          ),
          const SizedBox(height: 8),
          ...List.generate(4, (oi) {
            final isCorrect = input.correctIndex == oi;
            return Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => onCorrectChanged(oi),
                    child: Icon(
                      isCorrect
                          ? Icons.radio_button_checked
                          : Icons.radio_button_unchecked,
                      size: 16,
                      color: isCorrect ? AppTheme.brand : AppTheme.slate500,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: input.optionCtrls[oi],
                      maxLength: 200,
                      style: GoogleFonts.sourceCodePro(
                          color: Colors.white, fontSize: 10),
                      decoration: InputDecoration(
                        hintText:
                            'Opção ${oi + 1}${isCorrect ? ' (correta)' : ''}',
                        hintStyle: GoogleFonts.sourceCodePro(
                            color: AppTheme.slate500),
                        counterText: '',
                        isDense: true,
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 6),
                        enabledBorder: UnderlineInputBorder(
                          borderSide: BorderSide(
                            color: isCorrect
                                ? AppTheme.brand.withOpacity(0.5)
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
        ],
      ),
    );
  }
}

// ─── Question Input Model ────────────────────────────────────────────────────

class _QuestionInput {
  final TextEditingController textCtrl = TextEditingController();
  final List<TextEditingController> optionCtrls =
      List.generate(4, (_) => TextEditingController());
  int correctIndex = 0;

  void dispose() {
    textCtrl.dispose();
    for (final c in optionCtrls) {
      c.dispose();
    }
  }
}
