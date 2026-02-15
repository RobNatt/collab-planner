import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useUserProfile } from '../hooks/useUserProfile';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { Skeleton, SkeletonText } from '../components/Skeleton';
import toast from 'react-hot-toast';

const AVATAR_COLORS = [
  '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#f44336',
  '#00BCD4', '#E91E63', '#673AB7', '#3F51B5', '#009688',
  '#FF5722', '#795548', '#607D8B', '#8BC34A', '#FFC107',
];

function Profile() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const { profile, loading } = useUserProfile(auth.currentUser?.uid, refreshKey);
  const { colors } = useTheme();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
    bio: '',
    avatarColor: '#2196F3',
    favoriteDestinations: '',
  });

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        phoneNumber: profile.phoneNumber || '',
        bio: profile.bio || '',
        avatarColor: profile.avatarColor || '#2196F3',
        favoriteDestinations: profile.favoriteDestinations || '',
      });
    }
  }, [profile]);

  // Fetch user's trips
  useEffect(() => {
    const fetchTrips = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, 'plans'),
          where('members', 'array-contains', auth.currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const tripsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTrips(tripsData);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setTripsLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const handleSave = async () => {
    if (!formData.displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        displayName: formData.displayName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        bio: formData.bio.trim(),
        avatarColor: formData.avatarColor,
        favoriteDestinations: formData.favoriteDestinations.trim(),
        updatedAt: new Date(),
      });
      toast.success('Profile updated!');
      setEditing(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const pastTrips = trips.filter(t => t.endDate < today && !t.archived);
  const activeTrips = trips.filter(t => t.startDate <= today && t.endDate >= today);
  const upcomingTrips = trips.filter(t => t.startDate > today);
  const archivedTrips = trips.filter(t => t.archived);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        display: 'flex',
        justifyContent: 'center',
        padding: '20px',
        transition: 'background-color 0.3s ease',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '800px',
          padding: '40px',
        }}>
          <Skeleton width="120px" height="120px" borderRadius="50%" style={{ margin: '0 auto 20px' }} />
          <Skeleton width="200px" height="32px" style={{ margin: '0 auto 12px' }} />
          <SkeletonText lines={4} />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      padding: '20px',
      transition: 'background-color 0.3s ease',
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: colors.backgroundTertiary,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.border;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.backgroundTertiary;
            }}
          >
            ← Dashboard
          </button>
          <ThemeToggle />
        </div>

        {/* Profile Card */}
        <div
          className="animate-fadeIn"
          style={{
            backgroundColor: colors.cardBg,
            borderRadius: '16px',
            boxShadow: `0 4px 24px ${colors.shadow}`,
            overflow: 'hidden',
            marginBottom: '24px',
          }}
        >
          {/* Banner */}
          <div style={{
            height: '120px',
            background: `linear-gradient(135deg, ${formData.avatarColor}, ${formData.avatarColor}88)`,
            position: 'relative',
          }} />

          {/* Avatar & Info */}
          <div style={{
            padding: '0 32px 32px',
            marginTop: '-50px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '20px',
              marginBottom: '24px',
              flexWrap: 'wrap',
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: formData.avatarColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '36px',
                fontWeight: 'bold',
                border: `4px solid ${colors.cardBg}`,
                boxShadow: `0 2px 12px ${colors.shadow}`,
                flexShrink: 0,
              }}>
                {getInitials(profile?.displayName)}
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h1 style={{
                  margin: '0 0 4px 0',
                  color: colors.text,
                  fontSize: '24px',
                }}>
                  {profile?.displayName || 'Unknown User'}
                </h1>
                <p style={{
                  margin: 0,
                  color: colors.textMuted,
                  fontSize: '14px',
                }}>
                  {auth.currentUser?.email}
                </p>
              </div>
              <button
                onClick={() => setEditing(!editing)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: editing ? colors.textMuted : colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {/* Profile Details or Edit Form */}
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Avatar Color Picker */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: colors.text,
                    fontSize: '14px',
                  }}>
                    Avatar Color
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {AVATAR_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setFormData({ ...formData, avatarColor: color })}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: color,
                          border: formData.avatarColor === color
                            ? '3px solid white'
                            : '2px solid transparent',
                          boxShadow: formData.avatarColor === color
                            ? `0 0 0 2px ${color}`
                            : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Display Name */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: colors.text,
                    fontSize: '14px',
                  }}>
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: `1px solid ${colors.inputBorder}`,
                      backgroundColor: colors.inputBg,
                      color: colors.text,
                      fontSize: '15px',
                      outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = colors.primary}
                    onBlur={(e) => e.target.style.borderColor = colors.inputBorder}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: colors.text,
                    fontSize: '14px',
                  }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="(555) 123-4567"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: `1px solid ${colors.inputBorder}`,
                      backgroundColor: colors.inputBg,
                      color: colors.text,
                      fontSize: '15px',
                      outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = colors.primary}
                    onBlur={(e) => e.target.style.borderColor = colors.inputBorder}
                  />
                </div>

                {/* Bio */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: colors.text,
                    fontSize: '14px',
                  }}>
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell your trip partners a bit about yourself..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: `1px solid ${colors.inputBorder}`,
                      backgroundColor: colors.inputBg,
                      color: colors.text,
                      fontSize: '15px',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                    }}
                    onFocus={(e) => e.target.style.borderColor = colors.primary}
                    onBlur={(e) => e.target.style.borderColor = colors.inputBorder}
                  />
                </div>

                {/* Favorite Destinations */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: colors.text,
                    fontSize: '14px',
                  }}>
                    Favorite Destinations
                  </label>
                  <input
                    type="text"
                    value={formData.favoriteDestinations}
                    onChange={(e) => setFormData({ ...formData, favoriteDestinations: e.target.value })}
                    placeholder="e.g., Paris, Tokyo, New York"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: `1px solid ${colors.inputBorder}`,
                      backgroundColor: colors.inputBg,
                      color: colors.text,
                      fontSize: '15px',
                      outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = colors.primary}
                    onBlur={(e) => e.target.style.borderColor = colors.inputBorder}
                  />
                  <small style={{ color: colors.textMuted, fontSize: '12px' }}>
                    Separate with commas
                  </small>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '14px 28px',
                    backgroundColor: saving ? colors.textMuted : colors.success,
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {saving ? (
                    <>
                      <div style={{
                        width: 16,
                        height: 16,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Bio */}
                {profile?.bio && (
                  <div style={{
                    padding: '16px',
                    backgroundColor: colors.backgroundTertiary,
                    borderRadius: '12px',
                  }}>
                    <p style={{
                      margin: 0,
                      color: colors.textSecondary,
                      fontSize: '15px',
                      lineHeight: '1.6',
                    }}>
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* Contact & Details */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                }}>
                  {profile?.phoneNumber && (
                    <div style={{
                      padding: '14px 16px',
                      backgroundColor: colors.backgroundTertiary,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}>
                      <span style={{ fontSize: '18px' }}>📱</span>
                      <div>
                        <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>Phone</div>
                        <a href={`tel:${profile.phoneNumber}`} style={{ color: colors.primary, textDecoration: 'none', fontSize: '14px' }}>
                          {profile.phoneNumber}
                        </a>
                      </div>
                    </div>
                  )}
                  <div style={{
                    padding: '14px 16px',
                    backgroundColor: colors.backgroundTertiary,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    <span style={{ fontSize: '18px' }}>📧</span>
                    <div>
                      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>Email</div>
                      <span style={{ color: colors.text, fontSize: '14px' }}>{auth.currentUser?.email}</span>
                    </div>
                  </div>
                  <div style={{
                    padding: '14px 16px',
                    backgroundColor: colors.backgroundTertiary,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    <span style={{ fontSize: '18px' }}>📅</span>
                    <div>
                      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>Member Since</div>
                      <span style={{ color: colors.text, fontSize: '14px' }}>
                        {profile?.createdAt?.toDate
                          ? profile.createdAt.toDate().toLocaleDateString()
                          : new Date(profile?.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Favorite Destinations */}
                {profile?.favoriteDestinations && (
                  <div>
                    <h4 style={{ color: colors.text, margin: '0 0 10px 0', fontSize: '14px' }}>
                      Favorite Destinations
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {profile.favoriteDestinations.split(',').map((dest, i) => (
                        <span key={i} style={{
                          padding: '6px 14px',
                          backgroundColor: `${colors.primary}15`,
                          color: colors.primary,
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '500',
                          border: `1px solid ${colors.primary}30`,
                        }}>
                          {dest.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}>
          {[
            { label: 'Total Trips', value: trips.length, icon: '🗺️', color: colors.primary },
            { label: 'Active', value: activeTrips.length, icon: '🟢', color: colors.success },
            { label: 'Upcoming', value: upcomingTrips.length, icon: '📅', color: colors.warning },
            { label: 'Completed', value: pastTrips.length + archivedTrips.length, icon: '✅', color: colors.textMuted },
          ].map((stat, i) => (
            <div
              key={i}
              className="animate-fadeIn"
              style={{
                padding: '20px',
                backgroundColor: colors.cardBg,
                borderRadius: '12px',
                boxShadow: `0 2px 8px ${colors.shadow}`,
                textAlign: 'center',
                border: `1px solid ${colors.border}`,
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Trip History */}
        <div
          className="animate-fadeIn"
          style={{
            backgroundColor: colors.cardBg,
            borderRadius: '16px',
            boxShadow: `0 4px 24px ${colors.shadow}`,
            overflow: 'hidden',
          }}
        >
          <div style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${colors.border}`,
          }}>
            <h2 style={{ margin: 0, color: colors.text, fontSize: '18px' }}>
              Trip History
            </h2>
          </div>

          {tripsLoading ? (
            <div style={{ padding: '24px' }}>
              <SkeletonText lines={3} />
            </div>
          ) : trips.length === 0 ? (
            <div style={{
              padding: '40px 24px',
              textAlign: 'center',
              color: colors.textMuted,
            }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🗺️</div>
              <p style={{ margin: 0 }}>No trips yet. Start planning your first adventure!</p>
            </div>
          ) : (
            <div>
              {trips
                .sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''))
                .map((trip) => {
                  const isActive = trip.startDate <= today && trip.endDate >= today;
                  const isPast = trip.endDate < today;
                  const isUpcoming = trip.startDate > today;

                  return (
                    <div
                      key={trip.id}
                      onClick={() => navigate(`/plan/${trip.id}`)}
                      style={{
                        padding: '16px 24px',
                        borderBottom: `1px solid ${colors.border}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        gap: '12px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.backgroundTertiary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          marginBottom: '4px',
                        }}>
                          <span style={{
                            fontWeight: '600',
                            color: colors.text,
                            fontSize: '15px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {trip.name}
                          </span>
                          {isActive && (
                            <span style={{
                              padding: '2px 8px',
                              backgroundColor: colors.success,
                              color: 'white',
                              borderRadius: '10px',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              flexShrink: 0,
                            }}>ACTIVE</span>
                          )}
                          {isUpcoming && (
                            <span style={{
                              padding: '2px 8px',
                              backgroundColor: colors.primary,
                              color: 'white',
                              borderRadius: '10px',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              flexShrink: 0,
                            }}>UPCOMING</span>
                          )}
                          {isPast && !trip.archived && (
                            <span style={{
                              padding: '2px 8px',
                              backgroundColor: colors.textMuted,
                              color: 'white',
                              borderRadius: '10px',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              flexShrink: 0,
                            }}>PAST</span>
                          )}
                          {trip.archived && (
                            <span style={{
                              padding: '2px 8px',
                              backgroundColor: colors.warning,
                              color: 'white',
                              borderRadius: '10px',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              flexShrink: 0,
                            }}>ARCHIVED</span>
                          )}
                          {trip.admin === auth.currentUser.uid && (
                            <span style={{
                              padding: '2px 8px',
                              backgroundColor: colors.successLight,
                              color: colors.success,
                              borderRadius: '10px',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              flexShrink: 0,
                            }}>ADMIN</span>
                          )}
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: '16px',
                          color: colors.textMuted,
                          fontSize: '13px',
                        }}>
                          <span>📅 {trip.startDate} to {trip.endDate}</span>
                          <span>👥 {trip.members?.length || 1}</span>
                        </div>
                      </div>
                      <span style={{ color: colors.textMuted, fontSize: '18px' }}>→</span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
