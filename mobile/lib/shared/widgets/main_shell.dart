import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';
import '../../features/auth/viewmodel/auth_viewmodel.dart';

class MainShell extends ConsumerWidget {
  final Widget child;
  const MainShell({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authViewModelProvider).user;
    final isSpecialist = user?.isSpecialist ?? false;
    final location = GoRouterState.of(context).uri.toString();

    if (isSpecialist) {
      return _SpecialistShell(location: location, child: child);
    }
    return _CompanyShell(location: location, child: child);
  }
}

// ─── Company shell ────────────────────────────────────────────────────────────

class _CompanyShell extends StatelessWidget {
  final Widget child;
  final String location;
  const _CompanyShell({required this.child, required this.location});

  @override
  Widget build(BuildContext context) {
    int selectedIndex = 0;
    if (location.startsWith('/projects')) selectedIndex = 0;
    if (location.startsWith('/payments')) selectedIndex = 1;
    if (location.startsWith('/profile') ||
        location.startsWith('/portfolio')) {
      selectedIndex = 2;
    }

    return Scaffold(
      body: child,
      bottomNavigationBar: _FloatingNavBar(
        selectedIndex: selectedIndex,
        destinations: [
          _NavDest(
            icon: Icons.folder_outlined,
            activeIcon: Icons.folder_rounded,
            label: 'Projetos',
            onTap: () => context.go('/projects'),
          ),
          _NavDest(
            icon: Icons.account_balance_wallet_outlined,
            activeIcon: Icons.account_balance_wallet_rounded,
            label: 'Pagamentos',
            onTap: () => context.go('/payments'),
          ),
          _NavDest(
            icon: Icons.business_outlined,
            activeIcon: Icons.business_rounded,
            label: 'Empresa',
            onTap: () => context.go('/profile'),
          ),
        ],
      ),
    );
  }
}

// ─── Specialist shell ─────────────────────────────────────────────────────────

class _SpecialistShell extends StatelessWidget {
  final Widget child;
  final String location;
  const _SpecialistShell({required this.child, required this.location});

  @override
  Widget build(BuildContext context) {
    int selectedIndex = 0;
    if (location.startsWith('/projects')) selectedIndex = 0;
    if (location.startsWith('/bids')) selectedIndex = 1;
    if (location.startsWith('/payments')) selectedIndex = 2;
    if (location.startsWith('/profile') ||
        location.startsWith('/portfolio')) {
      selectedIndex = 3;
    }

    return Scaffold(
      body: child,
      bottomNavigationBar: _FloatingNavBar(
        selectedIndex: selectedIndex,
        destinations: [
          _NavDest(
            icon: Icons.explore_outlined,
            activeIcon: Icons.explore_rounded,
            label: 'Explorar',
            onTap: () => context.go('/projects'),
          ),
          _NavDest(
            icon: Icons.description_outlined,
            activeIcon: Icons.description_rounded,
            label: 'Propostas',
            onTap: () => context.go('/bids'),
          ),
          _NavDest(
            icon: Icons.account_balance_wallet_outlined,
            activeIcon: Icons.account_balance_wallet_rounded,
            label: 'Pagamentos',
            onTap: () => context.go('/payments'),
          ),
          _NavDest(
            icon: Icons.person_outline_rounded,
            activeIcon: Icons.person_rounded,
            label: 'Perfil',
            onTap: () => context.go('/profile'),
          ),
        ],
      ),
    );
  }
}

// ─── Floating nav bar ─────────────────────────────────────────────────────────

class _NavDest {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final VoidCallback onTap;
  const _NavDest({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.onTap,
  });
}

class _FloatingNavBar extends StatelessWidget {
  final int selectedIndex;
  final List<_NavDest> destinations;
  const _FloatingNavBar({
    required this.selectedIndex,
    required this.destinations,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
        child: Container(
          height: 64,
          decoration: BoxDecoration(
            color: AppTheme.slate900,
            borderRadius: BorderRadius.circular(32),
            boxShadow: [
              BoxShadow(
                color: AppTheme.slate900.withOpacity(0.3),
                blurRadius: 32,
                offset: const Offset(0, 8),
              ),
              BoxShadow(
                color: AppTheme.brand.withOpacity(0.08),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            children: List.generate(destinations.length, (i) {
              final dest = destinations[i];
              final isSelected = i == selectedIndex;
              return Expanded(
                child: GestureDetector(
                  onTap: dest.onTap,
                  behavior: HitTestBehavior.opaque,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    curve: Curves.easeInOut,
                    margin: const EdgeInsets.all(6),
                    decoration: isSelected
                        ? BoxDecoration(
                            color: Colors.white.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(26),
                          )
                        : null,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        AnimatedSwitcher(
                          duration: const Duration(milliseconds: 180),
                          child: Icon(
                            isSelected ? dest.activeIcon : dest.icon,
                            key: ValueKey(isSelected),
                            color: isSelected
                                ? Colors.white
                                : Colors.white.withOpacity(0.35),
                            size: 22,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          dest.label,
                          style: GoogleFonts.plusJakartaSans(
                            color: isSelected
                                ? Colors.white
                                : Colors.white.withOpacity(0.35),
                            fontSize: 10,
                            fontWeight: isSelected
                                ? FontWeight.w700
                                : FontWeight.w400,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}
