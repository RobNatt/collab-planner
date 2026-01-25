import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import toast from 'react-hot-toast';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { colors } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Account created successfully!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Welcome back!');
      }

      const redirectPath = searchParams.get('redirect');
      if (redirectPath) {
        navigate(redirectPath);
      } else {
        const inviteCode = searchParams.get('invite');
        if (inviteCode) {
          navigate(`/join/${inviteCode}`);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message);
      toast.error(isSignUp ? 'Failed to create account' : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    fontSize: '16px',
    backgroundColor: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: '8px',
    color: colors.text,
    transition: 'all 0.2s ease',
    outline: 'none',
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      transition: 'background-color 0.3s ease',
    }}>
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <ThemeToggle />
      </div>

      <div
        className="animate-scaleIn"
        style={{
          width: '100%',
          maxWidth: '450px',
          padding: '40px',
          backgroundColor: colors.cardBg,
          borderRadius: '16px',
          boxShadow: `0 4px 24px ${colors.shadow}`,
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            color: colors.text,
            fontSize: '28px',
            marginBottom: '8px',
          }}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p style={{ color: colors.textSecondary }}>
            {isSignUp ? 'Sign up to start planning' : 'Login to Collab Planner'}
          </p>
        </div>

        {error && (
          <div
            className="animate-fadeIn"
            style={{
              color: colors.danger,
              marginBottom: '20px',
              padding: '14px 16px',
              backgroundColor: colors.dangerLight,
              borderRadius: '8px',
              border: `1px solid ${colors.danger}`,
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: colors.textSecondary,
              fontWeight: '500',
              fontSize: '14px',
            }}>
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = colors.inputFocus;
                e.target.style.boxShadow = `0 0 0 3px ${colors.inputFocus}22`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.inputBorder;
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: colors.textSecondary,
              fontWeight: '500',
              fontSize: '14px',
            }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = colors.inputFocus;
                e.target.style.boxShadow = `0 0 0 3px ${colors.inputFocus}22`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.inputBorder;
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 24px',
              fontSize: '16px',
              fontWeight: '600',
              backgroundColor: loading ? colors.textMuted : colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '16px',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = colors.primaryHover;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${colors.shadow}`;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = colors.primary;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? (isSignUp ? 'Creating Account...' : 'Logging in...') : (isSignUp ? 'Sign Up' : 'Login')}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: colors.primary,
              fontSize: '14px',
              cursor: 'pointer',
              padding: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
