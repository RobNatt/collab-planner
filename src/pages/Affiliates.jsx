import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import toast from 'react-hot-toast';

function Affiliates() {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    legalName: '',
    phone: '',
    email: '',
    instagram: '',
    twitter: '',
    facebook: '',
    youtube: '',
    tiktok: '',
    linkedin: '',
    otherSocial: '',
  });

  useEffect(() => {
    if (auth.currentUser?.email) {
      setFormData((prev) => ({ ...prev, email: prev.email || auth.currentUser.email }));
    }
  }, [auth.currentUser?.email]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.legalName || !formData.phone || !formData.email) {
      toast.error('Please fill in legal name, phone, and email.');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'affiliateApplications'), {
        ...formData,
        userId: auth.currentUser?.uid || null,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      toast.success('Application submitted! We\'ll review and get back to you soon.');
      setFormData({
        legalName: '',
        phone: '',
        email: '',
        instagram: '',
        twitter: '',
        facebook: '',
        youtube: '',
        tiktok: '',
        linkedin: '',
        otherSocial: '',
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    backgroundColor: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: '8px',
    color: colors.text,
    outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background, transition: 'background-color 0.3s ease' }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        <div onClick={() => navigate('/')} style={{ fontSize: '24px', fontWeight: 'bold', color: colors.primary, cursor: 'pointer' }}>
          Travel Gang
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <ThemeToggle />
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 20px',
              backgroundColor: colors.backgroundTertiary,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            ← Back
          </button>
        </div>
      </nav>

      <section style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{ color: colors.text, fontSize: '32px', fontWeight: '800', marginBottom: '12px' }}>
          Travel Gang Affiliate Program
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
          Earn 20% on the first payment when a customer uses your link, and 5% recurring after 3 months from everyone who subscribes through you.
        </p>

        <div style={{
          padding: '20px',
          backgroundColor: `${colors.warning}15`,
          border: `1px solid ${colors.warning}40`,
          borderRadius: '12px',
          marginBottom: '32px',
        }}>
          <p style={{ color: colors.text, fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
            <strong>Terms:</strong> Affiliates are subject to disqualification for not meeting performance standards or for conduct that damages the reputation of Travel Gang. Approval is at our sole discretion.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{
          backgroundColor: colors.cardBg,
          padding: '32px',
          borderRadius: '16px',
          border: `1px solid ${colors.border}`,
          boxShadow: `0 4px 24px ${colors.shadow}`,
        }}>
          <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>
            Affiliate Application
          </h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: colors.textSecondary, fontWeight: '500' }}>
              Legal Name *
            </label>
            <input
              type="text"
              name="legalName"
              value={formData.legalName}
              onChange={handleChange}
              required
              placeholder="Full legal name"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: colors.textSecondary, fontWeight: '500' }}>
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+1 (555) 123-4567"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: colors.textSecondary, fontWeight: '500' }}>
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>

          <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: '600', marginBottom: '16px', marginTop: '28px' }}>
            Social Media Accounts
          </h3>
          <p style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '20px' }}>
            Provide all related social media profiles (URLs or handles). Leave blank if not applicable.
          </p>

          {[
            { name: 'instagram', label: 'Instagram', placeholder: '@username or URL' },
            { name: 'twitter', label: 'Twitter / X', placeholder: '@username or URL' },
            { name: 'facebook', label: 'Facebook', placeholder: 'Profile URL' },
            { name: 'youtube', label: 'YouTube', placeholder: 'Channel URL' },
            { name: 'tiktok', label: 'TikTok', placeholder: '@username or URL' },
            { name: 'linkedin', label: 'LinkedIn', placeholder: 'Profile URL' },
            { name: 'otherSocial', label: 'Other', placeholder: 'Blog, website, or other platforms' },
          ].map(({ name, label, placeholder }) => (
            <div key={name} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: colors.textSecondary, fontSize: '14px' }}>
                {label}
              </label>
              <input
                type="text"
                name={name}
                value={formData[name]}
                onChange={handleChange}
                placeholder={placeholder}
                style={inputStyle}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              marginTop: '24px',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '700',
              backgroundColor: submitting ? colors.textMuted : colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default Affiliates;
