import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import blogPosts from '../data/blogPosts';

function Landing() {
  const navigate = useNavigate();
  const { colors } = useTheme();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      transition: 'background-color 0.3s ease',
    }}>
      {/* Navigation Bar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: colors.primary,
        }}>
          Collab Planner
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/blog')}
            style={{
              padding: '10px 16px',
              backgroundColor: 'transparent',
              color: colors.textSecondary,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = colors.text; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = colors.textSecondary; }}
          >
            Blog
          </button>
          <ThemeToggle />
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '10px 24px',
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
            Login
          </button>
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

      {/* Hero Section */}
      <section style={{
        padding: '80px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <div className="animate-fadeIn">
          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            backgroundColor: `${colors.primary}18`,
            border: `1px solid ${colors.primary}40`,
            borderRadius: '20px',
            color: colors.primary,
            fontWeight: '600',
            fontSize: '14px',
            marginBottom: '24px',
          }}>
            Free Group Travel Planner App
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: '800',
            color: colors.text,
            marginBottom: '24px',
            lineHeight: '1.1',
          }}>
            The Collaborative Travel Planner<br />
            <span style={{ color: colors.primary }}>Built for Groups</span>
          </h1>

          <p style={{
            fontSize: 'clamp(18px, 2vw, 22px)',
            color: colors.textSecondary,
            maxWidth: '700px',
            margin: '0 auto 40px',
            lineHeight: '1.6',
          }}>
            Plan trips together with your group — from itinerary planning and task management
            to expense splitting and real-time collaboration. The all-in-one vacation planner app
            for friends, families, and group travel.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/login?signup=true')}
              style={{
                padding: '16px 40px',
                fontSize: '18px',
                backgroundColor: colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '700',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${colors.primary}44`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Start Planning for Free
            </button>
            <button
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              style={{
                padding: '16px 40px',
                fontSize: '18px',
                backgroundColor: 'transparent',
                color: colors.text,
                border: `2px solid ${colors.border}`,
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.backgroundTertiary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              See Features
            </button>
          </div>
        </div>

        {/* Travel-specific visual mockup */}
        <div style={{
          marginTop: '60px',
          padding: '32px',
          backgroundColor: colors.cardBg,
          borderRadius: '20px',
          boxShadow: `0 8px 32px ${colors.shadow}`,
          border: `1px solid ${colors.border}`,
        }}>
          {/* Mock plan header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: colors.text }}>🗺️ Tokyo & Kyoto Trip</div>
              <div style={{ fontSize: '14px', color: colors.textSecondary, marginTop: '4px' }}>Mar 15 – Mar 22 · 8 days · 6 members</div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Planning', 'Itinerary', 'Expenses', 'Tasks'].map((tab, i) => (
                <div key={i} style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  backgroundColor: i === 0 ? colors.primary : colors.backgroundTertiary,
                  color: i === 0 ? 'white' : colors.textSecondary,
                }}>
                  {tab}
                </div>
              ))}
            </div>
          </div>

          {/* Mock activity cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '16px',
          }}>
            {[
              { icon: '✈️', label: 'Book flights', detail: 'Due Mar 1 · Assigned to Alex', tag: 'Task', tagColor: colors.primary },
              { icon: '🏨', label: 'Shinjuku Hotel', detail: '$840 · Split 6 ways = $140 each', tag: 'Expense', tagColor: colors.success },
              { icon: '🗼', label: 'Tokyo Tower visit', detail: 'Mar 17 · 10:00 AM · All members', tag: 'Activity', tagColor: colors.warning },
              { icon: '🍜', label: 'Ramen tour', detail: 'Mar 18 · Suggested by 4 members', tag: 'Voted', tagColor: colors.purple },
              { icon: '🚅', label: 'Shinkansen pass', detail: '$220 · Split 6 ways = $37 each', tag: 'Expense', tagColor: colors.success },
              { icon: '🗃️', label: 'Passport copies', detail: 'Due Feb 28 · Assigned to Taylor', tag: 'Task', tagColor: colors.primary },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '16px',
                backgroundColor: colors.backgroundTertiary,
                borderRadius: '12px',
                textAlign: 'left',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>{item.icon}</span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    backgroundColor: `${item.tagColor}20`,
                    color: item.tagColor,
                  }}>{item.tag}</span>
                </div>
                <div style={{ color: colors.text, fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ color: colors.textSecondary, fontSize: '12px' }}>{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is this travel planner? */}
      <section id="what-is" style={{
        padding: '100px 40px',
        backgroundColor: colors.backgroundSecondary,
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: '700',
              color: colors.text,
              marginBottom: '16px',
            }}>
              What is Collab Planner?
            </h2>
            <p style={{
              color: colors.textSecondary,
              fontSize: '18px',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: '1.7',
            }}>
              Collab Planner is a <strong style={{ color: colors.text }}>group travel planner</strong> that makes
              coordinating trips simple. Whether you're planning a weekend getaway or a two-week vacation,
              our <strong style={{ color: colors.text }}>itinerary planner</strong> keeps everyone on the same page —
              tasks, activities, expenses, and dates, all in one place.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
          }}>
            {[
              {
                icon: '👫',
                title: 'Friends Planning a Trip',
                description: 'Stop juggling Google Docs, group chats, and spreadsheets. Collab Planner puts your entire group trip — dates, destinations, tasks, and money — in one shared space everyone can edit.',
              },
              {
                icon: '👨‍👩‍👧‍👦',
                title: 'Family Vacation Planning',
                description: 'Coordinate family vacations without the chaos. Assign tasks, vote on activities, track what everyone owes, and share the itinerary so the whole family stays in sync.',
              },
              {
                icon: '💼',
                title: 'Business Trips & Team Offsites',
                description: 'Plan company retreats, team offsites, and multi-city business trips with your colleagues. Track expenses by person, assign logistics tasks, and keep everyone on the same schedule.',
              },
              {
                icon: '🌍',
                title: 'Group Tours & Travel Clubs',
                description: 'Running a group tour or travel club? Manage multiple members, plan day-by-day itineraries, and track shared expenses — all without the email back-and-forth.',
              },
              {
                icon: '🎒',
                title: 'Backpacking & Adventure Groups',
                description: 'From packing checklists to hostel bookings, keep your adventure group organized. Real-time updates mean everyone sees the latest plan, wherever they are.',
              },
              {
                icon: '🎓',
                title: 'School Trips & Group Tours',
                description: 'Organizing a student trip or educational tour? Manage schedules, assignments, and group expenses in one place — so chaperones and coordinators stay in control.',
              },
            ].map((card, i) => (
              <div
                key={i}
                style={{
                  padding: '32px',
                  backgroundColor: colors.cardBg,
                  borderRadius: '16px',
                  border: `1px solid ${colors.border}`,
                  boxShadow: `0 2px 12px ${colors.shadow}`,
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
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>{card.icon}</div>
                <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>{card.title}</h3>
                <p style={{ color: colors.textSecondary, lineHeight: '1.6', margin: 0, fontSize: '15px' }}>{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: '100px 40px',
        backgroundColor: colors.background,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: '700',
            color: colors.text,
            textAlign: 'center',
            marginBottom: '16px',
          }}>
            Everything Your Group Needs for Trip Planning
          </h2>
          <p style={{
            color: colors.textSecondary,
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto 60px',
            fontSize: '18px',
          }}>
            From itinerary planning to expense splitting — all the group travel planning tools you need, in one app.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px',
          }}>
            {[
              {
                icon: '🗓️',
                title: 'Itinerary Planner',
                description: 'Build a day-by-day travel itinerary together. Add activities, set times, vote on suggestions, and see everything on a shared calendar your whole group can view.',
                color: colors.primary,
              },
              {
                icon: '✅',
                title: 'Group Task Management',
                description: 'Assign trip planning tasks to members — book flights, reserve restaurants, pack gear. Set priorities, due dates, and track what\'s done.',
                color: colors.warning,
              },
              {
                icon: '💰',
                title: 'Shared Expense Tracking',
                description: 'Log travel expenses, split costs evenly or custom between members, and see who owes whom. No more awkward money conversations.',
                color: colors.success,
              },
              {
                icon: '👥',
                title: 'Real-Time Collaboration',
                description: 'Invite your travel group with a link or QR code. Everyone sees updates live — no more out-of-date spreadsheets or missed messages.',
                color: colors.purple,
              },
              {
                icon: '📊',
                title: 'Trip Analytics',
                description: 'See your travel budget at a glance — expense breakdowns by category, member contributions, and trip progress all in one dashboard.',
                color: colors.danger,
              },
              {
                icon: '🌙',
                title: 'Beautiful, Mobile-Friendly',
                description: 'Plan on desktop, check on your phone. Clean interface with dark mode support so your itinerary always looks great.',
                color: colors.textSecondary,
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="animate-fadeIn"
                style={{
                  padding: '32px',
                  backgroundColor: colors.cardBg,
                  borderRadius: '16px',
                  boxShadow: `0 2px 12px ${colors.shadow}`,
                  border: `1px solid ${colors.border}`,
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
                <div style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: `${feature.color}15`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  marginBottom: '20px',
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  color: colors.text,
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '12px',
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: colors.textSecondary,
                  lineHeight: '1.6',
                  margin: 0,
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{
        padding: '100px 40px',
        backgroundColor: colors.backgroundSecondary,
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: '700',
            color: colors.text,
            marginBottom: '16px',
          }}>
            Simple, One-Time Pricing
          </h2>
          <p style={{
            color: colors.textSecondary,
            fontSize: '18px',
            marginBottom: '16px',
          }}>
            Start free — upgrade once for lifetime access to all trip planning features.
          </p>
          <div style={{
            display: 'inline-block',
            padding: '8px 20px',
            backgroundColor: `${colors.danger}15`,
            border: `1px solid ${colors.danger}40`,
            borderRadius: '20px',
            color: colors.danger,
            fontWeight: '700',
            fontSize: '14px',
            marginBottom: '40px',
          }}>
            Limited: Only 127 of 500 lifetime spots available
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            textAlign: 'left',
          }}>
            {/* Free */}
            <div style={{
              padding: '32px',
              backgroundColor: colors.cardBg,
              borderRadius: '16px',
              border: `1px solid ${colors.border}`,
            }}>
              <h3 style={{ color: colors.textSecondary, fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Free</h3>
              <div style={{ fontSize: '36px', fontWeight: '800', color: colors.text, marginBottom: '4px' }}>$0</div>
              <p style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '20px' }}>Forever free</p>
              <button
                onClick={() => navigate('/login?signup=true')}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  backgroundColor: 'transparent',
                  color: colors.text,
                  border: `2px solid ${colors.border}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  marginBottom: '20px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.backgroundTertiary}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Get Started
              </button>
              {['1 trip plan', 'Up to 3 members', 'Max 4-day trips', 'Basic task management'].map((f, i) => (
                <div key={i} style={{ padding: '6px 0', color: colors.textSecondary, fontSize: '14px', display: 'flex', gap: '8px' }}>
                  <span style={{ color: colors.success }}>✓</span> {f}
                </div>
              ))}
            </div>

            {/* LTD */}
            <div style={{
              padding: '32px',
              backgroundColor: colors.cardBg,
              borderRadius: '16px',
              border: `2px solid ${colors.primary}`,
              position: 'relative',
              boxShadow: `0 4px 24px ${colors.primary}22`,
            }}>
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '4px 14px',
                backgroundColor: colors.primary,
                color: 'white',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
              }}>
                Best Value
              </div>
              <h3 style={{ color: colors.primary, fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Lifetime Deal</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '36px', fontWeight: '800', color: colors.text }}>$49</span>
                <span style={{ color: colors.textSecondary, textDecoration: 'line-through' }}>$199</span>
              </div>
              <p style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '20px' }}>One-time, lifetime access</p>
              <button
                onClick={() => navigate('/pricing')}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '15px',
                  fontWeight: '700',
                  backgroundColor: colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  marginBottom: '20px',
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
                Get Lifetime Access
              </button>
              {['Unlimited trips & members', 'Any trip duration', 'Advanced expenses + CSV export', 'Calendar & iCal export', 'Analytics dashboard', 'All future updates'].map((f, i) => (
                <div key={i} style={{ padding: '6px 0', color: colors.text, fontSize: '14px', display: 'flex', gap: '8px', fontWeight: i < 2 ? '600' : '400' }}>
                  <span style={{ color: colors.primary }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section style={{
        padding: '80px 40px',
        backgroundColor: colors.background,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(24px, 3vw, 36px)',
            fontWeight: '700',
            color: colors.text,
            marginBottom: '16px',
          }}>
            Trusted by Travel Groups Everywhere
          </h2>
          <p style={{
            color: colors.textSecondary,
            fontSize: '16px',
            marginBottom: '48px',
          }}>
            From weekend road trips to international group travel — Collab Planner keeps every trip on track.
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '60px',
            flexWrap: 'wrap',
            marginBottom: '60px',
          }}>
            {[
              { number: '1,000+', label: 'Trips Planned' },
              { number: '5,000+', label: 'Tasks Completed' },
              { number: '500+', label: 'Happy Groups' },
            ].map((stat, i) => (
              <div key={i}>
                <div style={{ fontSize: '42px', fontWeight: '800', color: colors.primary }}>
                  {stat.number}
                </div>
                <div style={{ color: colors.textSecondary }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{
            maxWidth: '700px',
            margin: '0 auto',
            padding: '32px',
            backgroundColor: colors.cardBg,
            borderRadius: '16px',
            border: `1px solid ${colors.border}`,
          }}>
            <p style={{
              fontSize: '20px',
              color: colors.text,
              fontStyle: 'italic',
              marginBottom: '20px',
              lineHeight: '1.6',
            }}>
              "Collab Planner made organizing our group trip to Japan so much easier.
              Everyone knew their tasks, the itinerary was always up to date, and splitting expenses was a breeze!"
            </p>
            <div style={{ color: colors.textSecondary }}>
              — Happy User, Group Travel Organizer
            </div>
          </div>
        </div>
      </section>

      {/* Blog Preview Section */}
      {blogPosts.length > 0 && (
        <section style={{ padding: '100px 40px', backgroundColor: colors.background }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: '700', color: colors.text, marginBottom: '8px' }}>
                  Travel Planning Tips
                </h2>
                <p style={{ color: colors.textSecondary, fontSize: '16px' }}>
                  Guides to help your group plan better trips.
                </p>
              </div>
              <button
                onClick={() => navigate('/blog')}
                style={{
                  padding: '10px 22px',
                  backgroundColor: 'transparent',
                  color: colors.primary,
                  border: `1px solid ${colors.primary}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${colors.primary}10`; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                View all posts →
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px',
            }}>
              {blogPosts.slice(0, 3).map((post) => (
                <article
                  key={post.slug}
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  style={{
                    padding: '24px',
                    backgroundColor: colors.cardBg,
                    borderRadius: '14px',
                    border: `1px solid ${colors.border}`,
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 8px 24px ${colors.shadow}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>{post.coverEmoji}</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', backgroundColor: `${colors.primary}18`, color: colors.primary }}>
                      {post.category}
                    </span>
                    <span style={{ fontSize: '12px', color: colors.textMuted }}>{post.readTime}</span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: colors.text, marginBottom: '8px', lineHeight: '1.4' }}>{post.title}</h3>
                  <p style={{ fontSize: '13px', color: colors.textSecondary, lineHeight: '1.6', marginBottom: '12px' }}>
                    {post.excerpt.slice(0, 100)}...
                  </p>
                  <span style={{ fontSize: '13px', color: colors.primary, fontWeight: '600' }}>Read more →</span>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section style={{
        padding: '100px 40px',
        backgroundColor: colors.primary,
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: '700',
            color: 'white',
            marginBottom: '20px',
          }}>
            Ready to Plan Your Next Group Trip?
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '18px',
            marginBottom: '40px',
          }}>
            Join travel groups who use Collab Planner to organize trips, manage itineraries, and split expenses — all in one place.
          </p>
          <button
            onClick={() => navigate('/login?signup=true')}
            style={{
              padding: '18px 48px',
              fontSize: '18px',
              backgroundColor: 'white',
              color: colors.primary,
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '700',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Start Planning for Free
          </button>
        </div>
      </section>

      <footer style={{
        padding: '40px',
        backgroundColor: colors.backgroundSecondary,
        textAlign: 'center',
        borderTop: `1px solid ${colors.border}`,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '32px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}>
          {['About', 'Features', 'Pricing', 'Blog', 'Privacy', 'Terms'].map((link) => (
            <a
              key={link}
              href={link === 'Features' ? '#features' : link === 'Pricing' ? '#pricing' : link === 'Blog' ? '/blog' : link === 'Terms' ? '/terms' : link === 'Privacy' ? '/privacy' : '#'}
              style={{
                color: colors.textSecondary,
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
            >
              {link}
            </a>
          ))}
        </div>
        <p style={{ color: colors.textMuted, fontSize: '14px' }}>
          © 2026 Collab Planner. All rights reserved. · Group Travel Planner App
        </p>
      </footer>
    </div>
  );
}

export default Landing;
