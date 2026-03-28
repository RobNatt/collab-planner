import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { auth } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import blogPosts from '../data/blogPosts';
import { INDIVIDUAL_PLANS, BUSINESS_PLANS } from '../data/pricingPlans';

function Landing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { colors } = useTheme();
  const [planTab, setPlanTab] = useState('individual'); // 'individual' | 'business'

  useEffect(() => {
    if (location.hash === '#pricing') {
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.hash]);

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
            Collaborative Online Travel Planner<br />
            <span style={{ color: colors.primary }}>Built for Groups</span>
          </h1>

          <p style={{
            fontSize: 'clamp(18px, 2vw, 22px)',
            color: colors.textSecondary,
            maxWidth: '700px',
            margin: '0 auto 40px',
            lineHeight: '1.6',
          }}>
            The travel planner built for group trips. From itinerary planning and task management
            to shared expense splitting and real-time collaboration — the all-in-one vacation planner app
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
              onClick={() => navigate('/demo')}
              style={{
                padding: '16px 28px',
                fontSize: '18px',
                backgroundColor: colors.success,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '700',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Try Demo Trip
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

          <div style={{
            marginTop: '18px',
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            color: colors.textSecondary,
            fontSize: '13px',
            fontWeight: '600',
          }}>
            <span>Realtime collaboration</span>
            <span>Role-based permissions</span>
            <span>Stripe-secure payments</span>
          </div>
        </div>

        {/* Trip mockups */}
        <div style={{ marginTop: '60px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            {
              title: '🗺️ Tokyo & Kyoto Trip',
              meta: 'Mar 15 – Mar 22 · 8 days · 6 members',
              cards: [
                { icon: '✈️', label: 'Book flights', detail: 'Due Mar 1 · Assigned to Alex', tag: 'Task', tagColor: colors.primary },
                { icon: '🏨', label: 'Shinjuku Hotel', detail: '$840 · Split 6 ways = $140 each', tag: 'Expense', tagColor: colors.success },
                { icon: '🗼', label: 'Tokyo Tower visit', detail: 'Mar 17 · 10:00 AM · All members', tag: 'Activity', tagColor: colors.warning },
                { icon: '🍜', label: 'Ramen tour', detail: 'Mar 18 · Suggested by 4 members', tag: 'Voted', tagColor: colors.purple },
              ],
            },
            {
              title: '🌊 Amalfi Coast & Rome',
              meta: 'Jun 5 – Jun 14 · 10 days · 4 members',
              cards: [
                { icon: '🚗', label: 'Rent a convertible', detail: 'Due May 20 · Assigned to Jamie', tag: 'Task', tagColor: colors.primary },
                { icon: '🏛️', label: 'Colosseum tour', detail: 'Jun 6 · 9:00 AM · Skip the line tickets', tag: 'Activity', tagColor: colors.warning },
                { icon: '🍕', label: 'Dinner at La Pergola', detail: '$320 · Split 4 ways = $80 each', tag: 'Expense', tagColor: colors.success },
                { icon: '⛵', label: 'Boat tour to Capri', detail: 'Jun 10 · Suggested by 3 members', tag: 'Voted', tagColor: colors.purple },
              ],
            },
            {
              title: '💼 NYC Team Offsite',
              meta: 'Apr 22 – Apr 24 · 3 days · 8 members',
              cards: [
                { icon: '🏢', label: 'Book conference room', detail: 'Due Apr 10 · Assigned to Morgan', tag: 'Task', tagColor: colors.primary },
                { icon: '🏨', label: 'Midtown hotel block', detail: '$3,200 · Split 8 ways = $400 each', tag: 'Expense', tagColor: colors.success },
                { icon: '🍽️', label: 'Team dinner — Apr 22', detail: '7:00 PM · Reservation for 8', tag: 'Activity', tagColor: colors.warning },
                { icon: '🗽', label: 'Evening rooftop event', detail: 'Apr 23 · Voted by 6 members', tag: 'Voted', tagColor: colors.purple },
              ],
            },
          ].map((trip, ti) => (
            <div key={ti} style={{
              padding: '28px',
              backgroundColor: colors.cardBg,
              borderRadius: '20px',
              boxShadow: `0 8px 32px ${colors.shadow}`,
              border: `1px solid ${colors.border}`,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: colors.text }}>{trip.title}</div>
                  <div style={{ fontSize: '13px', color: colors.textSecondary, marginTop: '4px' }}>{trip.meta}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Planning', 'Itinerary', 'Expenses', 'Tasks'].map((tab, i) => (
                    <div key={i} style={{
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: i === 0 ? colors.primary : colors.backgroundTertiary,
                      color: i === 0 ? 'white' : colors.textSecondary,
                    }}>
                      {tab}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
              }}>
                {trip.cards.map((item, i) => (
                  <div key={i} style={{
                    padding: '14px',
                    backgroundColor: colors.backgroundTertiary,
                    borderRadius: '10px',
                    textAlign: 'left',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span style={{ fontSize: '22px' }}>{item.icon}</span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        padding: '2px 7px',
                        borderRadius: '8px',
                        backgroundColor: `${item.tagColor}20`,
                        color: item.tagColor,
                      }}>{item.tag}</span>
                    </div>
                    <div style={{ color: colors.text, fontWeight: '600', fontSize: '13px', marginBottom: '3px' }}>{item.label}</div>
                    <div style={{ color: colors.textSecondary, fontSize: '11px' }}>{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
              What is Collab Planner? — An Online Travel Planner for Groups
            </h2>
            <p style={{
              color: colors.textSecondary,
              fontSize: '18px',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: '1.7',
            }}>
              Collab Planner is a free <strong style={{ color: colors.text }}>online travel planner</strong> built for groups.
              Whether you're organizing a weekend road trip or a two-week vacation abroad, our
              {' '}<strong style={{ color: colors.text }}>group trip planner</strong> keeps everyone on the same page —
              tasks, activities, shared expenses, and dates, all in one collaborative workspace.
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
            Everything Your Group Needs in One Travel Planner
          </h2>
          <p style={{
            color: colors.textSecondary,
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto 60px',
            fontSize: '18px',
          }}>
            From itinerary planning to expense splitting — all the group trip planner tools you need, in one travel planner app.
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
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: '700',
            color: colors.text,
            marginBottom: '16px',
          }}>
            Choose Your Plan
          </h2>
          <p style={{
            color: colors.textSecondary,
            fontSize: '18px',
            marginBottom: '32px',
          }}>
            Individual or Business — pick what fits your trip planning needs.
          </p>

          {/* Toggle: Individual vs Business */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '4px',
            backgroundColor: colors.backgroundTertiary,
            borderRadius: '12px',
            marginBottom: '40px',
            border: `1px solid ${colors.border}`,
          }}>
            <button
              onClick={() => setPlanTab('individual')}
              style={{
                padding: '10px 24px',
                fontSize: '15px',
                fontWeight: '600',
                backgroundColor: planTab === 'individual' ? colors.primary : 'transparent',
                color: planTab === 'individual' ? 'white' : colors.textSecondary,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Individual
            </button>
            <button
              onClick={() => setPlanTab('business')}
              style={{
                padding: '10px 24px',
                fontSize: '15px',
                fontWeight: '600',
                backgroundColor: planTab === 'business' ? colors.primary : 'transparent',
                color: planTab === 'business' ? 'white' : colors.textSecondary,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Business
            </button>
          </div>

          {/* Pricing Table */}
          <div style={{
            overflowX: 'auto',
            borderRadius: '16px',
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.cardBg,
            boxShadow: `0 4px 24px ${colors.shadow}`,
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '700px',
            }}>
              <thead>
                <tr style={{ backgroundColor: colors.backgroundTertiary, borderBottom: `2px solid ${colors.border}` }}>
                  <th style={{
                    padding: '20px 16px',
                    textAlign: 'left',
                    color: colors.textSecondary,
                    fontWeight: '600',
                    fontSize: '14px',
                    width: '180px',
                  }}>
                    Features
                  </th>
                  {(planTab === 'individual' ? INDIVIDUAL_PLANS : BUSINESS_PLANS).map((p) => (
                    <th key={p.id} style={{
                      padding: '20px 16px',
                      textAlign: 'center',
                      color: colors.text,
                      fontWeight: '700',
                      fontSize: '16px',
                      minWidth: '160px',
                    }}>
                      <div>{p.name}</div>
                      <div style={{ fontSize: '28px', color: colors.primary, marginTop: '4px' }}>{p.price}</div>
                      <div style={{ fontSize: '13px', color: colors.textSecondary, fontWeight: '500' }}>{p.priceNote}</div>
                      {p.trialLabel && (
                        <div style={{
                          display: 'inline-block',
                          marginTop: '8px',
                          padding: '4px 10px',
                          backgroundColor: `${colors.primary}18`,
                          color: colors.primary,
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}>
                          {p.trialLabel}
                        </div>
                      )}
                      {p.savings && (
                        <div style={{
                          display: 'inline-block',
                          marginTop: '8px',
                          padding: '4px 10px',
                          backgroundColor: `${colors.success}20`,
                          color: colors.success,
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}>
                          {p.savings}
                        </div>
                      )}
                      {p.slug && (
                        <div style={{ marginTop: '12px' }}>
                          <Link
                            to={`/plans/${p.slug}`}
                            style={{
                              fontSize: '13px',
                              fontWeight: '600',
                              color: colors.primary,
                              textDecoration: 'none',
                            }}
                          >
                            View plan details
                          </Link>
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: '16px', color: colors.textSecondary, fontSize: '14px' }}>Plans</td>
                  {(planTab === 'individual' ? INDIVIDUAL_PLANS : BUSINESS_PLANS).map((p) => (
                    <td key={p.id} style={{ padding: '16px', textAlign: 'center', color: colors.text, fontSize: '14px' }}>
                      {planTab === 'individual' && p.id === 'pay_per_trip' ? 'Unlimited' : 'Unlimited'}
                    </td>
                  ))}
                </tr>
                {planTab === 'individual' && (
                  <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={{ padding: '16px', color: colors.textSecondary, fontSize: '14px' }}>Trial</td>
                    {INDIVIDUAL_PLANS.map((p) => (
                      <td key={p.id} style={{ padding: '16px', textAlign: 'center', color: colors.text, fontSize: '14px' }}>
                        {p.trialLabel || '—'}
                      </td>
                    ))}
                  </tr>
                )}
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: '16px', color: colors.textSecondary, fontSize: '14px' }}>Collaborator pricing</td>
                  {(planTab === 'individual' ? INDIVIDUAL_PLANS : BUSINESS_PLANS).map((p) => (
                    <td key={p.id} style={{ padding: '16px', textAlign: 'center', color: colors.text, fontSize: '14px' }}>
                      {planTab === 'individual'
                        ? (p.id === 'pay_per_trip'
                          ? '$1 per collaborator (billed 48h before trip)'
                          : '$1 per collaborator per trip (48h before start)')
                        : 'First 10 free, then $2/mo each'}
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: '16px', color: colors.textSecondary, fontSize: '14px' }}>Trip duration</td>
                  {(planTab === 'individual' ? INDIVIDUAL_PLANS : BUSINESS_PLANS).map((p) => (
                    <td key={p.id} style={{ padding: '16px', textAlign: 'center', color: colors.text, fontSize: '14px' }}>
                      Unlimited
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: '16px', color: colors.textSecondary, fontSize: '14px' }}>Roster / saved profiles</td>
                  {(planTab === 'individual' ? INDIVIDUAL_PLANS : BUSINESS_PLANS).map((p) => (
                    <td key={p.id} style={{ padding: '16px', textAlign: 'center', color: colors.text, fontSize: '14px' }}>
                      {planTab === 'business' ? (
                        <span style={{ color: colors.success }}>✓</span>
                      ) : (
                        '—'
                      )}
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: '16px', color: colors.textSecondary, fontSize: '14px' }}>Billing</td>
                  {(planTab === 'individual' ? INDIVIDUAL_PLANS : BUSINESS_PLANS).map((p) => (
                    <td key={p.id} style={{ padding: '16px', textAlign: 'center', color: colors.text, fontSize: '14px' }}>
                      {p.id === 'pay_per_trip'
                        ? 'Trip + collaborators at T−48h'
                        : planTab === 'business'
                          ? (p.id.includes('annual') ? 'Annual subscription' : 'Monthly subscription')
                          : (p.id.includes('annual') ? 'Annual + usage at T−48h' : 'Monthly + usage at T−48h')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ padding: '20px 16px', color: colors.textSecondary, fontSize: '14px', verticalAlign: 'middle' }} />
                  {(planTab === 'individual' ? INDIVIDUAL_PLANS : BUSINESS_PLANS).map((p) => (
                    <td key={p.id} style={{ padding: '20px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          if (p.id === 'pay_per_trip') {
                            const payLink = import.meta.env.VITE_STRIPE_PAY_PER_TRIP_LINK;
                            if (payLink && auth.currentUser) {
                              const url = `${payLink}?client_reference_id=${auth.currentUser.uid}&prefilled_email=${encodeURIComponent(auth.currentUser.email)}`;
                              window.location.href = url;
                            } else {
                              navigate('/login?signup=true');
                            }
                          } else {
                            const link = import.meta.env[p.stripeEnvKey];
                            if (link) {
                              if (auth.currentUser) {
                                const url = `${link}?client_reference_id=${auth.currentUser.uid}&prefilled_email=${encodeURIComponent(auth.currentUser.email)}`;
                                window.location.href = url;
                              } else {
                                navigate('/login?redirect=/');
                              }
                            } else {
                              navigate('/login?signup=true');
                            }
                          }
                        }}
                        style={{
                          padding: '12px 24px',
                          fontSize: '14px',
                          fontWeight: '600',
                          backgroundColor: colors.primary,
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          width: '100%',
                          maxWidth: '180px',
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
                        {p.cta}
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            marginBottom: '28px',
          }}>
            {[
              { role: 'Trip Lead', quote: 'Finally one place for tasks, dates, and money.' },
              { role: 'Family Organizer', quote: 'Everyone can follow the plan without constant texts.' },
              { role: 'Ops Manager', quote: 'Team offsites are easier when ownership is visible.' },
            ].map((t) => (
              <div key={t.role} style={{
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.25)',
                backgroundColor: 'rgba(255,255,255,0.08)',
                textAlign: 'left',
              }}>
                <div style={{ color: 'white', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>{t.role}</div>
                <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>"{t.quote}"</div>
              </div>
            ))}
          </div>
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
          {['About', 'Features', 'Pricing', 'Blog', 'Affiliates', 'Privacy', 'Terms'].map((link) => (
            <a
              key={link}
              href={link === 'Features' ? '#features' : link === 'Pricing' ? '#pricing' : link === 'Blog' ? '/blog' : link === 'Terms' ? '/terms' : link === 'Privacy' ? '/privacy' : link === 'Affiliates' ? '/affiliates' : '#'}
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
