import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../skills/model/skill_model.dart';
import '../../skills/view/create_skill_dialog.dart';
import '../../skills/viewmodel/skill_viewmodel.dart';
import '../viewmodel/projects_viewmodel.dart';

class CreateProjectScreen extends ConsumerStatefulWidget {
  const CreateProjectScreen({super.key});

  @override
  ConsumerState<CreateProjectScreen> createState() =>
      _CreateProjectScreenState();
}

class _CreateProjectScreenState extends ConsumerState<CreateProjectScreen> {
  final _pageController = PageController();
  int _currentStep = 0;

  // Step 1
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();

  // Step 2
  final _skillSearchCtrl = TextEditingController();
  final List<String> _skills = [];

  // Step 3
  final List<_MilestoneDraft> _milestones = [
    _MilestoneDraft(),
    _MilestoneDraft(),
  ];

  // Step 4
  final _budgetCtrl = TextEditingController();
  final _deadlineCtrl = TextEditingController();
  DateTime? _deadline;

  String? _error;
  bool _isLoading = false;

  @override
  void dispose() {
    _pageController.dispose();
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _skillSearchCtrl.dispose();
    _budgetCtrl.dispose();
    _deadlineCtrl.dispose();
    for (final m in _milestones) {
      m.dispose();
    }
    super.dispose();
  }

  double get _milestonesTotal =>
      _milestones.fold(0.0, (sum, m) {
        final v = double.tryParse(m.amountCtrl.text.replaceAll(',', '.'));
        return sum + (v ?? 0);
      });

  bool _validateStep(int step) {
    switch (step) {
      case 0:
        if (_titleCtrl.text.trim().length < 10) {
          setState(() => _error = 'Título deve ter pelo menos 10 caracteres');
          return false;
        }
        if (_descCtrl.text.trim().isEmpty) {
          setState(() => _error = 'Descrição é obrigatória');
          return false;
        }
        break;
      case 1:
        if (_skills.isEmpty) {
          setState(() => _error = 'Adicione pelo menos uma skill');
          return false;
        }
        break;
      case 2:
        if (_milestones.isEmpty) {
          setState(() => _error = 'Adicione pelo menos um milestone');
          return false;
        }
        for (int i = 0; i < _milestones.length; i++) {
          final m = _milestones[i];
          if (m.titleCtrl.text.trim().isEmpty) {
            setState(() => _error = 'Milestone ${i + 1}: título obrigatório');
            return false;
          }
          final amount =
              double.tryParse(m.amountCtrl.text.replaceAll(',', '.'));
          if (amount == null || amount <= 0) {
            setState(() => _error = 'Milestone ${i + 1}: valor inválido');
            return false;
          }
        }
        break;
      case 3:
        final budget =
            double.tryParse(_budgetCtrl.text.replaceAll(',', '.'));
        if (budget == null || budget <= 0) {
          setState(() => _error = 'Orçamento inválido');
          return false;
        }
        if (budget < _milestonesTotal) {
          setState(() =>
              _error = 'Orçamento deve ser >= total dos milestones');
          return false;
        }
        if (_deadline == null) {
          setState(() => _error = 'Selecione o prazo final');
          return false;
        }
        break;
    }
    setState(() => _error = null);
    return true;
  }

  void _goToStep(int step) {
    if (step > _currentStep && !_validateStep(_currentStep)) return;
    // Step 4 (orçamento): pré-preenche com a soma das milestones, em paridade
    // com o frontend React.
    if (step == 3 && _milestonesTotal > 0) {
      final total = _milestonesTotal;
      _budgetCtrl.text = total == total.roundToDouble()
          ? total.toInt().toString()
          : total.toString();
    }
    setState(() {
      _currentStep = step;
      _error = null;
    });
    _pageController.animateToPage(step,
        duration: const Duration(milliseconds: 250), curve: Curves.easeInOut);
  }

  void _next() => _goToStep(_currentStep + 1);
  void _prev() => _goToStep(_currentStep - 1);

