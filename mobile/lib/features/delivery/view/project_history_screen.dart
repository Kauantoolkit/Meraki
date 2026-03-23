import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
import '../model/delivery_model.dart';
import '../viewmodel/delivery_viewmodel.dart';

class ProjectHistoryScreen extends ConsumerStatefulWidget {
  final String projectId;
  const ProjectHistoryScreen({super.key, required this.projectId});

  @override
  ConsumerState<ProjectHistoryScreen> createState() =>
      _ProjectHistoryScreenState();
}

class _ProjectHistoryScreenState extends ConsumerState<ProjectHistoryScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(projectHistoryViewModelProvider.notifier)
          .load(widget.projectId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final historyAsync = ref.watch(projectHistoryViewModelProvider);

    return Scaffold(
      body: historyAsync.when(
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(
          message: e.toString(),
          onRetry: () => ref
              .read(projectHistoryViewModelProvider.notifier)
              .load(widget.projectId),
        ),
        data: (items) => CustomScrollView(
          slivers: [
            SliverAppBar.large(
              title: const Text('Histórico'),
              backgroundColor: AppTheme.slate100,
              surfaceTintColor: Colors.transparent,
              scrolledUnderElevation: 0,
            ),
            if (items.isEmpty)
              const SliverFillRemaining(child: _EmptyHistory())
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
                sliver: SliverList.builder(
                  itemCount: items.length,
                  itemBuilder: (_, i) => _HistoryTile(
                    item: items[i],
                    isLast: i == items.length - 1,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

// ─── Empty ────────────────────────────────────────────────────────────────────

class _EmptyHistory extends StatelessWidget {
  const _EmptyHistory();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: AppTheme.brandLight,
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Icon(
              Icons.history_rounded,
              size: 36,
              color: AppTheme.brand,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Sem registros ainda',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 6),
          Text(
            'As atividades do projeto aparecerão aqui',
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(color: AppTheme.slate400),
          ),
        ],
      ),
    );
  }
}

// ─── History tile ─────────────────────────────────────────────────────────────

class _HistoryTile extends StatelessWidget {
  final ProjectHistoryModel item;
  final bool isLast;
  const _HistoryTile({required this.item, required this.isLast});

  _ActionMeta _meta() => switch (item.action.toUpperCase()) {
        'MILESTONE_SUBMITTED' || 'DELIVERY_SUBMITTED' => _ActionMeta(
            icon: Icons.upload_rounded,
            color: AppTheme.info,
            bg: AppTheme.infoLight,
            label: 'Entrega enviada',
          ),
        'MILESTONE_APPROVED' || 'DELIVERY_APPROVED' => _ActionMeta(
            icon: Icons.check_circle_rounded,
            color: AppTheme.success,
            bg: AppTheme.successLight,
            label: 'Entrega aprovada',
          ),
        'MILESTONE_REJECTED' || 'DELIVERY_REJECTED' => _ActionMeta(
            icon: Icons.cancel_rounded,
            color: AppTheme.danger,
            bg: AppTheme.dangerLight,
            label: 'Entrega rejeitada',
          ),
        'BID_ACCEPTED' => _ActionMeta(
            icon: Icons.handshake_rounded,
            color: AppTheme.success,
            bg: AppTheme.successLight,
            label: 'Proposta aceita',
          ),
        'PROJECT_STARTED' => _ActionMeta(
            icon: Icons.play_circle_rounded,
            color: AppTheme.brand,
            bg: AppTheme.brandLight,
            label: 'Projeto iniciado',
          ),
        'PROJECT_COMPLETED' => _ActionMeta(
            icon: Icons.flag_rounded,
            color: AppTheme.success,
            bg: AppTheme.successLight,
            label: 'Projeto concluído',
          ),
        _ => _ActionMeta(
            icon: Icons.info_rounded,
            color: AppTheme.slate500,
            bg: AppTheme.slate100,
            label: item.action,
          ),
      };

  String _formatDate(String raw) {
    if (raw.isEmpty) return '';
    try {
      final dt = DateTime.parse(raw).toLocal();
      return '${dt.day.toString().padLeft(2, '0')}/'
          '${dt.month.toString().padLeft(2, '0')}/'
          '${dt.year}  '
          '${dt.hour.toString().padLeft(2, '0')}:'
          '${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return raw.substring(0, raw.length.clamp(0, 10));
    }
  }

  @override
  Widget build(BuildContext context) {
    final meta = _meta();

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ─── Timeline line + dot ─────────────────────────────────────
          SizedBox(
            width: 40,
            child: Column(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: meta.bg,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(meta.icon, size: 18, color: meta.color),
                ),
                if (!isLast)
                  Expanded(
                    child: Container(
                      width: 2,
                      margin: const EdgeInsets.symmetric(vertical: 4),
                      color: AppTheme.slate200,
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          // ─── Content ─────────────────────────────────────────────────
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: isLast ? 0 : 20),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            meta.label,
                            style: GoogleFonts.plusJakartaSans(
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                              color: AppTheme.slate900,
                            ),
                          ),
                        ),
                        Text(
                          _formatDate(item.createdAt),
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 11,
                            color: AppTheme.slate400,
                          ),
                        ),
                      ],
                    ),
                    if (item.description != null &&
                        item.description!.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Text(
                        item.description!,
                        style: Theme.of(context)
                            .textTheme
                            .bodySmall
                            ?.copyWith(color: AppTheme.slate500),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionMeta {
  final IconData icon;
  final Color color;
  final Color bg;
  final String label;
  const _ActionMeta({
    required this.icon,
    required this.color,
    required this.bg,
    required this.label,
  });
}
