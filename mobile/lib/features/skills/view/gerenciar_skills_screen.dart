import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers.dart';
import '../model/skill_model.dart';
import '../viewmodel/skill_viewmodel.dart';
import 'create_skill_dialog.dart';
import 'add_questions_dialog.dart';
import 'edit_question_dialog.dart';

class GerenciarSkillsScreen extends ConsumerStatefulWidget {
  const GerenciarSkillsScreen({super.key});

  @override
  ConsumerState<GerenciarSkillsScreen> createState() =>
      _GerenciarSkillsScreenState();
}

class _GerenciarSkillsScreenState
    extends ConsumerState<GerenciarSkillsScreen> {
  String? _expandedSkillId;

  @override
  Widget build(BuildContext context) {
    final skillsAsync = ref.watch(skillsCatalogProvider);

    return Scaffold(
      backgroundColor: AppTheme.slate900,
      appBar: AppBar(
        backgroundColor: AppTheme.slate900,
        surfaceTintColor: Colors.transparent,
        title: RichText(
          text: TextSpan(
            style: GoogleFonts.sourceCodePro(
                fontSize: 13, color: AppTheme.slate500),
            children: [
              const TextSpan(text: 'MERAKI // '),
              TextSpan(
                text: 'GERENCIAR SKILLS',
                style: GoogleFonts.sourceCodePro(
                    fontSize: 13,
                    color: Colors.white,
                    fontWeight: FontWeight.w700),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppTheme.brand,
        onPressed: () => _openCreateSkill(context),
        child: const Icon(Icons.add, color: AppTheme.slate900),
      ),
      body: skillsAsync.when(
        loading: () => const Center(
            child: CircularProgressIndicator(color: AppTheme.brand)),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline,
                  color: AppTheme.danger, size: 40),
              const SizedBox(height: 12),
              Text('Erro ao carregar skills',
                  style: AppTheme.mono(color: AppTheme.slate500)),
              const SizedBox(height: 8),
              FilledButton(
                onPressed: () =>
                    ref.read(skillsCatalogProvider.notifier).refresh(),
                child: const Text('Tentar novamente'),
              ),
            ],
          ),
        ),
        data: (skills) => skills.isEmpty
            ? _EmptyState(onAdd: () => _openCreateSkill(context))
            : RefreshIndicator(
                color: AppTheme.brand,
                onRefresh: () =>
                    ref.read(skillsCatalogProvider.notifier).refresh(),
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: skills.length,
                  itemBuilder: (context, index) {
                    final skill = skills[index];
                    final isExpanded = _expandedSkillId == skill.id;
                    return _SkillCard(
                      skill: skill,
                      isExpanded: isExpanded,
                      onToggle: () => setState(() {
                        _expandedSkillId = isExpanded ? null : skill.id;
                      }),
                      onAddQuestions: () =>
                          _openAddQuestions(context, skill),
                      onEditQuestion: (q) =>
                          _openEditQuestion(context, q),
                      onDeleteQuestion: (q) =>
                          _deleteQuestion(context, q),
                    );
                  },
                ),
              ),
      ),
    );
  }

  void _openCreateSkill(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.slate100,
      builder: (_) => CreateSkillDialog(
        onCreated: () =>
            ref.read(skillsCatalogProvider.notifier).refresh(),
      ),
    );
  }

  void _openAddQuestions(BuildContext context, SkillModel skill) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.slate100,
      builder: (_) => AddQuestionsDialog(
        skillId: skill.id,
        skillName: skill.displayName,
        onAdded: () {
          ref.invalidate(skillQuestionsProvider(skill.id));
        },
      ),
    );
  }

  void _openEditQuestion(
      BuildContext context, SkillQuestionModel question) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.slate100,
      builder: (_) => EditQuestionDialog(
        question: question,
        onSaved: () {
          ref.invalidate(skillQuestionsProvider(question.skillId));
        },
      ),
    );
  }

  Future<void> _deleteQuestion(
      BuildContext context, SkillQuestionModel question) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.slate100,
        title: Text('Deletar questão?',
            style: GoogleFonts.sourceCodePro(color: Colors.white)),
        content: Text(
          'Esta ação não pode ser desfeita.',
          style: GoogleFonts.sourceCodePro(color: AppTheme.slate400),
        ),
        actions: [
          TextButton(
            onPressed: () => ctx.pop(false),
            child: const Text('CANCELAR'),
          ),
          TextButton(
            onPressed: () => ctx.pop(true),
            child: const Text('DELETAR',
                style: TextStyle(color: AppTheme.danger)),
          ),
        ],
      ),
    );
    if (confirmed == true && context.mounted) {
      try {
        await ref
            .read(skillRepositoryProvider)
            .deleteQuestion(question.id);
        ref.invalidate(skillQuestionsProvider(question.skillId));
      } catch (_) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Erro ao deletar questão')),
          );
        }
      }
    }
  }
}

// ─── Skill Card ──────────────────────────────────────────────────────────────

class _SkillCard extends ConsumerWidget {
  final SkillModel skill;
  final bool isExpanded;
  final VoidCallback onToggle;
  final VoidCallback onAddQuestions;
  final void Function(SkillQuestionModel) onEditQuestion;
  final void Function(SkillQuestionModel) onDeleteQuestion;

