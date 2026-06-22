import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
import '../model/portfolio_model.dart';
import '../viewmodel/portfolio_viewmodel.dart';
import '../../skills/viewmodel/skill_viewmodel.dart';

class SpecialistsListScreen extends ConsumerStatefulWidget {
  const SpecialistsListScreen({super.key});

  @override
  ConsumerState<SpecialistsListScreen> createState() =>
      _SpecialistsListScreenState();
}

class _SpecialistsListScreenState
    extends ConsumerState<SpecialistsListScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';
  final Set<String> _selectedSkills = {};

  bool get _hasActiveFilters =>
      _searchQuery.trim().isNotEmpty || _selectedSkills.isNotEmpty;

  void _toggleSkill(String skill) {
    setState(() {
      if (_selectedSkills.contains(skill)) {
        _selectedSkills.remove(skill);
      } else {
        _selectedSkills.add(skill);
      }
    });
  }

  @override
  void initState() {
    super.initState();
    _searchController.addListener(
      () => setState(() => _searchQuery = _searchController.text),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final specialistsAsync = ref.watch(specialistsListViewModelProvider);
    final catalogSkills = (ref.watch(skillsCatalogProvider).valueOrNull ?? [])
        .map((s) => s.name)
        .toSet()
        .toList()
      ..sort();

    return Scaffold(
      body: specialistsAsync.when(
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(
          message: e.toString(),
          onRetry: () => ref
              .read(specialistsListViewModelProvider.notifier)
              .refresh(),
        ),
        data: (specialists) {
          // Filtro client-side: texto (nome/bio) E todas as skills selecionadas
          // (logica AND, em paridade com o frontend React).
          final filtered = specialists.where((s) {
            final q = _searchQuery.trim().toLowerCase();
            final matchesText = q.isEmpty ||
                s.name.toLowerCase().contains(q) ||
                s.bio.toLowerCase().contains(q);
            final matchesSkills = _selectedSkills.isEmpty ||
                _selectedSkills.every((sel) => s.skills
                    .any((ps) => ps.toLowerCase() == sel.toLowerCase()));
            return matchesText && matchesSkills;
          }).toList();

          return RefreshIndicator(
            onRefresh: () => ref
                .read(specialistsListViewModelProvider.notifier)
                .refresh(),
            child: CustomScrollView(
              slivers: [
                // ─── App bar ───────────────────────────────────────────
                SliverAppBar.large(
                  title: const Text('Especialistas'),
                  backgroundColor: AppTheme.slate100,
                  surfaceTintColor: Colors.transparent,
                  scrolledUnderElevation: 0,
                ),

                // ─── Search bar ────────────────────────────────────────
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                    child: Container(
                      height: 48,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppTheme.slate200),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.04),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: TextField(
                        controller: _searchController,
                        style: const TextStyle(fontSize: 14, color: Colors.black87),
                        decoration: InputDecoration(
                          hintText: 'Buscar por nome, bio ou habilidade...',
                          hintStyle: const TextStyle(
                              color: Color(0xFF9E9E9E), fontSize: 14),
                          prefixIcon: const Icon(
                            Icons.search_rounded,
                            size: 20,
                            color: Color(0xFF9E9E9E),
                          ),
                          filled: true,
                          fillColor: Colors.white,
                          suffixIcon: _searchQuery.isNotEmpty
                              ? IconButton(
                                  icon: const Icon(Icons.close_rounded,
                                      size: 18),
                                  onPressed: _searchController.clear,
                                )
                              : null,
                          border: InputBorder.none,
                          contentPadding:
                              const EdgeInsets.symmetric(vertical: 14),
                        ),
                      ),
                    ),
                  ),
                ),

                // ─── Skill filter chips ───────────────────────────────
                if (catalogSkills.isNotEmpty)
                  SliverToBoxAdapter(
                    child: SizedBox(
                      height: 40,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                        children: [
                          for (final skill in catalogSkills)
                            Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: FilterChip(
                                label: Text(skill),
                                selected: _selectedSkills.contains(skill),
                                onSelected: (_) => _toggleSkill(skill),
                                showCheckmark: false,
                                labelStyle: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: _selectedSkills.contains(skill)
                                      ? AppTheme.brand
                                      : AppTheme.slate500,
                                ),
                                backgroundColor: Colors.white,
                                selectedColor: AppTheme.brandLight,
                                side: BorderSide(
                                  color: _selectedSkills.contains(skill)
                                      ? AppTheme.brand
                                      : AppTheme.slate200,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),

                // ─── Counter ──────────────────────────────────────────
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            _hasActiveFilters
                                ? '${filtered.length} de ${specialists.length} especialista${specialists.length != 1 ? 's' : ''}'
                                    '${_selectedSkills.isNotEmpty ? ' · ${_selectedSkills.length} filtro${_selectedSkills.length != 1 ? 's' : ''} ativo${_selectedSkills.length != 1 ? 's' : ''}' : ''}'
                                : '${filtered.length} especialista${filtered.length != 1 ? 's' : ''} encontrado${filtered.length != 1 ? 's' : ''}',
                            style: const TextStyle(
                              color: AppTheme.slate400,
                              fontSize: 13,
                            ),
                          ),
                        ),
                        if (_selectedSkills.isNotEmpty)
                          TextButton(
                            onPressed: () =>
                                setState(() => _selectedSkills.clear()),
                            style: TextButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 8),
                              minimumSize: Size.zero,
                              tapTargetSize:
                                  MaterialTapTargetSize.shrinkWrap,
                            ),
                            child: const Text(
                              'Limpar filtros',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: AppTheme.brand,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),

                // ─── Lista ────────────────────────────────────────────
                if (filtered.isEmpty)
                  SliverFillRemaining(
                    child: _EmptyState(hasSearch: _hasActiveFilters),
                  )
                else
                  SliverPadding(
                    padding:
                        const EdgeInsets.fromLTRB(16, 0, 16, 32),
                    sliver: SliverList.separated(
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) =>
                          const SizedBox(height: 10),
                      itemBuilder: (_, i) =>
                          _SpecialistCard(specialist: filtered[i]),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}

// ─── Empty state ──────────────────────────────────────────────────────────────

class _EmptyState extends StatelessWidget {
  final bool hasSearch;
  const _EmptyState({required this.hasSearch});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppTheme.brandLight,
                borderRadius: BorderRadius.circular(24),
              ),
              child: const Icon(Icons.person_search_rounded,
                  size: 40, color: AppTheme.brand),
            ),
            const SizedBox(height: 20),
            Text(
              hasSearch
                  ? 'Nenhum especialista encontrado'
                  : 'Sem especialistas cadastrados',
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              hasSearch
                  ? 'Tente outras palavras-chave'
                  : 'Especialistas aparecem aqui após se cadastrarem',
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(color: AppTheme.slate400),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Specialist card ──────────────────────────────────────────────────────────

class _SpecialistCard extends StatelessWidget {
  final SpecialistSummaryModel specialist;
  const _SpecialistCard({required this.specialist});

  @override
  Widget build(BuildContext context) {
    final initial = specialist.name.isNotEmpty
        ? specialist.name[0].toUpperCase()
        : 'E';

    return InkWell(
      onTap: () => context.go('/portfolio/${specialist.userId}'),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 28,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ─── Avatar ─────────────────────────────────────────────
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Center(
                child: Text(
                  initial,
                  style: GoogleFonts.plusJakartaSans(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 14),
            // ─── Info ────────────────────────────────────────────────
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          specialist.name,
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 15,
                            color: AppTheme.slate900,
                          ),
                        ),
                      ),
                      // Rating
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.star_rounded,
                              color: Colors.amber, size: 15),
                          const SizedBox(width: 3),
                          Text(
                            specialist.rating.toStringAsFixed(1),
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppTheme.slate700,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  if (specialist.bio.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      specialist.bio,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: AppTheme.slate500,
                        fontSize: 13,
                        height: 1.4,
                      ),
                    ),
                  ],
                  const SizedBox(height: 8),
                  // ─── Skills & stats ─────────────────────────────
                  Row(
                    children: [
                      // Projetos concluídos
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppTheme.successLight,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.check_circle_rounded,
                                size: 12, color: AppTheme.success),
                            const SizedBox(width: 4),
                            Text(
                              '${specialist.completedProjects} projetos',
                              style: const TextStyle(
                                fontSize: 11,
                                color: AppTheme.success,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Primeiras 2 skills
                      ...specialist.skills.take(2).map(
                            (s) => Padding(
                              padding: const EdgeInsets.only(right: 6),
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: AppTheme.brandLight,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  s,
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: AppTheme.brand,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ),
                          ),
                      if (specialist.skills.length > 2)
                        Text(
                          '+${specialist.skills.length - 2}',
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppTheme.slate400,
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.arrow_forward_ios_rounded,
                size: 14, color: AppTheme.slate300),
          ],
        ),
      ),
    );
  }
}
