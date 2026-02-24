export const COLORS = {
  primary: "#2463eb",
  primarySoft: "rgba(36,99,235,0.12)",
  background: "#f6f6f8",
  backgroundDark: "#111621",
  text: "#0f172a",
  textMuted: "#64748b",
  textLight: "#f8fafc",
  border: "#e2e8f0",
  success: "#10b981",
  danger: "#ef4444",
  warning: "#f59e0b",
  card: "#ffffff",
  cardBorder: "#e8edf3",
  cardDark: "rgba(17,22,33,0.92)",
  cardBorderDark: "rgba(148,163,184,0.15)",
};

export const THEME = {
  light: {
    background: COLORS.background,
    text: COLORS.text,
    textMuted: COLORS.textMuted,
    primary: COLORS.primary,
    primarySoft: COLORS.primarySoft,
    border: COLORS.border,
    surface: "#ffffff",
    surfaceMuted: "#f1f5f9",
    card: COLORS.card,
    cardBorder: COLORS.cardBorder,
    success: COLORS.success,
    danger: COLORS.danger,
    warning: COLORS.warning,
  },
  dark: {
    background: COLORS.backgroundDark,
    text: COLORS.textLight,
    textMuted: "#94a3b8",
    primary: COLORS.primary,
    primarySoft: "rgba(36,99,235,0.2)",
    border: "rgba(148,163,184,0.25)",
    surface: "#1b2232",
    surfaceMuted: "#151c29",
    card: COLORS.cardDark,
    cardBorder: COLORS.cardBorderDark,
    success: "#34d399",
    danger: "#f87171",
    warning: "#fbbf24",
  },
};

export const getThemeColors = (isDark: boolean) => (isDark ? THEME.dark : THEME.light);

export const SPACING = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
};

export const getGlassCardStyle = (isDark: boolean) => ({
  backgroundColor: isDark ? COLORS.cardDark : COLORS.card,
  borderColor: isDark ? COLORS.cardBorderDark : COLORS.cardBorder,
  borderWidth: 1,
});

export const softShadow = {
  shadowColor: "#0f172a",
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};