  const _SkillCard({
    required this.skill,
    required this.isExpanded,
    required this.onToggle,
    required this.onAddQuestions,
    required this.onEditQuestion,
    required this.onDeleteQuestion,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppTheme.slate100,
        border: Border.all(
            color: isExpanded ? AppTheme.brand.withValues(alpha: 0.4) : AppTheme.slate200),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        children: [
          InkWell(
            onTap: onToggle,
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  Icon(
                    isExpanded
                        ? Icons.keyboard_arrow_down
                        : Icons.keyboard_arrow_right,
                    color: AppTheme.brand,
                    size: 18,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          skill.displayName,
                          style: GoogleFonts.sourceCodePro(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          skill.name,
                          style: GoogleFonts.sourceCodePro(
                            color: AppTheme.slate500,
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                  ),
                  GestureDetector(
                    onTap: onAddQuestions,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        border: Border.all(
                            color: AppTheme.brand.withValues(alpha: 0.5)),
                        borderRadius: BorderRadius.circular(2),
                      ),
                      child: Text(
                        '+ QUESTÕES',
                        style: GoogleFonts.sourceCodePro(
                          color: AppTheme.brand,
                          fontSize: 9,
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
          if (isExpanded) _QuestionsPanel(
            skillId: skill.id,
            onEdit: onEditQuestion,
            onDelete: onDeleteQuestion,
          ),
        ],
      ),
    );
  }
}

// ─── Questions Panel ─────────────────────────────────────────────────────────

class _QuestionsPanel extends ConsumerWidget {
  final String skillId;
  final void Function(SkillQuestionModel) onEdit;
  final void Function(SkillQuestionModel) onDelete;

  const _QuestionsPanel({
    required this.skillId,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final questionsAsync = ref.watch(skillQuestionsProvider(skillId));

    return questionsAsync.when(
      loading: () => const Padding(
        padding: EdgeInsets.all(16),
        child: Center(
            child:
                CircularProgressIndicator(color: AppTheme.brand, strokeWidth: 2)),
      ),
      error: (_, __) => Padding(
        padding: const EdgeInsets.all(16),
        child: Text('Erro ao carregar questões',
            style: GoogleFonts.sourceCodePro(color: AppTheme.danger, fontSize: 11)),
      ),
      data: (questions) => Column(
        children: [
          const Divider(color: AppTheme.slate200, height: 1),
          ...questions.asMap().entries.map((entry) {
            final i = entry.key;
            final q = entry.value;
            return Container(
              padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
              decoration: BoxDecoration(
                border: Border(
                    bottom: BorderSide(
                        color: AppTheme.slate200.withValues(alpha: 0.5))),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${i + 1}.',
                    style: GoogleFonts.sourceCodePro(
                        color: AppTheme.slate500, fontSize: 10),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          q.text,
                          style: GoogleFonts.sourceCodePro(
                              color: Colors.white, fontSize: 11),
                        ),
                        const SizedBox(height: 4),
                        ...q.options.asMap().entries.map((opt) {
                          final isCorrect = opt.key == q.correctIndex;
                          return Padding(
                            padding: const EdgeInsets.only(top: 2),
                            child: Row(
                              children: [
                                Icon(
                                  isCorrect
                                      ? Icons.check_circle
                                      : Icons.radio_button_unchecked,
                                  size: 12,
                                  color: isCorrect
                                      ? AppTheme.brand
                                      : AppTheme.slate500,
                                ),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    opt.value,
                                    style: GoogleFonts.sourceCodePro(
                                      color: isCorrect
                                          ? AppTheme.brand
                                          : AppTheme.slate400,
                                      fontSize: 10,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                  Column(
                    children: [
                      GestureDetector(
                        onTap: () => onEdit(q),
                        child: const Icon(Icons.edit_outlined,
                            size: 14, color: AppTheme.slate500),
                      ),
                      const SizedBox(height: 8),
                      GestureDetector(
                        onTap: () => onDelete(q),
                        child: const Icon(Icons.delete_outline,
                            size: 14, color: AppTheme.danger),
                      ),
                    ],
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

// ─── Empty State ─────────────────────────────────────────────────────────────

class _EmptyState extends StatelessWidget {
  final VoidCallback onAdd;
  const _EmptyState({required this.onAdd});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.category_outlined,
              color: AppTheme.slate500, size: 48),
          const SizedBox(height: 16),
          Text(
            'NENHUMA SKILL CADASTRADA',
            style: GoogleFonts.sourceCodePro(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.w700,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Crie skills para validar especialistas.',
            style: GoogleFonts.sourceCodePro(
                color: AppTheme.slate500, fontSize: 11),
          ),
          const SizedBox(height: 20),
          GestureDetector(
            onTap: onAdd,
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: AppTheme.brand,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                '+ NOVA SKILL',
                style: GoogleFonts.sourceCodePro(
                  color: AppTheme.slate900,
                  fontWeight: FontWeight.w700,
                  fontSize: 12,
                  letterSpacing: 1.5,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

extension _DialogPop on BuildContext {
  void pop([dynamic result]) => Navigator.of(this).pop(result);
}
