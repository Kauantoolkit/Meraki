import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

abstract final class AppTheme {
  // ── Brand palette (green terminal) ────────────────────────────────────────
  static const Color brand = Color(0xFF55CA7C);
  static const Color brandDark = Color(0xFF3DA861);
  static const Color brandLight = Color(0xFF1A2E22);
  static const Color brandGlow = Color(0x3355CA7C);

  // ── Dark scale ────────────────────────────────────────────────────────────
  static const Color slate50 = Color(0xFF111111);   // input bg
  static const Color slate100 = Color(0xFF161616);  // card bg
  static const Color slate200 = Color(0xFF2A2A2A);  // border
  static const Color slate300 = Color(0xFFAAAAAA);
  static const Color slate400 = Color(0xFF888888);
  static const Color slate500 = Color(0xFF6B6B6B);
  static const Color slate700 = Color(0xFF1A1A1A);
  static const Color slate900 = Color(0xFF0D0D0D);  // bg

  // ── Semantic colors ───────────────────────────────────────────────────────
  static const Color success = Color(0xFF55CA7C);
  static const Color successLight = Color(0xFF1A2E22);
  static const Color warning = Color(0xFFF97316);
  static const Color warningLight = Color(0xFF2D1A0E);
  static const Color danger = Color(0xFFEF4444);
  static const Color dangerLight = Color(0xFF2D0F0F);
  static const Color info = Color(0xFF3B82F6);
  static const Color infoLight = Color(0xFF0F1D2D);

  // ── Status helpers ────────────────────────────────────────────────────────
  static Color statusColor(String status) => switch (status) {
        'OPEN' => brand,
        'IN_PROGRESS' => info,
        'COMPLETED' => slate400,
        'CANCELLED' => danger,
        'PENDING' => warning,
        'ACCEPTED' => brand,
        'REJECTED' => danger,
        'RELEASED' => brand,
        _ => slate400,
      };

  static Color statusBg(String status) => switch (status) {
        'OPEN' => brandLight,
        'IN_PROGRESS' => infoLight,
        'COMPLETED' => slate700,
        'CANCELLED' => dangerLight,
        'PENDING' => warningLight,
        'ACCEPTED' => brandLight,
        'REJECTED' => dangerLight,
        'RELEASED' => brandLight,
        _ => slate700,
      };

  static String statusLabel(String status) => switch (status) {
        'OPEN' => 'OPEN',
        'IN_PROGRESS' => 'IN_PROGRESS',
        'COMPLETED' => 'COMPLETED',
        'CANCELLED' => 'CANCELLED',
        'PENDING' => 'PENDING',
        'ACCEPTED' => 'ACEITA',
        'REJECTED' => 'REJEITADA',
        'RELEASED' => 'LIBERADO',
        _ => status,
      };

  // ── Monospace text style ──────────────────────────────────────────────────
  static TextStyle mono({
    double fontSize = 12,
    FontWeight fontWeight = FontWeight.w400,
    Color color = Colors.white,
    double? letterSpacing,
  }) =>
      GoogleFonts.sourceCodePro(
        fontSize: fontSize,
        fontWeight: fontWeight,
        color: color,
        letterSpacing: letterSpacing,
      );

