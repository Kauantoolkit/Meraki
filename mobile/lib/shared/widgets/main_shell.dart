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
    if (location.startsWith('/projects') ||
        location.startsWith('/dashboard')) selectedIndex = 0;
    if (location.startsWith('/inbox')) selectedIndex = 1;
    if (location.startsWith('/payments')) selectedIndex = 2;
    if (location.startsWith('/profile') ||
        location.startsWith('/portfolio')) selectedIndex = 3;

    return Scaffold(
      body: child,
      bottomNavigationBar: _TerminalNavBar(
        selectedIndex: selectedIndex,
        destinations: [
          _NavDest(
            icon: Icons.folder_outlined,
            activeIcon: Icons.folder_rounded,
            label: 'PROJETOS',
            onTap: () => context.go('/projects'),
          ),
          _NavDest(
            icon: Icons.mail_outline_rounded,
            activeIcon: Icons.mail_rounded,
            label: 'INBOX',
            onTap: () => context.go('/inbox'),
          ),
          _NavDest(
            icon: Icons.account_balance_wallet_outlined,
            activeIcon: Icons.account_balance_wallet_rounded,
            label: 'FINANCEIRO',
            onTap: () => context.go('/payments'),
          ),
          _NavDest(
            icon: Icons.business_outlined,
            activeIcon: Icons.business_rounded,
            label: 'EMPRESA',
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
    if (location.startsWith('/projects') ||
        location.startsWith('/dashboard')) selectedIndex = 0;
    if (location.startsWith('/bids')) selectedIndex = 1;
    if (location.startsWith('/inbox')) selectedIndex = 2;
    if (location.startsWith('/payments')) selectedIndex = 3;
    if (location.startsWith('/profile') ||
        location.startsWith('/portfolio')) selectedIndex = 4;

    return Scaffold(
      body: child,
      bottomNavigationBar: _TerminalNavBar(
        selectedIndex: selectedIndex,
        destinations: [
          _NavDest(
            icon: Icons.explore_outlined,
            activeIcon: Icons.explore_rounded,
            label: 'EXPLORAR',
            onTap: () => context.go('/projects'),
          ),
          _NavDest(
            icon: Icons.description_outlined,
            activeIcon: Icons.description_rounded,
            label: 'PROPOSTAS',
            onTap: () => context.go('/bids'),
          ),
          _NavDest(
            icon: Icons.mail_outline_rounded,
            activeIcon: Icons.mail_rounded,
            label: 'INBOX',
            onTap: () => context.go('/inbox'),
          ),
          _NavDest(
            icon: Icons.account_balance_wallet_outlined,
            activeIcon: Icons.account_balance_wallet_rounded,
            label: 'GANHOS',
            onTap: () => context.go('/payments'),
          ),
          _NavDest(
            icon: Icons.person_outline_rounded,
            activeIcon: Icons.person_rounded,
            label: 'PERFIL',
            onTap: () => context.go('/profile'),
          ),
        ],
      ),
    );
  }
}

// ─── Terminal nav bar ─────────────────────────────────────────────────────────

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

class _TerminalNavBar extends StatelessWidget {
  final int selectedIndex;
  final List<_NavDest> destinations;
  const _TerminalNavBar({
    required this.selectedIndex,
    required this.destinations,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppTheme.slate900,
        border: Border(top: BorderSide(color: AppTheme.slate200, width: 1)),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 58,
          child: Row(
            children: List.generate(destinations.length, (i) {
              final dest = destinations[i];
              final isSelected = i == selectedIndex;
              return Expanded(
                child: GestureDetector(
                  onTap: dest.onTap,
                  behavior: HitTestBehavior.opaque,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      AnimatedSwitcher(
                        duration: const Duration(milliseconds: 150),
                        child: Icon(
                          isSelected ? dest.activeIcon : dest.icon,
                          key: ValueKey(isSelected),
                          color: isSelected ? AppTheme.brand : AppTheme.slate500,
                          size: 20,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        dest.label,
                        style: GoogleFonts.sourceCodePro(
                          color: isSelected ? AppTheme.brand : AppTheme.slate500,
                          fontSize: 8,
                          fontWeight: isSelected
                              ? FontWeight.w700
                              : FontWeight.w500,
                          letterSpacing: 0.5,
                        ),
                      ),
                      if (isSelected) ...[
                        const SizedBox(height: 2),
                        Container(
                          width: 20,
                          height: 2,
                          color: AppTheme.brand,
                        ),
                      ],
                    ],
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
