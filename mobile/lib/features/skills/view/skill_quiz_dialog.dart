import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../model/skill_model.dart';
import '../viewmodel/skill_viewmodel.dart';

enum QuizMode { profile, project }

class SkillQuizDialog extends ConsumerStatefulWidget {
  final String skillId;
  final String skillName;
  final QuizMode mode;
  final String? companyId; // required for project mode
  final void Function(QuizResultModel result)? onCompleted;

  const SkillQuizDialog({
    super.key,
    required this.skillId,
    required this.skillName,
    this.mode = QuizMode.profile,
    this.companyId,
    this.onCompleted,
  });

  @override
  ConsumerState<SkillQuizDialog> createState() => _SkillQuizDialogState();
}

class _SkillQuizDialogState extends ConsumerState<SkillQuizDialog> {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(skillQuizProvider.notifier).loadQuestions(widget.skillId);
    });
  }

  Future<void> _submit() async {
    final notifier = ref.read(skillQuizProvider.notifier);
    QuizResultModel? result;

    if (widget.mode == QuizMode.profile) {
      result = await notifier.submitProfile(widget.skillId);
    } else {
      result = await notifier.submitProject(
          widget.skillId, widget.companyId ?? '');
    }

    if (result != null && mounted) {
      widget.onCompleted?.call(result);
    }
  }

  @override
  Widget build(BuildContext context) {
    final quizState = ref.watch(skillQuizProvider);

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
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
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'QUIZ DE VALIDAÇÃO',
                          style: GoogleFonts.sourceCodePro(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          widget.skillName,
                          style: GoogleFonts.sourceCodePro(
                              color: AppTheme.brand, fontSize: 11),
                        ),
                      ],
                    ),
                    if (quizState.questions.isNotEmpty)
                      Text(
                        '${_currentIndex + 1}/${quizState.questions.length}',
                        style: GoogleFonts.sourceCodePro(
                            color: AppTheme.slate500, fontSize: 11),
                      ),
                  ],
                ),
              ),
              // Progress bar
              if (quizState.questions.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: LinearProgressIndicator(
                    value: quizState.questions.isEmpty
                        ? 0
                        : (quizState.answers.length /
                            quizState.questions.length),
                    backgroundColor: AppTheme.slate200,
                    valueColor:
                        const AlwaysStoppedAnimation<Color>(AppTheme.brand),
                    minHeight: 3,
                  ),
                ),
              const SizedBox(height: 12),
              // Body
              Expanded(
                child: _buildBody(quizState, scrollController),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildBody(SkillQuizState quizState, ScrollController scrollController) {
    if (quizState.isLoading && quizState.questions.isEmpty) {
      return const Center(
          child: CircularProgressIndicator(color: AppTheme.brand));
    }

    if (quizState.error != null && quizState.questions.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, color: AppTheme.danger, size: 40),
            const SizedBox(height: 12),
            Text(quizState.error!,
                style: GoogleFonts.sourceCodePro(
                    color: AppTheme.slate500, fontSize: 12)),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('FECHAR'),
            ),
          ],
        ),
      );
    }

    // Result screen
    if (quizState.result != null) {
      return _ResultView(
        result: quizState.result!,
        onClose: () => Navigator.of(context).pop(),
      );
    }

    if (quizState.questions.isEmpty) {
      return const Center(
          child: CircularProgressIndicator(color: AppTheme.brand));
    }

    final question = quizState.questions[_currentIndex];
    final selectedIndex = quizState.answers[question.id];

    return ListView(
      controller: scrollController,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      children: [
        // Question text
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppTheme.slate50,
            border: Border.all(color: AppTheme.slate200),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(
            question.text,
            style: GoogleFonts.sourceCodePro(
                color: Colors.white, fontSize: 12, height: 1.5),
          ),
        ),
        const SizedBox(height: 16),
        // Options
        ...List.generate(question.options.length, (oi) {
          final isSelected = selectedIndex == oi;
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: GestureDetector(
              onTap: () {
                ref
                    .read(skillQuizProvider.notifier)
                    .selectAnswer(question.id, oi);
              },
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: isSelected ? AppTheme.brandLight : AppTheme.slate50,
                  border: Border.all(
                    color: isSelected
                        ? AppTheme.brand
                        : AppTheme.slate200,
                    width: isSelected ? 1.5 : 1,
                  ),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isSelected
                            ? AppTheme.brand
                            : Colors.transparent,
                        border: Border.all(
                          color: isSelected
                              ? AppTheme.brand
                              : AppTheme.slate500,
                          width: 1.5,
                        ),
                      ),
                      child: isSelected
                          ? const Icon(Icons.check,
                              size: 14, color: AppTheme.slate900)
                          : null,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        question.options[oi],
                        style: GoogleFonts.sourceCodePro(
                          color: isSelected ? AppTheme.brand : Colors.white,
                          fontSize: 11,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }),
        const SizedBox(height: 20),
        // Navigation
        Row(
          children: [
            if (_currentIndex > 0)
              Expanded(
                child: OutlinedButton(
                  onPressed: () =>
                      setState(() => _currentIndex--),
                  child: Text('ANTERIOR',
                      style: GoogleFonts.sourceCodePro(
                          fontSize: 11, letterSpacing: 1)),
                ),
              ),
            if (_currentIndex > 0) const SizedBox(width: 12),
            Expanded(
              child: _currentIndex < quizState.questions.length - 1
                  ? FilledButton(
                      onPressed: selectedIndex != null
                          ? () => setState(() => _currentIndex++)
                          : null,
                      child: Text('PRÓXIMA',
                          style: GoogleFonts.sourceCodePro(
                              fontSize: 11, letterSpacing: 1)),
                    )
                  : FilledButton(
                      onPressed: quizState.allAnswered && !quizState.isLoading
                          ? _submit
                          : null,
                      child: quizState.isLoading
                          ? const SizedBox(
                              height: 16,
                              width: 16,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2))
                          : Text('ENVIAR',
                              style: GoogleFonts.sourceCodePro(
                                  fontSize: 11, letterSpacing: 1)),
                    ),
            ),
          ],
        ),
        if (quizState.error != null) ...[
          const SizedBox(height: 12),
          Text(quizState.error!,
              style: GoogleFonts.sourceCodePro(
                  color: AppTheme.danger, fontSize: 10),
              textAlign: TextAlign.center),
        ],
      ],
    );
  }
}