  // ── Typography ────────────────────────────────────────────────────────────
  static TextTheme get _textTheme => TextTheme(
        displayLarge: GoogleFonts.plusJakartaSans(
            fontSize: 57,
            fontWeight: FontWeight.w800,
            letterSpacing: -1.5,
            color: Colors.white),
        displayMedium: GoogleFonts.plusJakartaSans(
            fontSize: 45,
            fontWeight: FontWeight.w700,
            letterSpacing: -1,
            color: Colors.white),
        headlineLarge: GoogleFonts.plusJakartaSans(
            fontSize: 32,
            fontWeight: FontWeight.w700,
            letterSpacing: -1,
            color: Colors.white),
        headlineMedium: GoogleFonts.plusJakartaSans(
            fontSize: 26,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.5,
            color: Colors.white),
        headlineSmall: GoogleFonts.plusJakartaSans(
            fontSize: 22,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.5,
            color: Colors.white),
        titleLarge: GoogleFonts.plusJakartaSans(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.5,
            color: Colors.white),
        titleMedium: GoogleFonts.plusJakartaSans(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            letterSpacing: -0.2,
            color: Colors.white),
        titleSmall: GoogleFonts.plusJakartaSans(
            fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white),
        bodyLarge: GoogleFonts.plusJakartaSans(
            fontSize: 16, height: 1.5, color: slate300),
        bodyMedium: GoogleFonts.plusJakartaSans(
            fontSize: 14, height: 1.5, color: slate300),
        bodySmall: GoogleFonts.plusJakartaSans(
            fontSize: 12, height: 1.4, color: slate400),
        labelLarge: GoogleFonts.sourceCodePro(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: slate300,
            letterSpacing: 0.5),
        labelMedium: GoogleFonts.sourceCodePro(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: slate400,
            letterSpacing: 0.5),
        labelSmall: GoogleFonts.sourceCodePro(
            fontSize: 10,
            fontWeight: FontWeight.w600,
            color: slate500,
            letterSpacing: 0.5),
      );

  // ── Dark theme (the only theme) ───────────────────────────────────────────
  static ThemeData get dark {
    final colorScheme = ColorScheme(
      brightness: Brightness.dark,
      primary: brand,
      onPrimary: slate900,
      primaryContainer: brandLight,
      onPrimaryContainer: brand,
      secondary: info,
      onSecondary: Colors.white,
      secondaryContainer: infoLight,
      onSecondaryContainer: info,
      surface: slate100,
      onSurface: Colors.white,
      surfaceContainerHighest: slate700,
      onSurfaceVariant: slate400,
      outline: slate200,
      outlineVariant: slate700,
      error: danger,
      onError: Colors.white,
      errorContainer: dangerLight,
      onErrorContainer: danger,
    );

    return ThemeData(
      colorScheme: colorScheme,
      useMaterial3: true,
      scaffoldBackgroundColor: slate900,
      textTheme: _textTheme,
      brightness: Brightness.dark,

      // ── AppBar ──────────────────────────────────────────────────────────
      appBarTheme: AppBarTheme(
        backgroundColor: slate900,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        systemOverlayStyle: const SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.light,
          statusBarBrightness: Brightness.dark,
        ),
        titleTextStyle: GoogleFonts.sourceCodePro(
          color: Colors.white,
          fontSize: 13,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.5,
        ),
        iconTheme: const IconThemeData(color: slate400, size: 22),
        actionsIconTheme: const IconThemeData(color: slate500, size: 22),
        shape: Border(bottom: BorderSide(color: slate200)),
      ),

      // ── Card ────────────────────────────────────────────────────────────
      cardTheme: CardThemeData(
        color: slate100,
        elevation: 0,
        shadowColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(4),
          side: BorderSide(color: slate200),
        ),
        margin: EdgeInsets.zero,
      ),

      // ── Input ───────────────────────────────────────────────────────────
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: slate50,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(4),
          borderSide: BorderSide(color: slate200),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(4),
          borderSide: BorderSide(color: slate200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(4),
          borderSide: const BorderSide(color: brand, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(4),
          borderSide: const BorderSide(color: danger),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(4),
          borderSide: const BorderSide(color: danger, width: 1.5),
        ),
        labelStyle: GoogleFonts.sourceCodePro(
            color: slate500, fontSize: 11, letterSpacing: 0.5),
        hintStyle: GoogleFonts.sourceCodePro(color: slate500, fontSize: 12),
        prefixIconColor: slate500,
        suffixIconColor: slate500,
        errorStyle:
            GoogleFonts.sourceCodePro(color: danger, fontSize: 11),
      ),

