import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../viewmodel/delivery_viewmodel.dart';

class DeliverMilestoneScreen extends ConsumerStatefulWidget {
  final String projectId;
  final String milestoneId;

  const DeliverMilestoneScreen({
    super.key,
    required this.projectId,
    required this.milestoneId,
  });

  @override
  ConsumerState<DeliverMilestoneScreen> createState() =>
      _DeliverMilestoneScreenState();
}

class _DeliverMilestoneScreenState
    extends ConsumerState<DeliverMilestoneScreen> {
  final _repoCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    ref.listenManual(deliverMilestoneViewModelProvider, (_, next) {
      if (next.success && mounted) context.pop(true);
    });
  }

  @override
  void dispose() {
    _repoCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final vmState = ref.watch(deliverMilestoneViewModelProvider);

    return Scaffold(
      backgroundColor: AppTheme.slate900,
      appBar: AppBar(
        backgroundColor: AppTheme.slate900,
        surfaceTintColor: Colors.transparent,
        title: Text('SUBMETER ENTREGA',
            style: GoogleFonts.sourceCodePro(
                color: Colors.white,
                fontSize: 13,
                fontWeight: FontWeight.w700,
                letterSpacing: 1)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('REPOSITÓRIO / URL *',
                style: GoogleFonts.sourceCodePro(
                    color: AppTheme.brand,
                    fontSize: 10,
                    letterSpacing: 1)),
            const SizedBox(height: 6),
            TextField(
              controller: _repoCtrl,
              style:
                  GoogleFonts.sourceCodePro(color: Colors.white, fontSize: 12),
              decoration: InputDecoration(
                hintText: 'https://github.com/...',
                hintStyle:
                    GoogleFonts.sourceCodePro(color: AppTheme.slate500),
              ),
            ),
            const SizedBox(height: 16),
            Text('NOTAS DE RELEASE (opcional)',
                style: GoogleFonts.sourceCodePro(
                    color: AppTheme.brand,
                    fontSize: 10,
                    letterSpacing: 1)),
            const SizedBox(height: 6),
            TextField(
              controller: _notesCtrl,
              maxLines: 6,
              maxLength: 2000,
              style:
                  GoogleFonts.sourceCodePro(color: Colors.white, fontSize: 12),
              decoration: InputDecoration(
                hintText: 'Descreva o que foi entregue...',
                hintStyle:
                    GoogleFonts.sourceCodePro(color: AppTheme.slate500),
                counterStyle: const TextStyle(color: AppTheme.slate500),
                alignLabelWithHint: true,
              ),
            ),
            if (vmState.error != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppTheme.dangerLight,
                  border:
                      Border.all(color: AppTheme.danger.withValues(alpha: 0.3)),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(vmState.error!,
                    style: GoogleFonts.sourceCodePro(
                        color: AppTheme.danger, fontSize: 10)),
              ),
            ],
            const SizedBox(height: 16),
            FilledButton(
              onPressed: vmState.isLoading
                  ? null
                  : () {
                      final repo = _repoCtrl.text.trim();
                      if (repo.isEmpty) return;
                      ref
                          .read(deliverMilestoneViewModelProvider.notifier)
                          .submit(
                            milestoneId: widget.milestoneId,
                            deliveredFiles: [repo],
                            deliveryNotes: _notesCtrl.text.trim(),
                          );
                    },
              child: vmState.isLoading
                  ? const SizedBox(
                      height: 16,
                      width: 16,
                      child: CircularProgressIndicator(strokeWidth: 2))
                  : Text('ENVIAR ENTREGA',
                      style: GoogleFonts.sourceCodePro(
                          fontSize: 11, letterSpacing: 1)),
            ),
          ],
        ),
      ),
    );
  }
}
