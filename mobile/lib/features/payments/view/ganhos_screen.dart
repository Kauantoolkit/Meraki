import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../viewmodel/payment_viewmodel.dart';
import '../model/payment_model.dart';

class GanhosScreen extends ConsumerWidget {
  const GanhosScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final paymentsAsync = ref.watch(paymentsViewModelProvider);

    return Scaffold(
      backgroundColor: AppTheme.slate900,
      appBar: AppBar(
        backgroundColor: AppTheme.slate900,
        surfaceTintColor: Colors.transparent,
        title: RichText(
          text: TextSpan(
            style: GoogleFonts.sourceCodePro(
                fontSize: 13, color: AppTheme.slate500),
            children: [
              const TextSpan(text: 'MERAKI // '),
              TextSpan(
                text: 'MEUS GANHOS',
                style: GoogleFonts.sourceCodePro(
                    fontSize: 13,
                    color: Colors.white,
                    fontWeight: FontWeight.w700),
              ),
            ],
          ),
        ),
      ),
      body: paymentsAsync.when(
        loading: () => const Center(
            child: CircularProgressIndicator(color: AppTheme.brand)),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline,
                  color: AppTheme.danger, size: 40),
              const SizedBox(height: 12),
              Text('Erro ao carregar ganhos',
                  style: AppTheme.mono(color: AppTheme.slate500)),
              const SizedBox(height: 8),
              FilledButton(
                onPressed: () =>
                    ref.read(paymentsViewModelProvider.notifier).refresh(),
                child: const Text('Tentar novamente'),
              ),
            ],
          ),
        ),
        data: (payments) => _GanhosContent(payments: payments),
      ),
    );
  }
}

class _GanhosContent extends StatelessWidget {
  final List<PaymentModel> payments;
  const _GanhosContent({required this.payments});

  @override
  Widget build(BuildContext context) {
    final totalRecebido = payments
        .where((p) => p.isReleased)
        .fold(0.0, (sum, p) => sum + p.specialistAmount);
    final emEscrow = payments
        .where((p) => p.status == 'PENDING')
        .fold(0.0, (sum, p) => sum + p.amount);
    final totalBrutoAno = payments
        .where((p) => p.status != 'REFUNDED')
        .fold(0.0, (sum, p) => sum + p.specialistAmount);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Stats
        Row(
          children: [
            Expanded(
              child: _StatCard(
                label: 'TOTAL RECEBIDO',
                value: _fmt(totalRecebido),
                color: AppTheme.brand,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _StatCard(
                label: 'EM ESCROW',
                value: _fmt(emEscrow),
                color: AppTheme.warning,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        _StatCard(
          label: 'TOTAL BRUTO (ANO)',
          value: _fmt(totalBrutoAno),
          color: AppTheme.info,
        ),
        const SizedBox(height: 20),
        // History header
        Text(
          'HISTÓRICO DE PAGAMENTOS',
          style: GoogleFonts.sourceCodePro(
            color: AppTheme.slate500,
            fontSize: 10,
            fontWeight: FontWeight.w700,
            letterSpacing: 1,
          ),
        ),
        const SizedBox(height: 8),
        if (payments.isEmpty)
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppTheme.slate100,
              border: Border.all(color: AppTheme.slate200),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Center(
              child: Text('Nenhum pagamento encontrado',
                  style: GoogleFonts.sourceCodePro(
                      color: AppTheme.slate500, fontSize: 11)),
            ),
          )
        else
          ...payments.map((p) => _PaymentCard(payment: p)),
      ],
    );
  }

  String _fmt(double v) =>
      'R\$ ${v.toStringAsFixed(2).replaceAll('.', ',')}';
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _StatCard({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.slate100,
        border: Border.all(color: AppTheme.slate200),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.sourceCodePro(
              color: AppTheme.slate500,
              fontSize: 9,
              fontWeight: FontWeight.w700,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: GoogleFonts.sourceCodePro(
              color: color,
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _PaymentCard extends StatelessWidget {
  final PaymentModel payment;
  const _PaymentCard({required this.payment});

  @override
  Widget build(BuildContext context) {
    final statusColor = AppTheme.statusColor(payment.status);
    final statusBg = AppTheme.statusBg(payment.status);
    final txRef = 'TX-${payment.id.substring(0, payment.id.length < 6 ? payment.id.length : 6)}';

    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.slate100,
        border: Border.all(color: AppTheme.slate200),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  txRef,
                  style: GoogleFonts.sourceCodePro(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 2),
                Text(
                  _formatDate(payment.createdAt),
                  style: GoogleFonts.sourceCodePro(
                      color: AppTheme.slate500, fontSize: 9),
                ),
                const SizedBox(height: 2),
                Text(
                  'Milestone aprovado',
                  style: GoogleFonts.sourceCodePro(
                      color: AppTheme.slate400, fontSize: 9),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                'R\$ ${payment.specialistAmount.toStringAsFixed(2).replaceAll('.', ',')}',
                style: GoogleFonts.sourceCodePro(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 4),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: statusBg,
                  borderRadius: BorderRadius.circular(2),
                ),
                child: Text(
                  AppTheme.statusLabel(payment.status),
                  style: GoogleFonts.sourceCodePro(
                    color: statusColor,
                    fontSize: 8,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatDate(String iso) {
    try {
      final dt = DateTime.parse(iso);
      return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return iso;
    }
  }
}
