import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'features/auth/view/login_screen.dart';
import 'features/auth/view/register_screen.dart';
import 'features/auth/view/forgot_password_screen.dart';
import 'features/auth/viewmodel/auth_viewmodel.dart';
import 'features/dashboard/view/dashboard_screen.dart';
import 'features/inbox/view/inbox_screen.dart';
import 'features/projects/view/projects_list_screen.dart';
import 'features/projects/view/project_detail_screen.dart';
import 'features/projects/view/create_project_screen.dart';
import 'features/bidding/view/project_bids_screen.dart';
import 'features/bidding/view/submit_bid_screen.dart';
import 'features/delivery/view/kanban_board_screen.dart';
import 'features/delivery/view/project_history_screen.dart';
import 'features/bidding/view/my_bids_screen.dart';
import 'features/delivery/view/deliver_milestone_screen.dart';
import 'features/payments/view/payments_screen.dart';
import 'features/portfolio/view/portfolio_screen.dart';
import 'features/portfolio/view/specialist_portfolio_screen.dart';
import 'features/portfolio/view/company_profile_screen.dart';
import 'features/portfolio/view/specialists_list_screen.dart';
import 'shared/widgets/main_shell.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

class _AuthRouterNotifier extends ChangeNotifier {
  _AuthRouterNotifier(this._ref) {
    _ref.listen<AuthState>(authViewModelProvider, (_, __) => notifyListeners());
  }
  final Ref _ref;
}

final appRouterProvider = Provider<GoRouter>((ref) {
  final notifier = _AuthRouterNotifier(ref);
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/login',
    refreshListenable: notifier,
    redirect: (context, state) {
      final isAuthenticated = ref.read(authViewModelProvider).isAuthenticated;
      final loc = state.matchedLocation;
      final isPublic = loc == '/login' || loc == '/register' || loc == '/forgot-password';
      if (!isAuthenticated && !isPublic) return '/login';
      if (isAuthenticated && isPublic) return '/dashboard';
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
      GoRoute(path: '/forgot-password', builder: (_, __) => const ForgotPasswordScreen()),

      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          // ─── Dashboard ────────────────────────────────────────────────
          GoRoute(
            path: '/dashboard',
            builder: (_, __) => const DashboardScreen(),
          ),

          // ─── Inbox ────────────────────────────────────────────────────
          GoRoute(
            path: '/inbox',
            builder: (_, __) => const InboxScreen(),
          ),

          // ─── Projetos ─────────────────────────────────────────────────
          GoRoute(
            path: '/projects',
            builder: (_, __) => const ProjectsListScreen(),
          ),
          GoRoute(
            path: '/projects/create',
            builder: (_, __) => const CreateProjectScreen(),
          ),
          GoRoute(
            path: '/projects/:id',
            builder: (_, state) =>
                ProjectDetailScreen(projectId: state.pathParameters['id']!),
          ),

          // ─── Propostas ────────────────────────────────────────────────
          GoRoute(
            path: '/projects/:id/bids',
            builder: (_, state) =>
                ProjectBidsScreen(projectId: state.pathParameters['id']!),
          ),
          GoRoute(
            path: '/projects/:id/bid',
            builder: (_, state) =>
                SubmitBidScreen(projectId: state.pathParameters['id']!),
          ),

          // ─── Kanban ───────────────────────────────────────────────────
          GoRoute(
            path: '/projects/:id/kanban',
            builder: (_, state) =>
                KanbanBoardScreen(projectId: state.pathParameters['id']!),
          ),

          // ─── Histórico de entregas (RF11) ─────────────────────────────
          GoRoute(
            path: '/projects/:id/history',
            builder: (_, state) =>
                ProjectHistoryScreen(projectId: state.pathParameters['id']!),
          ),

          // ─── Entrega de milestone ──────────────────────────────────────
          GoRoute(
            path: '/projects/:projectId/milestones/:milestoneId/deliver',
            builder: (_, state) => DeliverMilestoneScreen(
              projectId: state.pathParameters['projectId']!,
              milestoneId: state.pathParameters['milestoneId']!,
            ),
          ),

          // ─── Minhas propostas (especialista) ──────────────────────────
          GoRoute(path: '/bids', builder: (_, __) => const MyBidsScreen()),

          // ─── Pagamentos ───────────────────────────────────────────────
          GoRoute(
            path: '/payments',
            builder: (_, __) => const PaymentsScreen(),
          ),

          // ─── Perfil próprio ───────────────────────────────────────────
          GoRoute(
            path: '/profile',
            builder: (_, __) => const PortfolioScreen(),
          ),

          // ─── Listagem de especialistas ────────────────────────────────
          GoRoute(
            path: '/specialists',
            builder: (_, __) => const SpecialistsListScreen(),
          ),

          // ─── Perfil público de especialista (RF12) ────────────────────
          GoRoute(
            path: '/portfolio/:specialistId',
            builder: (_, state) => SpecialistPortfolioScreen(
              specialistId: state.pathParameters['specialistId']!,
            ),
          ),

          // ─── Perfil público de empresa (RF13) ─────────────────────────
          GoRoute(
            path: '/company/:companyId',
            builder: (_, state) => CompanyProfileScreen(
              companyId: state.pathParameters['companyId']!,
            ),
          ),
        ],
      ),
    ],
  );
});
