import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

function NotFound() {
  const navigate = useNavigate();
  const { colors } = useTheme();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: '20px',
    }}>
      <div className="animate-scaleIn" style={{
        textAlign: 'center',
        maxWidth: '500px',
        padding: '48px',
        backgroundColor: colors.cardBg,
        borderRadius: '16px',
        boxShadow: `0 4px 24px ${colors.shadow}`,
      }}>
        <div style={{
          fontSize: '80px',
          fontWeight: '800',
          color: colors.primary,
          lineHeight: '1',
          marginBottom: '8px',
        }}>
          404
        </div>
        <h1 style={{ fontSize: '24px', color: colors.text, marginBottom: '12px' }}>
          Page Not Found
        </h1>
        <p style={{ color: colors.textSecondary, marginBottom: '32px', lineHeight: '1.6' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '12px 28px',
              fontSize: '16px',
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 4px 12px ${colors.shadow}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 28px',
              fontSize: '16px',
              backgroundColor: 'transparent',
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.backgroundTertiary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
