import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import blogPosts from '../data/blogPosts';

function Blog() {
  const navigate = useNavigate();
  const { colors } = useTheme();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background, transition: 'background-color 0.3s ease' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            fontSize: '22px',
            fontWeight: 'bold',
            color: colors.primary,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Collab Planner
        </button>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <ThemeToggle />
          <button
            onClick={() => navigate('/login?signup=true')}
            style={{
              padding: '10px 24px',
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
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Header */}
      <section style={{
        padding: '60px 40px 40px',
        maxWidth: '900px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: '800',
          color: colors.text,
          marginBottom: '16px',
        }}>
          Travel Planning Tips & Guides
        </h1>
        <p style={{
          fontSize: '18px',
          color: colors.textSecondary,
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6',
        }}>
          Group travel planning advice, itinerary ideas, and trip coordination tips — from the team behind Collab Planner.
        </p>
      </section>

      {/* Posts Grid */}
      <section style={{ padding: '20px 40px 100px', maxWidth: '1100px', margin: '0 auto' }}>
        {blogPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: colors.textSecondary }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✍️</div>
            <p style={{ fontSize: '18px' }}>First posts coming soon. Subscribe below to be notified.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '28px',
          }}>
            {blogPosts.map((post) => (
              <article
                key={post.slug}
                onClick={() => navigate(`/blog/${post.slug}`)}
                style={{
                  padding: '28px',
                  backgroundColor: colors.cardBg,
                  borderRadius: '16px',
                  border: `1px solid ${colors.border}`,
                  boxShadow: `0 2px 12px ${colors.shadow}`,
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${colors.shadow}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 2px 12px ${colors.shadow}`;
                }}
              >
                {/* Cover */}
                <div style={{
                  width: '100%',
                  height: '120px',
                  backgroundColor: `${colors.primary}12`,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '52px',
                  marginBottom: '20px',
                }}>
                  {post.coverEmoji}
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    backgroundColor: `${colors.primary}18`,
                    color: colors.primary,
                  }}>
                    {post.category}
                  </span>
                  <span style={{ fontSize: '13px', color: colors.textMuted }}>
                    {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span style={{ fontSize: '13px', color: colors.textMuted }}>· {post.readTime}</span>
                </div>

                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: colors.text,
                  marginBottom: '10px',
                  lineHeight: '1.4',
                }}>
                  {post.title}
                </h2>

                <p style={{
                  fontSize: '14px',
                  color: colors.textSecondary,
                  lineHeight: '1.6',
                  marginBottom: '16px',
                }}>
                  {post.excerpt}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.primary, fontWeight: '600', fontSize: '14px' }}>
                  Read more →
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px',
        backgroundColor: colors.backgroundSecondary,
        textAlign: 'center',
        borderTop: `1px solid ${colors.border}`,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: colors.primary, fontWeight: '700', fontSize: '18px', cursor: 'pointer', marginBottom: '12px' }}
        >
          Collab Planner
        </button>
        <p style={{ color: colors.textMuted, fontSize: '14px' }}>
          © 2026 Collab Planner · Group Travel Planner App
        </p>
      </footer>
    </div>
  );
}

export default Blog;
