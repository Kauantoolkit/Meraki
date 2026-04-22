import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
import '../model/portfolio_model.dart';
import '../viewmodel/portfolio_viewmodel.dart';

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
          // Filtro client-side por nome, bio ou skills
          final filtered = _searchQuery.isEmpty
              ? specialists
              : specialists.where((s) {
                  final q = _searchQuery.toLowerCase();
                  return s.name.toLowerCase().contains(q) ||
                      s.bio.toLowerCase().contains(q) ||
                      s.skills.any((sk) => sk.toLowerCase().contains(q));
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

                // ─── Counter ──────────────────────────────────────────
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                    child: Text(
                      '${filtered.length} especialista${filtered.length != 1 ? 's' : ''} encontrado${filtered.length != 1 ? 's' : ''}',
                      style: TextStyle(
                        color: AppTheme.slate400,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ),

                // ─── Lista ────────────────────────────────────────────
                if (filtered.isEmpty)
                  SliverFillRemaining(
                    child: _EmptyState(hasSearch: _searchQuery.isNotEmpty),
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
