import { useTheme } from '../contexts/ThemeContext';

// Reusable loading spinner component for all async operations
export function LoadingSpinner({ size = 'medium', color, text, fullScreen = false, overlay = false }) {
  const { colors } = useTheme();
  const spinnerColor = color || colors.primary;

  const sizes = {
    small: { spinner: 20, border: 2 },
    medium: { spinner: 36, border: 3 },
    large: { spinner: 48, border: 4 },
  };

  const { spinner: spinnerSize, border: borderWidth } = sizes[size] || sizes.medium;

  const spinnerStyle = {
    width: spinnerSize,
    height: spinnerSize,
    border: `${borderWidth}px solid ${colors.backgroundTertiary}`,
    borderTop: `${borderWidth}px solid ${spinnerColor}`,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };

  const content = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
    }}>
      <div style={spinnerStyle} />
      {text && (
        <span style={{
          color: colors.textSecondary,
          fontSize: size === 'small' ? '12px' : '14px',
          fontWeight: '500',
        }}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.background,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}>
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: `${colors.cardBg}ee`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 'inherit',
        zIndex: 10,
      }}>
        {content}
      </div>
    );
  }

  return content;
}

// Button with built-in loading state
export function LoadingButton({
  children,
  loading = false,
  disabled = false,
  onClick,
  style = {},
  loadingText,
  ...props
}) {
  const { colors } = useTheme();

  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        opacity: disabled && !loading ? 0.6 : 1,
        ...style,
      }}
      {...props}
    >
      {loading && (
        <div style={{
          width: 16,
          height: 16,
          border: `2px solid ${colors.backgroundTertiary}`,
          borderTop: `2px solid currentColor`,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      )}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}

export default LoadingSpinner;
