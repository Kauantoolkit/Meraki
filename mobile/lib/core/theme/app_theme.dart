import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

abstract final class AppTheme {
  // ── Brand palette ─────────────────────────────────────────────────────────
  static const Color brand = Color(0xFF4F46E5);
  static const Color brandDark = Color(0xFF3730A3);
  static const Color brandLight = Color(0xFFEEF2FF);
  static const Color brandGlow = Color(0x334F46E5);

  // ── Slate scale ───────────────────────────────────────────────────────────
  static const Color slate50 = Color(0xFFF8FAFC);
  static const Color slate100 = Color(0xFFF1F5F9);
  static const Color slate200 = Color(0xFFE2E8F0);
  static const Color slate300 = Color(0xFFCBD5E1);
  static const Color slate400 = Color(0xFF94A3B8);
  static const Color slate500 = Color(0xFF64748B);
  static const Color slate700 = Color(0xFF334155);
  static const Color slate900 = Color(0xFF0F172A);

  // ── Semantic colors ───────────────────────────────────────────────────────
  static const Color success = Color(0xFF10B981);
  static const Color successLight = Color(0xFFD1FAE5);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningLight = Color(0xFFFEF3C7);
  static const Color danger = Color(0xFFEF4444);
  static const Color dangerLight = Color(0xFFFEE2E2);
  static const Color info = Color(0xFF3B82F6);
  static const Color infoLight = Color(0xFFDBEAFE);

  // ── Status helpers ────────────────────────────────────────────────────────
  static Color statusColor(String status) => switch (status) {
        'OPEN' => success,
        'IN_PROGRESS' => info,
        'COMPLETED' => slate400,
        'CANCELLED' => danger,
        _ => warning,
      };

  static Color statusBg(String status) => switch (status) {
        'OPEN' => successLight,
        'IN_PROGRESS' => infoLight,
        'COMPLETED' => slate100,
        'CANCELLED' => dangerLight,
        _ => warningLight,
      };

  static String statusLabel(String status) => switch (status) {
        'OPEN' => 'Aberto',
        'IN_PROGRESS' => 'Em andamento',
        'COMPLETED' => 'Concluído',
        'CANCELLED' => 'Cancelado',
        'PENDING' => 'Pendente',
        'ACCEPTED' => 'Aceita',
        'REJECTED' => 'Rejeitada',
        'RELEASED' => 'Liberado',
        _ => status,
      };

  // ── Typography ────────────────────────────────────────────────────────────
  static TextTheme get _textTheme => TextTheme(
        displayLarge: GoogleFonts.plusJakartaSans(
            fontSize: 57, fontWeight: FontWeight.w800, letterSpacing: -1.5),
        displayMedium: GoogleFonts.plusJakartaSans(
            fontSize: 45, fontWeight: FontWeight.w700, letterSpacing: -1),
        headlineLarge: GoogleFonts.plusJakartaSans(
            fontSize: 32, fontWeight: FontWeight.w700, letterSpacing: -1),
        headlineMedium: GoogleFonts.plusJakartaSans(
            fontSize: 26, fontWeight: FontWeight.w700, letterSpacing: -0.5),
        headlineSmall: GoogleFonts.plusJakartaSans(
            fontSize: 22, fontWeight: FontWeight.w700, letterSpacing: -0.5),
        titleLarge: GoogleFonts.plusJakartaSans(
            fontSize: 20, fontWeight: FontWeight.w700, letterSpacing: -0.5),
        titleMedium: GoogleFonts.plusJakartaSans(
            fontSize: 16, fontWeight: FontWeight.w600, letterSpacing: -0.2),
        titleSmall: GoogleFonts.plusJakartaSans(
            fontSize: 14, fontWeight: FontWeight.w600),
        bodyLarge: GoogleFonts.plusJakartaSans(fontSize: 16, height: 1.5),
        bodyMedium: GoogleFonts.plusJakartaSans(fontSize: 14, height: 1.5),
        bodySmall: GoogleFonts.plusJakartaSans(fontSize: 12, height: 1.4),
        labelLarge: GoogleFonts.plusJakartaSans(
            fontSize: 14, fontWeight: FontWeight.w600),
        labelMedium: GoogleFonts.plusJakartaSans(
            fontSize: 12, fontWeight: FontWeight.w600),
        labelSmall: GoogleFonts.plusJakartaSans(
            fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.2),
      );

  // ── Light theme ───────────────────────────────────────────────────────────
  static ThemeData get light {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: brand,
      brightness: Brightness.light,
    ).copyWith(
      primary: brand,
      onPrimary: Colors.white,
      primaryContainer: brandLight,
      onPrimaryContainer: brandDark,
      surface: Colors.white,
      onSurface: slate900,
      surfaceContainerHighest: slate50,
      onSurfaceVariant: slate500,
      outline: slate200,
      outlineVariant: slate100,
      error: danger,
      onError: Colors.white,
      errorContainer: dangerLight,
      onErrorContainer: Color(0xFF7F1D1D),
    );

