import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../viewmodel/auth_viewmodel.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _obscure = true;
  String _loginType = 'COMPANY'; // COMPANY | SPECIALIST

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final ok = await ref.read(authViewModelProvider.notifier).login(
          _emailCtrl.text.trim(),
          _passwordCtrl.text,
        );
    if (ok && mounted) context.go('/dashboard');
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(authViewModelProvider);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: AppTheme.slate900,
        resizeToAvoidBottomInset: true,
        body: Stack(
          children: [
            // Green glow background
            Positioned(
              top: -100,
              left: -80,
              child: Container(
                width: 320,
                height: 320,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.brand.withOpacity(0.06),
                ),
              ),
            ),

            SafeArea(
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 24, vertical: 40),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // ─── Logo ───────────────────────────────────────
                      Container(
                        width: 52,
                        height: 52,
                        decoration: BoxDecoration(
                          color: AppTheme.brandLight,
                          border: Border.all(
                              color: AppTheme.brand, width: 1.5),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Icon(
                          Icons.terminal_rounded,
                          color: AppTheme.brand,
                          size: 26,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'MERAKI',
                        style: GoogleFonts.sourceCodePro(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 6,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'TECH FREELANCE MARKETPLACE',
                        style: GoogleFonts.sourceCodePro(
                          color: AppTheme.slate500,
                          fontSize: 9,
                          letterSpacing: 2,
                        ),
                      ),
                      const SizedBox(height: 32),

                      // ─── Card ────────────────────────────────────────
                      Container(
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: AppTheme.slate100,
                          border: Border.all(color: AppTheme.slate200),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        padding: const EdgeInsets.all(24),
                        child: Form(
                          key: _formKey,
                          child: Column(
                            crossAxisAlignment:
                                CrossAxisAlignment.stretch,
                            children: [
                              // ─── Type tabs ───────────────────────
                              Row(
                                children: [
                                  _Tab(
                                    label: 'EMPRESA',
                                    selected: _loginType == 'COMPANY',
                                    onTap: () => setState(
                                        () => _loginType = 'COMPANY'),
                                  ),
                                  const SizedBox(width: 8),
                                  _Tab(
                                    label: 'ESPECIALISTA',
                                    selected:
                                        _loginType == 'SPECIALIST',
                                    onTap: () => setState(
                                        () => _loginType = 'SPECIALIST'),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 20),

                              // ─── E-mail ──────────────────────────
                              Text(
                                'E-MAIL',
                                style: GoogleFonts.sourceCodePro(
                                  color: AppTheme.slate500,
                                  fontSize: 10,
                                  letterSpacing: 1.5,
                                ),
                              ),
                              const SizedBox(height: 6),
                              TextFormField(
                                controller: _emailCtrl,
                                keyboardType:
                                    TextInputType.emailAddress,
                                style: GoogleFonts.sourceCodePro(
                                    color: Colors.white, fontSize: 13),
                                decoration: InputDecoration(
                                  hintText: _loginType == 'COMPANY'
                                      ? 'admin@empresa.com'
                                      : 'dev@especialista.com',
                                ),
                                validator: (v) =>
                                    (v == null || !v.contains('@'))
                                        ? 'E-mail inválido'
                                        : null,
                              ),
                              const SizedBox(height: 14),

                              // ─── Senha ───────────────────────────
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'SENHA',
                                    style: GoogleFonts.sourceCodePro(
                                      color: AppTheme.slate500,
                                      fontSize: 10,
                                      letterSpacing: 1.5,
                                    ),
                                  ),
                                  GestureDetector(
                                    onTap: () => context
                                        .go('/forgot-password'),
                                    child: Text(
                                      'Esquecer?',
                                      style: GoogleFonts.sourceCodePro(
                                        color: AppTheme.brand,
                                        fontSize: 10,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              TextFormField(
                                controller: _passwordCtrl,
                                obscureText: _obscure,
                                style: GoogleFonts.sourceCodePro(
                                    color: Colors.white, fontSize: 13),
                                decoration: InputDecoration(
                                  hintText: '••••••••',
                                  suffixIcon: IconButton(
                                    icon: Icon(
                                      _obscure
                                          ? Icons.visibility_outlined
                                          : Icons
                                              .visibility_off_outlined,
                                      size: 18,
                                      color: AppTheme.slate500,
                                    ),
                                    onPressed: () => setState(
                                        () => _obscure = !_obscure),
                                  ),
                                ),
                                validator: (v) =>
                                    (v == null || v.length < 6)
                                        ? 'Mínimo 6 caracteres'
                                        : null,
                              ),

                              if (state.error != null) ...[
                                const SizedBox(height: 12),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 12, vertical: 10),
                                  decoration: BoxDecoration(
                                    color: AppTheme.dangerLight,
                                    border: Border.all(
                                        color: AppTheme.danger
                                            .withOpacity(0.3)),
                                    borderRadius:
                                        BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    state.error!,
                                    style: GoogleFonts.sourceCodePro(
                                        color: AppTheme.danger,
                                        fontSize: 11),
                                  ),
                                ),
                              ],

                              const SizedBox(height: 20),

                              // ─── Submit button ───────────────────
                              SizedBox(
                                height: 48,
                                child: FilledButton(
                                  onPressed:
                                      state.isLoading ? null : _submit,
                                  child: state.isLoading
                                      ? const SizedBox(
                                          height: 18,
                                          width: 18,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            color: AppTheme.slate900,
                                          ),
                                        )
                                      : Text(
                                          'INICIALIZAR  >',
                                          style:
                                              GoogleFonts.sourceCodePro(
                                            fontWeight: FontWeight.w800,
                                            fontSize: 13,
                                            letterSpacing: 2,
                                            color: AppTheme.slate900,
                                          ),
                                        ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 20),

                      // ─── Register link ───────────────────────────────
                      GestureDetector(
                        onTap: () => context.go('/register'),
                        child: RichText(
                          text: TextSpan(
                            style: GoogleFonts.sourceCodePro(
                              fontSize: 11,
                              color: AppTheme.slate500,
                              letterSpacing: 0.5,
                            ),
                            children: [
                              const TextSpan(
                                  text: 'JÁ TEM CONTA? '),
                              TextSpan(
                                text: 'SOLICITAR REGISTRO',
                                style: GoogleFonts.sourceCodePro(
                                  fontSize: 11,
                                  color: AppTheme.brand,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
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

class _Tab extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _Tab({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: selected ? AppTheme.brand : AppTheme.slate50,
            borderRadius: BorderRadius.circular(4),
            border: Border.all(
              color: selected
                  ? AppTheme.brand
                  : AppTheme.slate200,
            ),
          ),
          child: Center(
            child: Text(
              label,
              style: GoogleFonts.sourceCodePro(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: selected ? AppTheme.slate900 : AppTheme.slate500,
                letterSpacing: 1,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
