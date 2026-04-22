import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers.dart';
import '../model/bid_model.dart';
import '../repository/bid_repository.dart';

// Propostas de um projeto (visão da empresa)
class ProjectBidsViewModel extends AsyncNotifier<List<BidModel>> {
  late String projectId;

  @override
  Future<List<BidModel>> build() async => [];

  Future<void> load(String id) async {
    projectId = id;
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(bidRepositoryProvider).listBidsForProject(id),
    );
  }

  Future<bool> accept(String bidId) async {
    try {
      await ref.read(bidRepositoryProvider).acceptBid(bidId);
      await load(projectId);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> reject(String bidId) async {
    try {
      await ref.read(bidRepositoryProvider).rejectBid(bidId);
      await load(projectId);
      return true;
    } catch (_) {
      return false;
    }
  }
}

// Minhas propostas (visão do especialista)
class MyBidsViewModel extends AsyncNotifier<List<BidModel>> {
  @override
  Future<List<BidModel>> build() =>
      ref.read(bidRepositoryProvider).listMyBids();

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(bidRepositoryProvider).listMyBids(),
    );
  }

  Future<bool> submit(Map<String, dynamic> dto) async {
    try {
      await ref.read(bidRepositoryProvider).submitBid(dto);
      await refresh();
      return true;
    } catch (_) {
      return false;
    }
  }
}

final projectBidsViewModelProvider =
    AsyncNotifierProvider<ProjectBidsViewModel, List<BidModel>>(
  ProjectBidsViewModel.new,
);

final myBidsViewModelProvider =
    AsyncNotifierProvider<MyBidsViewModel, List<BidModel>>(
  MyBidsViewModel.new,
);
