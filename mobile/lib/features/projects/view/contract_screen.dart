import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/providers.dart';
import '../../../core/theme/app_theme.dart';
import '../../auth/viewmodel/auth_viewmodel.dart';

class ContractScreen extends ConsumerStatefulWidget {
  final String projectId;
  const ContractScreen({super.key, required this.projectId});

  @override
  ConsumerState<ContractScreen> createState() => _ContractScreenState();
}

class _ContractScreenState extends ConsumerState<ContractScreen> {
  Map<String, dynamic>? project;
  List<dynamic> milestones = [];
  bool loading = true;
  bool signing = false;
  String? error;
  final _fmt = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');
  final _dateFmt = DateFormat('dd/MM/yyyy');

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final api = ref.read(apiClientProvider);
      final res = await api.get('/projects/${widget.projectId}');
      final mRes = await api.get('/projects/${widget.projectId}/milestones');
      setState(() {
        project = res.data is Map ? res.data : {};
        milestones = mRes.data is List ? mRes.data : [];
        loading = false;
      });
    } catch (e) {
      setState(() {
        error = 'Erro ao carregar projeto';
        loading = false;
      });
    }
  }

  String _generateHash() {
    final p = project!;
    final parts = [
      'project:${p['id']}',
      'title:${p['title']}',
      'budget:${p['budget']}',
      'deadline:${p['deadline']}',
      'company:${p['companyId']}',
      'specialist:${p['specialistId']}',
      ...milestones.map((m) => 'milestone:${m['id']}:${m['title']}:${m['amount']}'),
    ];
    return sha256.convert(utf8.encode(parts.join('|'))).toString();
  }

  bool get _bothSigned =>
      project?['companySignedAt'] != null && project?['specialistSignedAt'] != null;

  bool get _isCompany {
    final user = ref.read(authViewModelProvider).user;
    return user?.userType == 'COMPANY';
  }

  bool get _alreadySigned {
    if (_isCompany) return project?['companySignedAt'] != null;
    return project?['specialistSignedAt'] != null;
  }

  Future<void> _sign() async {
    setState(() => signing = true);
    try {
      final user = ref.read(authViewModelProvider).user;
      final api = ref.read(apiClientProvider);
      await api.patch('/projects/${widget.projectId}/sign-contract', data: {
        'contractHash': _generateHash(),
        'role': _isCompany ? 'COMPANY' : 'SPECIALIST',
        'signingPartyId': user?.id,
      });
      await _load();
    } catch (e) {
      setState(() => error = 'Erro ao assinar contrato');
    } finally {
      setState(() => signing = false);
    }
  }

  String _formatDate(String? iso) {
    if (iso == null) return '—';
    try {
      return _dateFmt.format(DateTime.parse(iso));
    } catch (_) {
      return iso;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return Scaffold(
        appBar: AppBar(title: const Text('CONTRATO')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_bothSigned) {
      return Scaffold(
        appBar: AppBar(title: const Text('CONTRATO')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.check_circle, color: AppTheme.brand, size: 48),
                const SizedBox(height: 16),
                Text('Tudo pronto!',
                    style: AppTheme.mono(fontSize: 18, fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                Text('Contrato assinado por ambas as partes.',
                    style: AppTheme.mono(fontSize: 12, color: AppTheme.slate400)),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: () => context.go('/projects/${widget.projectId}/kanban'),
                  child: const Text('ABRIR KANBAN'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final p = project!;
    final total = milestones.fold<double>(
        0, (sum, m) => sum + (double.tryParse('${m['amount']}') ?? 0));

    return Scaffold(
      appBar: AppBar(title: const Text('CONTRATO')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (error != null)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: AppTheme.dangerLight,
                  border: Border.all(color: AppTheme.danger.withOpacity(0.3)),
                ),
                child: Text(error!, style: AppTheme.mono(color: AppTheme.danger, fontSize: 11)),
              ),

            // Project info
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.slate100,
                border: Border.all(color: AppTheme.slate200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('DADOS DO CONTRATO',
                      style: AppTheme.mono(fontSize: 10, color: AppTheme.brand, letterSpacing: 2)),
                  const SizedBox(height: 12),
                  _row('Projeto', p['title'] ?? '—'),
                  _row('Orçamento', _fmt.format(p['budget'] ?? 0)),
                  _row('Prazo', _formatDate(p['deadline']?.toString())),
                  _row('Especialista', p['specialistName'] ?? p['specialistId'] ?? '—'),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Milestones
            if (milestones.isNotEmpty) ...[
              Text('MILESTONES',
                  style: AppTheme.mono(fontSize: 10, color: AppTheme.slate400, letterSpacing: 2)),
              const SizedBox(height: 8),
              ...milestones.map((m) => Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 8),
                    decoration: BoxDecoration(
                      color: AppTheme.slate50,
                      border: Border.all(color: AppTheme.slate200),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(m['title'] ?? '—',
                              style: AppTheme.mono(fontSize: 11, color: Colors.white)),
                        ),
                        Text(_fmt.format(double.tryParse('${m['amount']}') ?? 0),
                            style: AppTheme.mono(fontSize: 11, color: AppTheme.brand, fontWeight: FontWeight.w700)),
                      ],
                    ),
                  )),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.brandLight,
                  border: Border.all(color: AppTheme.brand.withOpacity(0.3)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('TOTAL', style: AppTheme.mono(fontSize: 11, color: AppTheme.brand)),
                    Text(_fmt.format(total),
                        style: AppTheme.mono(fontSize: 13, color: AppTheme.brand, fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Signatures
            Text('ASSINATURAS',
                style: AppTheme.mono(fontSize: 10, color: AppTheme.slate400, letterSpacing: 2)),
            const SizedBox(height: 8),
            _signatureRow('Empresa', p['companySignedAt']),
            const SizedBox(height: 8),
            _signatureRow('Especialista', p['specialistSignedAt']),
            const SizedBox(height: 24),

            // Sign button
            if (!_alreadySigned)
              FilledButton(
                onPressed: signing ? null : _sign,
                child: signing
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('ASSINAR CONTRATO'),
              )
            else
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.brandLight,
                  border: Border.all(color: AppTheme.brand.withOpacity(0.3)),
                ),
                child: Column(
                  children: [
                    Icon(Icons.check_circle, color: AppTheme.brand, size: 24),
                    const SizedBox(height: 8),
                    Text('Você já assinou',
                        style: AppTheme.mono(fontSize: 12, color: AppTheme.brand)),
                    Text('Aguardando a outra parte assinar.',
                        style: AppTheme.mono(fontSize: 10, color: AppTheme.slate400)),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _row(String label, String value) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: 100,
              child: Text(label, style: AppTheme.mono(fontSize: 10, color: AppTheme.slate400)),
            ),
            Expanded(
              child: Text(value, style: AppTheme.mono(fontSize: 11, color: Colors.white)),
            ),
          ],
        ),
      );

  Widget _signatureRow(String label, dynamic signedAt) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppTheme.slate50,
          border: Border.all(
            color: signedAt != null ? AppTheme.brand.withOpacity(0.3) : AppTheme.slate200,
          ),
        ),
        child: Row(
          children: [
            Icon(
              signedAt != null ? Icons.check_circle : Icons.radio_button_unchecked,
              size: 16,
              color: signedAt != null ? AppTheme.brand : AppTheme.slate400,
            ),
            const SizedBox(width: 8),
            Text(label, style: AppTheme.mono(fontSize: 11, color: Colors.white)),
            const Spacer(),
            Text(
              signedAt != null ? _formatDate(signedAt.toString()) : 'Pendente',
              style: AppTheme.mono(
                fontSize: 10,
                color: signedAt != null ? AppTheme.brand : AppTheme.slate500,
              ),
            ),
          ],
        ),
      );
}
