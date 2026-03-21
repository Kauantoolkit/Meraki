import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers.dart';
import '../model/payment_model.dart';
import '../repository/payment_repository.dart';

class PaymentsViewModel extends AsyncNotifier<List<PaymentModel>> {
  @override
  Future<List<PaymentModel>> build() =>
      ref.read(paymentRepositoryProvider).listMyPayments();

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(paymentRepositoryProvider).listMyPayments(),
    );
  }
}

final paymentsViewModelProvider =
    AsyncNotifierProvider<PaymentsViewModel, List<PaymentModel>>(
  PaymentsViewModel.new,
);
