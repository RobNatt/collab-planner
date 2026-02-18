import { useTheme } from '../contexts/ThemeContext';

export function LTDBadge() {
  const { colors } = useTheme();

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '3px 10px',
      backgroundColor: `${colors.warning}20`,
      color: colors.warning,
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '700',
      border: `1px solid ${colors.warning}40`,
      letterSpacing: '0.5px',
    }}>
      ★ LTD
    </span>
  );
}
