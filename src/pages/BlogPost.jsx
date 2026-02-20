import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import blogPosts from '../data/blogPosts';

// Minimal markdown-to-HTML: handles ## h2, **bold**, [text](url), \n\n paragraphs
function renderContent(content) {
  const { useTheme: _, ...rest } = {};
  void rest;
  const lines = content.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      elements.push({ type: 'h2', text: line.slice(3) });
    } else if (line.trim() === '') {
      // skip blank lines
    } else {
      elements.push({ type: 'p', text: line });
    }
    i++;
  }

  return elements;
}

function formatInline(text, colors) {
  // Handle **bold** and [link text](url)
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const linkMatch = remaining.match(/\[(.+?)\]\((.+?)\)/);

    let nextBold = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity;
    let nextLink = linkMatch ? remaining.indexOf(linkMatch[0]) : Infinity;

    if (nextBold === Infinity && nextLink === Infinity) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    if (nextBold <= nextLink) {
      if (nextBold > 0) parts.push(<span key={key++}>{remaining.slice(0, nextBold)}</span>);
      parts.push(<strong key={key++} style={{ color: colors.text }}>{boldMatch[1]}</strong>);
      remaining = remaining.slice(nextBold + boldMatch[0].length);
    } else {
      if (nextLink > 0) parts.push(<span key={key++}>{remaining.slice(0, nextLink)}</span>);
      parts.push(
        <a
          key={key++}
          href={linkMatch[2]}
          style={{ color: colors.primary, fontWeight: '600', textDecoration: 'none' }}
          onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
          onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(nextLink + linkMatch[0].length);
    }
  }

  return parts;
}

function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();

  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
          <h1 style={{ color: colors.text, marginBottom: '12px' }}>Post not found</h1>
          <button onClick={() => navigate('/blog')} style={{ color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}>
            ← Back to blog
          </button>
        </div>
      </div>
    );
  }

  const elements = renderContent(post.content);

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
          style={{ fontSize: '22px', fontWeight: 'bold', color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          Collab Planner
        </button>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/blog')}
            style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', fontWeight: '500', fontSize: '15px' }}
          >
            ← All Posts
          </button>
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
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Article */}
      <article style={{ maxWidth: '740px', margin: '0 auto', padding: '40px 40px 100px' }}>
        {/* Cover */}
        <div style={{
          width: '100%',
          height: '200px',
          backgroundColor: `${colors.primary}12`,
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '80px',
          marginBottom: '36px',
        }}>
          {post.coverEmoji}
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
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

        <h1 style={{
          fontSize: 'clamp(26px, 4vw, 40px)',
          fontWeight: '800',
          color: colors.text,
          lineHeight: '1.2',
          marginBottom: '32px',
        }}>
          {post.title}
        </h1>

        {/* Content */}
        <div style={{ lineHeight: '1.8' }}>
          {elements.map((el, i) => {
            if (el.type === 'h2') {
              return (
                <h2 key={i} style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: colors.text,
                  marginTop: '40px',
                  marginBottom: '12px',
                }}>
                  {el.text}
                </h2>
              );
            }
            return (
              <p key={i} style={{
                fontSize: '16px',
                color: colors.textSecondary,
                marginBottom: '16px',
              }}>
                {formatInline(el.text, colors)}
              </p>
            );
          })}
        </div>

        {/* Tags */}
        {post.tags && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '40px', paddingTop: '32px', borderTop: `1px solid ${colors.border}` }}>
            {post.tags.map((tag) => (
              <span key={tag} style={{
                fontSize: '12px',
                padding: '4px 12px',
                borderRadius: '12px',
                backgroundColor: colors.backgroundTertiary,
                color: colors.textSecondary,
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{
          marginTop: '48px',
          padding: '32px',
          backgroundColor: `${colors.primary}10`,
          border: `1px solid ${colors.primary}30`,
          borderRadius: '16px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>✈️</div>
          <h3 style={{ color: colors.text, fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
            Ready to plan your group trip?
          </h3>
          <p style={{ color: colors.textSecondary, marginBottom: '20px', fontSize: '15px' }}>
            Collab Planner gives your group one shared space for itineraries, tasks, and expenses — free to start.
          </p>
          <button
            onClick={() => navigate('/login?signup=true')}
            style={{
              padding: '12px 28px',
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '15px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 4px 16px ${colors.primary}44`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Start Planning for Free →
          </button>
        </div>

        {/* Related posts */}
        {blogPosts.filter((p) => p.slug !== post.slug).length > 0 && (
          <div style={{ marginTop: '60px' }}>
            <h3 style={{ color: colors.text, fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>More from the blog</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3).map((related) => (
                <div
                  key={related.slug}
                  onClick={() => navigate(`/blog/${related.slug}`)}
                  style={{
                    padding: '16px 20px',
                    backgroundColor: colors.cardBg,
                    borderRadius: '10px',
                    border: `1px solid ${colors.border}`,
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'center',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.backgroundTertiary; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.cardBg; }}
                >
                  <span style={{ fontSize: '28px' }}>{related.coverEmoji}</span>
                  <div>
                    <div style={{ color: colors.text, fontWeight: '600', fontSize: '15px' }}>{related.title}</div>
                    <div style={{ color: colors.textMuted, fontSize: '13px' }}>{related.readTime}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>

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

export default BlogPost;
