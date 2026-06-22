import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/providers.dart';
import '../../../core/theme/app_theme.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _emailCtrl = TextEditingController();
  bool _loading = false;
  bool _sent = false;
  String? _error;

  @override
  void dispose() {
    _emailCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _emailCtrl.text.trim();
    if (email.isEmpty) return;
    setState(() { _loading = true; _error = null; });
    try {
      final api = ref.read(apiClientProvider);
      await api.post('/auth/forgot-password', data: {'email': email});
      setState(() => _sent = true);
    } catch (e) {
      setState(() => _error = 'Erro ao enviar. Verifique o email e tente novamente.');
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.slate900,
      appBar: AppBar(
        backgroundColor: AppTheme.slate900,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.slate400),
          onPressed: () => context.go('/login'),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: _sent ? _successView() : _formView(),
        ),
      ),
    );
  }

  Widget _successView() => Column(
        children: [
          Icon(Icons.mark_email_read, color: AppTheme.brand, size: 48),
          const SizedBox(height: 16),
          Text('Email enviado!',
              style: AppTheme.mono(fontSize: 18, fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Text(
            'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.',
            textAlign: TextAlign.center,
            style: AppTheme.mono(fontSize: 12, color: AppTheme.slate400),
          ),
          const SizedBox(height: 24),
          OutlinedButton(
            onPressed: () => context.go('/login'),
            child: const Text('VOLTAR AO LOGIN'),
          ),
        ],
      );

  Widget _formView() => Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppTheme.slate50,
              border: Border.all(color: AppTheme.brand),
            ),
            child: const Icon(Icons.lock_reset, color: AppTheme.brand, size: 24),
          ),
          const SizedBox(height: 16),
          Text('Recuperar Senha',
              style: GoogleFonts.sourceCodePro(
                  color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800)),
          const SizedBox(height: 8),
          Text('Informe seu email para receber o link de redefinição.',
              textAlign: TextAlign.center,
              style: AppTheme.mono(fontSize: 11, color: AppTheme.slate400)),
          const SizedBox(height: 32),
          if (_error != null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: AppTheme.dangerLight,
                border: Border.all(color: AppTheme.danger.withOpacity(0.3)),
              ),
              child: Text(_error!, style: AppTheme.mono(color: AppTheme.danger, fontSize: 11)),
            ),
          TextField(
            controller: _emailCtrl,
            keyboardType: TextInputType.emailAddress,
            style: AppTheme.mono(fontSize: 13, color: Colors.white),
            decoration: const InputDecoration(
              labelText: 'EMAIL',
              prefixIcon: Icon(Icons.email_outlined, size: 18),
            ),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: _loading ? null : _submit,
            child: _loading
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('ENVIAR LINK'),
          ),
        ],
      );
}
