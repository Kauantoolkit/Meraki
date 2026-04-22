import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers.dart';
import '../../../features/projects/viewmodel/projects_viewmodel.dart';
import '../../../features/delivery/viewmodel/delivery_viewmodel.dart';
import '../../../features/payments/viewmodel/payment_viewmodel.dart';
import '../../../features/portfolio/viewmodel/portfolio_viewmodel.dart';
import '../../../features/bidding/viewmodel/bid_viewmodel.dart';
import '../model/user_model.dart';
import '../repository/auth_repository.dart';

class AuthState {
  final UserModel? user;
  final bool isLoading;
  final String? error;

  const AuthState({this.user, this.isLoading = false, this.error});

  bool get isAuthenticated => user != null;

  AuthState copyWith({UserModel? user, bool? isLoading, String? error}) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class AuthViewModel extends StateNotifier<AuthState> {
  final AuthRepository _repository;
  final Ref _ref;

  AuthViewModel(this._repository, this._ref) : super(const AuthState()) {
    _loadCachedUser();
  }

  void _loadCachedUser() {
    if (!_repository.isAuthenticated()) {
      // No token in storage — ensure user cache is also clean
      _repository.logout();
      return;
    }
    final cached = _repository.getCachedUser();
    if (cached != null) {
      state = state.copyWith(user: cached);
      // Validate the session against the server asynchronously.
      // If the user no longer exists (e.g. DB was wiped), force logout.
      _validateSession();
    }
  }

  Future<void> _validateSession() async {
    try {
      await _repository.validateSession();
    } catch (_) {
      await logout();
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final user = await _repository.login(email, password);
      state = AuthState(user: user);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: _parseError(e));
      return false;
    }
  }

  Future<bool> register(Map<String, dynamic> dto) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final user = await _repository.register(dto);
      state = AuthState(user: user);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: _parseError(e));
      return false;
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    _ref.invalidate(projectsViewModelProvider);
    _ref.invalidate(projectDetailViewModelProvider);
    _ref.invalidate(kanbanViewModelProvider);
    _ref.invalidate(deliverMilestoneViewModelProvider);
    _ref.invalidate(paymentsViewModelProvider);
    _ref.invalidate(portfolioViewModelProvider);
    _ref.invalidate(projectBidsViewModelProvider);
    _ref.invalidate(myBidsViewModelProvider);
    state = const AuthState();
  }

  String _parseError(Object e) {
    return e.toString().replaceFirst('Exception: ', '');
  }
}

final authViewModelProvider = StateNotifierProvider<AuthViewModel, AuthState>((ref) {
  return AuthViewModel(ref.read(authRepositoryProvider), ref);
});