// ─── Result View ─────────────────────────────────────────────────────────────

class _ResultView extends StatelessWidget {
  final QuizResultModel result;
  final VoidCallback onClose;

  const _ResultView({required this.result, required this.onClose});

  @override
  Widget build(BuildContext context) {
    final passed = result.passed;
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            passed ? Icons.check_circle : Icons.cancel,
            color: passed ? AppTheme.brand : AppTheme.danger,
            size: 64,
          ),
          const SizedBox(height: 20),
          Text(
            passed ? 'APROVADO!' : 'REPROVADO',
            style: GoogleFonts.sourceCodePro(
              color: passed ? AppTheme.brand : AppTheme.danger,
              fontSize: 20,
              fontWeight: FontWeight.w700,
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.slate50,
              border: Border.all(color: AppTheme.slate200),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Column(
              children: [
                _ResultRow(
                    label: 'PONTUAÇÃO',
                    value: '${(result.score * 100).toStringAsFixed(0)}%'),
                const SizedBox(height: 8),
                _ResultRow(
                    label: 'ACERTOS',
                    value:
                        '${result.correctAnswers}/${result.totalQuestions}'),
              ],
            ),
          ),
          const SizedBox(height: 8),
          if (!passed)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                'Mínimo de 70% para aprovação. Tente novamente.',
                style: GoogleFonts.sourceCodePro(
                    color: AppTheme.slate500, fontSize: 10),
                textAlign: TextAlign.center,
              ),
            ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: onClose,
              child: Text(passed ? 'CONCLUIR' : 'FECHAR',
                  style: GoogleFonts.sourceCodePro(
                      fontSize: 11, letterSpacing: 1)),
            ),
          ),
        ],
      ),
    );
  }
}

class _ResultRow extends StatelessWidget {
  final String label;
  final String value;
  const _ResultRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label,
            style: GoogleFonts.sourceCodePro(
                color: AppTheme.slate500,
                fontSize: 10,
                letterSpacing: 1)),
        Text(value,
            style: GoogleFonts.sourceCodePro(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.w700)),
      ],
    );
  }
}
