import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
import '../model/portfolio_model.dart';
import '../viewmodel/portfolio_viewmodel.dart';

class CompanyProfileScreen extends ConsumerWidget {
  final String companyId;
  const CompanyProfileScreen({super.key, required this.companyId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync =
        ref.watch(companyProfileViewModelProvider(companyId));

    return Scaffold(
      body: profileAsync.when(
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(
          message: e.toString(),
          onRetry: () => ref.invalidate(
            companyProfileViewModelProvider(companyId),
          ),
        ),
        data: (profile) => _CompanyContent(profile: profile),
      ),
    );
  }
}

// ─── Content ──────────────────────────────────────────────────────────────────

class _CompanyContent extends StatelessWidget {
  final CompanyProfileModel profile;
  const _CompanyContent({required this.profile});

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        // ─── AppBar with hero header ────────────────────────────────────
        SliverAppBar(
          expandedHeight: 200,
          pinned: true,
          backgroundColor: AppTheme.slate900,
          surfaceTintColor: Colors.transparent,
          iconTheme: const IconThemeData(color: Colors.white),
          flexibleSpace: FlexibleSpaceBar(
            background: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [AppTheme.slate900, Color(0xFF1E1B4B)],
                ),
              ),
              child: SafeArea(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(height: 40),
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                        ),
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: Center(
                        child: Text(
                          profile.companyName.isNotEmpty
                              ? profile.companyName[0].toUpperCase()
                              : 'E',
                          style: GoogleFonts.plusJakartaSans(
                            color: Colors.white,
                            fontSize: 28,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      profile.companyName,
                      style: GoogleFonts.plusJakartaSans(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        letterSpacing: -0.5,
                      ),
                    ),
                    if (profile.sector != null && profile.sector!.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(
                          profile.sector!,
                          style: GoogleFonts.plusJakartaSans(
                            color: Colors.white.withOpacity(0.55),
                            fontSize: 13,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),

        // ─── Stats row ─────────────────────────────────────────────────
        SliverToBoxAdapter(
          child: Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Row(
              children: [
                _StatItem(
                  value: profile.totalProjectsCreated.toString(),
                  label: 'Projetos',
                  icon: Icons.folder_rounded,
                ),
                _Divider(),
                _StatItem(
                  value: profile.rating.toStringAsFixed(1),
                  label: 'Avaliação',
                  icon: Icons.star_rounded,
                  iconColor: Colors.amber,
                ),
              ],
            ),
          ),
        ),

        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 40),
          sliver: SliverList(
            delegate: SliverChildListDelegate([
              // ─── About ───────────────────────────────────────────────
              if (profile.description != null &&
                  profile.description!.isNotEmpty) ...[
                _SectionHeader(
                    icon: Icons.info_outline_rounded, title: 'Sobre'),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.04),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Text(
                    profile.description!,
                    style: Theme.of(context)
                        .textTheme
                        .bodyMedium
                        ?.copyWith(color: AppTheme.slate700, height: 1.6),
                  ),
                ),
                const SizedBox(height: 20),
              ],

              // ─── Details ─────────────────────────────────────────────
              _SectionHeader(
                  icon: Icons.business_rounded, title: 'Informações'),
              const SizedBox(height: 10),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    if (profile.sector != null && profile.sector!.isNotEmpty)
                      _InfoTile(
                        icon: Icons.category_rounded,
                        label: 'Setor',
                        value: profile.sector!,
                      ),
                    if (profile.website != null &&
                        profile.website!.isNotEmpty) ...[
                      const Divider(height: 1, indent: 16, endIndent: 16),
                      _InfoTile(
                        icon: Icons.language_rounded,
                        label: 'Website',
                        value: profile.website!,
                        isLink: true,
                      ),
                    ],
                    if ((profile.sector == null || profile.sector!.isEmpty) &&
                        (profile.website == null || profile.website!.isEmpty))
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Text(
                          'Nenhuma informação adicional',
                          style: TextStyle(color: AppTheme.slate400),
                        ),
                      ),
                  ],
                ),
              ),
            ]),
          ),
        ),
      ],
    );
  }
}

// ─── Sub-widgets ──────────────────────────────────────────────────────────────

class _StatItem extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;
  final Color? iconColor;
  const _StatItem({
    required this.value,
    required this.label,
    required this.icon,
    this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon,
                  size: 18, color: iconColor ?? AppTheme.brand),
              const SizedBox(width: 4),
              Text(
                value,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.slate900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 12,
              color: AppTheme.slate400,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class _Divider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(width: 1, height: 40, color: AppTheme.slate200);
  }
}

class _SectionHeader extends StatelessWidget {
  final IconData icon;
  final String title;
  const _SectionHeader({required this.icon, required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppTheme.brand),
        const SizedBox(width: 6),
        Text(
          title,
          style: GoogleFonts.plusJakartaSans(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: AppTheme.slate700,
          ),
        ),
      ],
    );
  }
}

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final bool isLink;
  const _InfoTile({
    required this.icon,
    required this.label,
    required this.value,
    this.isLink = false,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, size: 20, color: AppTheme.brand),
      title: Text(label,
          style: const TextStyle(fontSize: 12, color: AppTheme.slate400)),
      subtitle: Text(
        value,
        style: TextStyle(
          color: isLink ? AppTheme.brand : AppTheme.slate900,
          fontWeight: FontWeight.w500,
          fontSize: 14,
        ),
      ),
      dense: true,
    );
  }
}