    return ThemeData(
      colorScheme: colorScheme,
      useMaterial3: true,
      scaffoldBackgroundColor: slate100,
      textTheme: _textTheme,

      // ── AppBar ──────────────────────────────────────────────────────────
      appBarTheme: AppBarTheme(
        backgroundColor: slate100,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        systemOverlayStyle: const SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.dark,
          statusBarBrightness: Brightness.light,
        ),
        titleTextStyle: GoogleFonts.plusJakartaSans(
          color: slate900,
          fontSize: 20,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.5,
        ),
        iconTheme: const IconThemeData(color: slate700, size: 22),
        actionsIconTheme: const IconThemeData(color: slate500, size: 22),
      ),

      // ── Card ────────────────────────────────────────────────────────────
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        shadowColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        margin: EdgeInsets.zero,
      ),

      // ── Input ───────────────────────────────────────────────────────────
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: slate50,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: slate200),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: slate200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: brand, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: danger),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: danger, width: 2),
        ),
        labelStyle: GoogleFonts.plusJakartaSans(color: slate400, fontSize: 14),
        hintStyle: GoogleFonts.plusJakartaSans(color: slate300, fontSize: 14),
        prefixIconColor: slate400,
        suffixIconColor: slate400,
        errorStyle: GoogleFonts.plusJakartaSans(color: danger, fontSize: 12),
      ),

      // ── Buttons ─────────────────────────────────────────────────────────
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: brand,
          foregroundColor: Colors.white,
          disabledBackgroundColor: slate200,
          disabledForegroundColor: slate400,
          minimumSize: const Size.fromHeight(52),
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14)),
          elevation: 0,
          textStyle: GoogleFonts.plusJakartaSans(
              fontWeight: FontWeight.w600, fontSize: 15),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: brand,
          foregroundColor: Colors.white,
          disabledBackgroundColor: slate200,
          disabledForegroundColor: slate400,
          minimumSize: const Size.fromHeight(52),
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14)),
          elevation: 0,
          shadowColor: Colors.transparent,
          textStyle: GoogleFonts.plusJakartaSans(
              fontWeight: FontWeight.w600, fontSize: 15),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: brand,
          minimumSize: const Size.fromHeight(52),
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14)),
          side: const BorderSide(color: slate200),
          textStyle: GoogleFonts.plusJakartaSans(
              fontWeight: FontWeight.w600, fontSize: 15),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: brand,
          textStyle: GoogleFonts.plusJakartaSans(
              fontWeight: FontWeight.w600, fontSize: 14),
        ),
      ),

      // ── FAB ─────────────────────────────────────────────────────────────
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: brand,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        elevation: 0,
        focusElevation: 0,
        hoverElevation: 0,
        highlightElevation: 0,
      ),

      // ── Chips ───────────────────────────────────────────────────────────
      chipTheme: ChipThemeData(
        side: BorderSide.none,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        backgroundColor: slate100,
        labelStyle: GoogleFonts.plusJakartaSans(
            fontWeight: FontWeight.w500, fontSize: 12),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      ),

      // ── Divider ─────────────────────────────────────────────────────────
      dividerTheme: const DividerThemeData(
        color: slate100,
        space: 1,
        thickness: 1,
      ),

      // ── ListTile ────────────────────────────────────────────────────────
      listTileTheme: ListTileThemeData(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        titleTextStyle: GoogleFonts.plusJakartaSans(
            fontSize: 15, fontWeight: FontWeight.w500, color: slate900),
        subtitleTextStyle: GoogleFonts.plusJakartaSans(
            fontSize: 13, color: slate500),
      ),

      // ── Dialog ──────────────────────────────────────────────────────────
      dialogTheme: DialogThemeData(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        elevation: 0,
        titleTextStyle: GoogleFonts.plusJakartaSans(
            color: slate900, fontWeight: FontWeight.w700, fontSize: 18),
        contentTextStyle: GoogleFonts.plusJakartaSans(
            color: slate500, fontSize: 14),
      ),

      // ── Bottom Sheet ─────────────────────────────────────────────────────
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
      ),

      // ── Snackbar ─────────────────────────────────────────────────────────
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: slate900,
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        contentTextStyle: GoogleFonts.plusJakartaSans(
            color: Colors.white, fontSize: 14),
      ),

      // ── NavigationBar ─────────────────────────────────────────────────
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        indicatorColor: brandLight,
        elevation: 0,
        height: 64,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          final selected = states.contains(WidgetState.selected);
          return GoogleFonts.plusJakartaSans(
            fontSize: 11,
            fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
            color: selected ? brand : slate400,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          final selected = states.contains(WidgetState.selected);
          return IconThemeData(
            color: selected ? brand : slate400,
            size: 22,
          );
        }),
      ),

      // ── Badge ───────────────────────────────────────────────────────────
      badgeTheme: BadgeThemeData(
        backgroundColor: danger,
        textStyle: GoogleFonts.plusJakartaSans(
            fontWeight: FontWeight.w700, fontSize: 10),
      ),

      // ── ProgressIndicator ───────────────────────────────────────────────
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: brand,
        linearTrackColor: brandLight,
      ),

      // ── Segmented Button ─────────────────────────────────────────────────
      segmentedButtonTheme: SegmentedButtonThemeData(
        style: SegmentedButton.styleFrom(
          selectedBackgroundColor: brandLight,
          selectedForegroundColor: brand,
          foregroundColor: slate500,
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12)),
          textStyle: GoogleFonts.plusJakartaSans(
              fontWeight: FontWeight.w600, fontSize: 14),
        ),
      ),
    );
  }
}
