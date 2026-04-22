import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  bool _loading = false;
  bool _sent = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    await Future.delayed(const Duration(seconds: 1)); // simulated API call
    if (mounted) setState(() { _loading = false; _sent = true; });
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: AppTheme.slate900,
        body: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // FORA DO ESCOPO INICIAL
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              color: const Color(0x1AFFC107),
              child: Row(
                children: [
                  Container(width: 6, height: 6, color: const Color(0xFFFFC107)),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'FORA DO ESCOPO INICIAL — Tela não prevista nos requisitos RF01–RF14',
                      style: TextStyle(
                        color: Color(0xFFFFC107),
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: SafeArea(
                bottom: false,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(32, 40, 32, 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back, color: Colors.white),
                        onPressed: () => context.pop(),
                        padding: EdgeInsets.zero,
                      ),
                      const SizedBox(height: 28),
                      Container(
                        width: 52,
                        height: 52,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                          ),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Icon(Icons.lock_reset_rounded, color: Colors.white, size: 28),
                      ),
                      const SizedBox(height: 28),
                      Text(
                        'Recuperar\nSenha',
                        style: GoogleFonts.plusJakartaSans(
                          color: Colors.white,
                          fontSize: 38,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -1.5,
                          height: 1.1,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'Enviaremos um link\nde redefinição ao seu e-mail',
                        style: GoogleFonts.plusJakartaSans(
                          color: Colors.white.withOpacity(0.45),
                          fontSize: 16,
                          height: 1.45,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
              ),
              child: SafeArea(
                top: false,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(24, 28, 24, 16),
                  child: _sent ? _SuccessView(onBack: () => context.go('/login')) : Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Digite seu e-mail',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.slate900,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Você receberá um link em instantes',
                          style: GoogleFonts.plusJakartaSans(fontSize: 14, color: AppTheme.slate400),
                        ),
                        const SizedBox(height: 24),
                        TextFormField(
                          controller: _emailCtrl,
                          keyboardType: TextInputType.emailAddress,
                          style: const TextStyle(color: Colors.black87, fontSize: 14),
                          decoration: InputDecoration(
                            labelText: 'E-mail',
                            labelStyle: const TextStyle(color: Color(0xFF6B6B6B)),
                            prefixIcon: const Icon(Icons.email_outlined, color: Color(0xFF6B6B6B)),
                            filled: true,
                            fillColor: const Color(0xFFF5F5F5),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(color: Color(0xFFDDDDDD)),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(color: Color(0xFFDDDDDD)),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(color: Color(0xFF55CA7C), width: 1.5),
                            ),
                          ),
                          validator: (v) =>
                              (v == null || !v.contains('@')) ? 'E-mail inválido' : null,
                        ),
                        const SizedBox(height: 20),
                        FilledButton(
                          onPressed: _loading ? null : _submit,
                          child: _loading
                              ? const SizedBox(
                                  height: 20, width: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
                                )
                              : const Text('Enviar link de recuperação'),
                        ),
                        const SizedBox(height: 4),
                        TextButton(
                          onPressed: () => context.go('/login'),
                          child: const Text('Voltar ao login'),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SuccessView extends StatelessWidget {
  final VoidCallback onBack;
  const _SuccessView({required this.onBack});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 12),
        Container(
          width: 64,
          height: 64,
          decoration: BoxDecoration(
            color: AppTheme.successLight,
            borderRadius: BorderRadius.circular(20),
          ),
          child: const Icon(Icons.mark_email_read_outlined, size: 32, color: AppTheme.success),
        ),
        const SizedBox(height: 20),
        Text(
          'E-mail enviado!',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 22, fontWeight: FontWeight.w700, color: AppTheme.slate900, letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Verifique sua caixa de entrada\ne siga as instruções.',
          textAlign: TextAlign.center,
          style: GoogleFonts.plusJakartaSans(fontSize: 14, color: AppTheme.slate400, height: 1.5),
        ),
        const SizedBox(height: 24),
        FilledButton(onPressed: onBack, child: const Text('Voltar ao login')),
        const SizedBox(height: 8),
      ],
    );
  }
}
