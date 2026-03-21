import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
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
      return _SpecialistShell(child: child, location: location);
    }
    return _CompanyShell(child: child, location: location);
  }
}

class _CompanyShell extends StatelessWidget {
  final Widget child;
  final String location;
  const _CompanyShell({required this.child, required this.location});

  @override
  Widget build(BuildContext context) {
    int selectedIndex = 0;
    if (location.startsWith('/projects')) selectedIndex = 0;
    if (location.startsWith('/payments')) selectedIndex = 1;
    if (location.startsWith('/profile') || location.startsWith('/portfolio')) {
      selectedIndex = 2;
    }

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIndex,
        onDestinationSelected: (i) {
          switch (i) {
            case 0:
              context.go('/projects');
            case 1:
              context.go('/payments');
            case 2:
              context.go('/profile');
          }
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.work_outline),
            selectedIcon: Icon(Icons.work),
            label: 'Projetos',
          ),
          NavigationDestination(
            icon: Icon(Icons.payments_outlined),
            selectedIcon: Icon(Icons.payments),
            label: 'Pagamentos',
          ),
          NavigationDestination(
            icon: Icon(Icons.business_outlined),
            selectedIcon: Icon(Icons.business),
            label: 'Empresa',
          ),
        ],
      ),
    );
  }
}

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
    if (location.startsWith('/profile') || location.startsWith('/portfolio')) {
      selectedIndex = 3;
    }

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIndex,
        onDestinationSelected: (i) {
          switch (i) {
            case 0:
              context.go('/projects');
            case 1:
              context.go('/bids');
            case 2:
              context.go('/payments');
            case 3:
              context.go('/profile');
          }
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.search_outlined),
            selectedIcon: Icon(Icons.search),
            label: 'Projetos',
          ),
          NavigationDestination(
            icon: Icon(Icons.send_outlined),
            selectedIcon: Icon(Icons.send),
            label: 'Propostas',
          ),
          NavigationDestination(
            icon: Icon(Icons.payments_outlined),
            selectedIcon: Icon(Icons.payments),
            label: 'Pagamentos',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Perfil',
          ),
        ],
      ),
    );
  }
}