      // ── Buttons ─────────────────────────────────────────────────────────
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: brand,
          foregroundColor: slate900,
          disabledBackgroundColor: slate200,
          disabledForegroundColor: slate500,
          minimumSize: const Size.fromHeight(48),
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(4)),
          elevation: 0,
          textStyle: GoogleFonts.sourceCodePro(
              fontWeight: FontWeight.w700,
              fontSize: 13,
              letterSpacing: 1.5),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: brand,
          foregroundColor: slate900,
          disabledBackgroundColor: slate200,
          disabledForegroundColor: slate500,
          minimumSize: const Size.fromHeight(48),
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(4)),
          elevation: 0,
          shadowColor: Colors.transparent,
          textStyle: GoogleFonts.sourceCodePro(
              fontWeight: FontWeight.w700,
              fontSize: 13,
              letterSpacing: 1.5),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: brand,
          minimumSize: const Size.fromHeight(48),
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(4)),
          side: const BorderSide(color: slate200),
          textStyle: GoogleFonts.sourceCodePro(
              fontWeight: FontWeight.w600,
              fontSize: 12,
              letterSpacing: 1),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: brand,
          textStyle: GoogleFonts.sourceCodePro(
              fontWeight: FontWeight.w600,
              fontSize: 12,
              letterSpacing: 0.5),
        ),
      ),

      // ── Chips ───────────────────────────────────────────────────────────
      chipTheme: ChipThemeData(
        backgroundColor: slate700,
        side: BorderSide(color: slate200),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
        labelStyle: GoogleFonts.sourceCodePro(
            fontWeight: FontWeight.w500,
            fontSize: 11,
            letterSpacing: 0.5),
        padding:
            const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      ),

      // ── Divider ─────────────────────────────────────────────────────────
      dividerTheme: const DividerThemeData(
        color: slate200,
        space: 1,
        thickness: 1,
      ),

      // ── ListTile ────────────────────────────────────────────────────────
      listTileTheme: ListTileThemeData(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(4)),
        tileColor: slate100,
        titleTextStyle: GoogleFonts.plusJakartaSans(
            fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white),
        subtitleTextStyle:
            GoogleFonts.sourceCodePro(fontSize: 11, color: slate500),
      ),

      // ── Dialog ──────────────────────────────────────────────────────────
      dialogTheme: DialogThemeData(
        backgroundColor: slate100,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(4),
            side: BorderSide(color: slate200)),
        elevation: 0,
        titleTextStyle: GoogleFonts.plusJakartaSans(
            color: Colors.white, fontWeight: FontWeight.w700, fontSize: 16),
        contentTextStyle:
            GoogleFonts.plusJakartaSans(color: slate400, fontSize: 13),
      ),

      // ── Bottom Sheet ─────────────────────────────────────────────────────
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: slate100,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius:
              const BorderRadius.vertical(top: Radius.circular(8)),
          side: BorderSide(color: slate200),
        ),
      ),

      // ── Snackbar ─────────────────────────────────────────────────────────
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: slate100,
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(4),
            side: BorderSide(color: brand.withOpacity(0.4))),
        contentTextStyle:
            GoogleFonts.sourceCodePro(color: Colors.white, fontSize: 12),
      ),

      // ── NavigationBar ─────────────────────────────────────────────────
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: slate900,
        surfaceTintColor: Colors.transparent,
        indicatorColor: brandLight,
        elevation: 0,
        height: 60,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          final selected = states.contains(WidgetState.selected);
          return GoogleFonts.sourceCodePro(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            color: selected ? brand : slate500,
            letterSpacing: 0.5,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          final selected = states.contains(WidgetState.selected);
          return IconThemeData(
            color: selected ? brand : slate500,
            size: 20,
          );
        }),
      ),

      // ── Badge ───────────────────────────────────────────────────────────
      badgeTheme: BadgeThemeData(
        backgroundColor: danger,
        textStyle: GoogleFonts.sourceCodePro(
            fontWeight: FontWeight.w700, fontSize: 9),
      ),

      // ── ProgressIndicator ───────────────────────────────────────────────
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: brand,
        linearTrackColor: brandLight,
      ),
    );
  }

  // light redirects to dark (app is dark-only)
  static ThemeData get light => dark;
}