  Future<void> _submit() async {
    if (!_validateStep(3)) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });

    final vm = ref.read(createProjectViewModelProvider.notifier);
    // Clear and set requirements
    final state = ref.read(createProjectViewModelProvider);
    for (int i = state.requirements.length - 1; i >= 0; i--) {
      vm.removeRequirement(i);
    }
    for (final s in _skills) {
      vm.addRequirement(s);
    }
    // Clear and set milestones
    for (int i = state.milestones.length - 1; i >= 0; i--) {
      vm.removeMilestone(i);
    }
    for (final m in _milestones) {
      vm.addMilestone(MilestoneDraft(
        title: m.titleCtrl.text.trim(),
        description: m.descCtrl.text.trim().isEmpty
            ? m.titleCtrl.text.trim()
            : m.descCtrl.text.trim(),
        amount: double.parse(m.amountCtrl.text.replaceAll(',', '.')),
      ));
    }

    final ok = await vm.submit(
      title: _titleCtrl.text.trim(),
      description: _descCtrl.text.trim(),
      budget: _budgetCtrl.text,
      deadline: _deadlineCtrl.text,
    );

    if (!mounted) return;
    if (ok) {
      context.go('/projects');
    } else {
      setState(() {
        _isLoading = false;
        _error = ref.read(createProjectViewModelProvider).error ??
            'Erro ao criar projeto.';
      });
    }
  }

  void _addSkill(String skill) {
    final lower = skill.toLowerCase().trim();
    if (lower.isEmpty || _skills.contains(lower)) return;
    setState(() => _skills.add(lower));
    _skillSearchCtrl.clear();
  }

  void _openCreateSkillInline() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.slate100,
      builder: (_) => CreateSkillDialog(
        initialName: _skillSearchCtrl.text.trim(),
        onCreated: () {
          ref.read(skillsCatalogProvider.notifier).refresh();
          if (_skillSearchCtrl.text.trim().isNotEmpty) {
            _addSkill(_skillSearchCtrl.text.trim());
          }
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
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
              const TextSpan(text: 'NOVO PROJETO // '),
              TextSpan(
                text: 'STEP ${_currentStep + 1}/4',
                style: GoogleFonts.sourceCodePro(
                    fontSize: 13,
                    color: AppTheme.brand,
                    fontWeight: FontWeight.w700),
              ),
            ],
          ),
        ),
      ),
      body: Column(
        children: [
          // Step indicators
          _StepIndicator(currentStep: _currentStep, onTap: _goToStep),
          // Error
          if (_error != null)
            Container(
              margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppTheme.dangerLight,
                border: Border.all(color: AppTheme.danger.withOpacity(0.3)),
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
          // Pages
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _Step1Base(
                  titleCtrl: _titleCtrl,
                  descCtrl: _descCtrl,
                ),
                _Step2Skills(
                  searchCtrl: _skillSearchCtrl,
                  skills: _skills,
                  onAdd: _addSkill,
                  onRemove: (i) => setState(() => _skills.removeAt(i)),
                  onCreateSkill: _openCreateSkillInline,
                ),
                _Step3Milestones(
                  milestones: _milestones,
                  onAdd: () => setState(() => _milestones.add(_MilestoneDraft())),
                  onRemove: (i) => setState(() {
                    _milestones[i].dispose();
                    _milestones.removeAt(i);
                  }),
                  total: _milestonesTotal,
                ),
                _Step4Budget(
                  budgetCtrl: _budgetCtrl,
                  deadlineCtrl: _deadlineCtrl,
                  milestonesTotal: _milestonesTotal,
                  onPickDeadline: () async {
                    final now = DateTime.now();
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: now.add(const Duration(days: 30)),
                      firstDate: now.add(const Duration(days: 1)),
                      lastDate: now.add(const Duration(days: 365 * 2)),
                    );
                    if (picked != null) {
                      setState(() {
                        _deadline = picked;
                        _deadlineCtrl.text =
                            picked.toIso8601String().substring(0, 10);
                      });
                    }
                  },
                ),
              ],
            ),
          ),
          // Navigation buttons
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: AppTheme.slate200)),
            ),
            child: Row(
              children: [
                if (_currentStep > 0)
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _prev,
                      child: Text('VOLTAR',
                          style: GoogleFonts.sourceCodePro(
                              fontSize: 11, letterSpacing: 1)),
                    ),
                  ),
                if (_currentStep > 0) const SizedBox(width: 12),
                Expanded(
                  child: _currentStep < 3
                      ? FilledButton(
                          onPressed: _next,
                          child: Text('PRÓXIMO',
                              style: GoogleFonts.sourceCodePro(
                                  fontSize: 11, letterSpacing: 1)),
                        )
                      : FilledButton(
                          onPressed: _isLoading ? null : _submit,
                          child: _isLoading
                              ? const SizedBox(
                                  height: 16,
                                  width: 16,
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2))
                              : Text('PUBLICAR',
                                  style: GoogleFonts.sourceCodePro(
                                      fontSize: 11, letterSpacing: 1)),
                        ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Step Indicator ──────────────────────────────────────────────────────────

class _StepIndicator extends StatelessWidget {
  final int currentStep;
  final void Function(int) onTap;

  const _StepIndicator({required this.currentStep, required this.onTap});

  static const _labels = ['BASE', 'SKILLS', 'MILESTONES', 'BUDGET'];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: List.generate(4, (i) {
          final isActive = i == currentStep;
          final isDone = i < currentStep;
          return Expanded(
            child: GestureDetector(
              onTap: () => onTap(i),
              child: Column(
                children: [
                  Container(
                    height: 3,
                    margin: const EdgeInsets.symmetric(horizontal: 2),
                    decoration: BoxDecoration(
                      color: isDone
                          ? AppTheme.brand
                          : isActive
                              ? AppTheme.brand.withOpacity(0.6)
                              : AppTheme.slate200,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _labels[i],
                    style: GoogleFonts.sourceCodePro(
                      fontSize: 8,
                      color: isActive || isDone
                          ? AppTheme.brand
                          : AppTheme.slate500,
                      fontWeight:
                          isActive ? FontWeight.w700 : FontWeight.w500,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }
}

// ─── Step 1: Base ────────────────────────────────────────────────────────────

class _Step1Base extends StatelessWidget {
  final TextEditingController titleCtrl;
  final TextEditingController descCtrl;

  const _Step1Base({required this.titleCtrl, required this.descCtrl});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('TÍTULO DO PROJETO',
            style: GoogleFonts.sourceCodePro(
                color: AppTheme.brand, fontSize: 10, letterSpacing: 1)),
        const SizedBox(height: 6),
        TextField(
          controller: titleCtrl,
          maxLength: 120,
          style: GoogleFonts.sourceCodePro(color: Colors.white, fontSize: 13),
          decoration: InputDecoration(
            hintText: 'Ex: App de delivery em Flutter',
            hintStyle: GoogleFonts.sourceCodePro(color: AppTheme.slate500),
            counterStyle: const TextStyle(color: AppTheme.slate500),
          ),
        ),
        const SizedBox(height: 20),
        Text('DESCRIÇÃO',
            style: GoogleFonts.sourceCodePro(
                color: AppTheme.brand, fontSize: 10, letterSpacing: 1)),
        const SizedBox(height: 6),
        TextField(
          controller: descCtrl,
          maxLines: 6,
          maxLength: 2000,
          style: GoogleFonts.sourceCodePro(color: Colors.white, fontSize: 12),
          decoration: InputDecoration(
            hintText: 'Descreva o projeto em detalhes...',
            hintStyle: GoogleFonts.sourceCodePro(color: AppTheme.slate500),
            counterStyle: const TextStyle(color: AppTheme.slate500),
            alignLabelWithHint: true,
          ),
        ),
      ],
    );
  }
}

// ─── Step 2: Skills ──────────────────────────────────────────────────────────

class _Step2Skills extends ConsumerWidget {
  final TextEditingController searchCtrl;
  final List<String> skills;
  final void Function(String) onAdd;
  final void Function(int) onRemove;
  final VoidCallback onCreateSkill;

  const _Step2Skills({
    required this.searchCtrl,
    required this.skills,
    required this.onAdd,
    required this.onRemove,
    required this.onCreateSkill,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final catalogAsync = ref.watch(skillsCatalogProvider);
    final query = searchCtrl.text.toLowerCase().trim();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('SKILLS / TECNOLOGIAS',
            style: GoogleFonts.sourceCodePro(
                color: AppTheme.brand, fontSize: 10, letterSpacing: 1)),
        const SizedBox(height: 6),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: searchCtrl,
                style: GoogleFonts.sourceCodePro(
                    color: Colors.white, fontSize: 12),
                decoration: InputDecoration(
                  hintText: 'Buscar ou digitar skill...',
                  hintStyle:
                      GoogleFonts.sourceCodePro(color: AppTheme.slate500),
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 10),
                ),
                onSubmitted: onAdd,
              ),
            ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: () => onAdd(searchCtrl.text),
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppTheme.brand,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Icon(Icons.add, color: AppTheme.slate900, size: 18),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        // Catalog suggestions
        catalogAsync.when(
          loading: () => const SizedBox.shrink(),
          error: (_, __) => const SizedBox.shrink(),
          data: (catalog) {
            final suggestions = catalog
                .where((s) =>
                    !skills.contains(s.name) &&
                    (query.isEmpty ||
                        s.displayName.toLowerCase().contains(query) ||
                        s.name.toLowerCase().contains(query)))
                .take(5)
                .toList();
            if (suggestions.isEmpty) return const SizedBox.shrink();
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('CATÁLOGO',
                    style: GoogleFonts.sourceCodePro(
                        color: AppTheme.slate500,
                        fontSize: 9,
                        letterSpacing: 1)),
                const SizedBox(height: 4),
                Wrap(
                  spacing: 6,
                  runSpacing: 4,
                  children: suggestions.map((s) {
                    return GestureDetector(
                      onTap: () => onAdd(s.name),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          border: Border.all(
                              color: AppTheme.brand.withOpacity(0.4)),
                          borderRadius: BorderRadius.circular(2),
                        ),
                        child: Text(
                          s.displayName,
                          style: GoogleFonts.sourceCodePro(
                              color: AppTheme.brand, fontSize: 10),
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 8),
              ],
            );
          },
        ),
        // Create new skill button
        GestureDetector(
          onTap: onCreateSkill,
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              children: [
                Icon(Icons.add_circle_outline,
                    size: 14, color: AppTheme.brand.withOpacity(0.7)),
                const SizedBox(width: 6),
                Text(
                  'Criar skill não encontrada no catálogo',
                  style: GoogleFonts.sourceCodePro(
                      color: AppTheme.brand.withOpacity(0.7), fontSize: 10),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        // Selected skills
        if (skills.isNotEmpty) ...[
          Text('SELECIONADAS (${skills.length})',
              style: GoogleFonts.sourceCodePro(
                  color: AppTheme.slate500, fontSize: 9, letterSpacing: 1)),
          const SizedBox(height: 6),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: skills.asMap().entries.map((e) {
              return Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                decoration: BoxDecoration(
                  color: AppTheme.brandLight,
                  border: Border.all(color: AppTheme.brand.withOpacity(0.4)),
                  borderRadius: BorderRadius.circular(2),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      e.value,
                      style: GoogleFonts.sourceCodePro(
                          color: AppTheme.brand, fontSize: 10),
                    ),
                    const SizedBox(width: 6),
                    GestureDetector(
                      onTap: () => onRemove(e.key),
                      child: const Icon(Icons.close,
                          size: 12, color: AppTheme.slate500),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ],
    );
  }
}

// ─── Step 3: Milestones ──────────────────────────────────────────────────────

class _Step3Milestones extends StatelessWidget {
  final List<_MilestoneDraft> milestones;
  final VoidCallback onAdd;
  final void Function(int) onRemove;
  final double total;

  const _Step3Milestones({
    required this.milestones,
    required this.onAdd,
    required this.onRemove,
    required this.total,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('MILESTONES (${milestones.length})',
                style: GoogleFonts.sourceCodePro(
                    color: AppTheme.brand, fontSize: 10, letterSpacing: 1)),
            Text(
              'Total: R\$ ${total.toStringAsFixed(2).replaceAll('.', ',')}',
              style: GoogleFonts.sourceCodePro(
                  color: AppTheme.brand,
                  fontSize: 11,
                  fontWeight: FontWeight.w700),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ...milestones.asMap().entries.map((entry) {
          final i = entry.key;
          final m = entry.value;
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.slate100,
              border: Border.all(color: AppTheme.slate200),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('M${i + 1}',
                        style: GoogleFonts.sourceCodePro(
                            color: AppTheme.brand,
                            fontSize: 10,
                            fontWeight: FontWeight.w700)),
                    if (milestones.length > 1)
                      GestureDetector(
                        onTap: () => onRemove(i),
                        child: const Icon(Icons.close,
                            size: 14, color: AppTheme.danger),
                      ),
                  ],
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: m.titleCtrl,
                  maxLength: 80,
                  style: GoogleFonts.sourceCodePro(
                      color: Colors.white, fontSize: 11),
                  decoration: InputDecoration(
                    hintText: 'Título do milestone',
                    hintStyle:
                        GoogleFonts.sourceCodePro(color: AppTheme.slate500),
                    counterText: '',
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 8),
                  ),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: m.descCtrl,
                  maxLines: 2,
                  maxLength: 500,
                  style: GoogleFonts.sourceCodePro(
                      color: Colors.white, fontSize: 10),
                  decoration: InputDecoration(
                    hintText: 'Descrição (opcional)',
                    hintStyle:
                        GoogleFonts.sourceCodePro(color: AppTheme.slate500),
                    counterText: '',
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 8),
                  ),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: m.amountCtrl,
                  keyboardType:
                      const TextInputType.numberWithOptions(decimal: true),
                  style: GoogleFonts.sourceCodePro(
                      color: Colors.white, fontSize: 11),
                  decoration: InputDecoration(
                    hintText: 'Valor (R\$)',
                    hintStyle:
                        GoogleFonts.sourceCodePro(color: AppTheme.slate500),
                    isDense: true,
                    prefixText: 'R\$ ',
                    prefixStyle: GoogleFonts.sourceCodePro(
                        color: AppTheme.slate500, fontSize: 11),
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 8),
                  ),
                ),
              ],
            ),
          );
        }),
        const SizedBox(height: 8),
        GestureDetector(
          onTap: onAdd,
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 10),
            decoration: BoxDecoration(
              border: Border.all(color: AppTheme.brand.withOpacity(0.5)),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Center(
              child: Text(
                '+ ADICIONAR MILESTONE',
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
      ],
    );
  }
}

// ─── Step 4: Budget & Deadline ───────────────────────────────────────────────

class _Step4Budget extends StatelessWidget {
  final TextEditingController budgetCtrl;
  final TextEditingController deadlineCtrl;
  final double milestonesTotal;
  final VoidCallback onPickDeadline;

  const _Step4Budget({
    required this.budgetCtrl,
    required this.deadlineCtrl,
    required this.milestonesTotal,
    required this.onPickDeadline,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('ORÇAMENTO',
            style: GoogleFonts.sourceCodePro(
                color: AppTheme.brand, fontSize: 10, letterSpacing: 1)),
        const SizedBox(height: 6),
        TextField(
          controller: budgetCtrl,
          keyboardType:
              const TextInputType.numberWithOptions(decimal: true),
          style: GoogleFonts.sourceCodePro(color: Colors.white, fontSize: 14),
          decoration: InputDecoration(
            hintText: '0,00',
            hintStyle: GoogleFonts.sourceCodePro(color: AppTheme.slate500),
            prefixText: 'R\$ ',
            prefixStyle: GoogleFonts.sourceCodePro(
                color: AppTheme.slate500, fontSize: 14),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Total milestones: R\$ ${milestonesTotal.toStringAsFixed(2).replaceAll('.', ',')}',
          style: GoogleFonts.sourceCodePro(
              color: AppTheme.slate500, fontSize: 10),
        ),
        const SizedBox(height: 24),
        Text('PRAZO FINAL',
            style: GoogleFonts.sourceCodePro(
                color: AppTheme.brand, fontSize: 10, letterSpacing: 1)),
        const SizedBox(height: 6),
        GestureDetector(
          onTap: onPickDeadline,
          child: AbsorbPointer(
            child: TextField(
              controller: deadlineCtrl,
              style:
                  GoogleFonts.sourceCodePro(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: 'Selecionar data',
                hintStyle:
                    GoogleFonts.sourceCodePro(color: AppTheme.slate500),
                prefixIcon:
                    const Icon(Icons.calendar_today, size: 18),
              ),
            ),
          ),
        ),
        const SizedBox(height: 24),
        // Summary
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppTheme.slate100,
            border: Border.all(color: AppTheme.slate200),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('RESUMO',
                  style: GoogleFonts.sourceCodePro(
                      color: AppTheme.slate500,
                      fontSize: 9,
                      letterSpacing: 1)),
              const SizedBox(height: 8),
              Text(
                'Ao publicar, o projeto ficará visível para especialistas qualificados nas skills selecionadas.',
                style: GoogleFonts.sourceCodePro(
                    color: AppTheme.slate400, fontSize: 10, height: 1.5),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ─── Milestone Draft ─────────────────────────────────────────────────────────

class _MilestoneDraft {
  final TextEditingController titleCtrl = TextEditingController();
  final TextEditingController descCtrl = TextEditingController();
  final TextEditingController amountCtrl = TextEditingController();

  void dispose() {
    titleCtrl.dispose();
    descCtrl.dispose();
    amountCtrl.dispose();
  }
}
