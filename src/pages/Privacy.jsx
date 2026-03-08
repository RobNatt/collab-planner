import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';

function Privacy() {
  const navigate = useNavigate();
  const { colors } = useTheme();

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: '36px' }}>
      <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '700', marginBottom: '12px', paddingBottom: '8px', borderBottom: `1px solid ${colors.border}` }}>
        {title}
      </h2>
      <div style={{ color: colors.textSecondary, lineHeight: '1.8', fontSize: '15px' }}>
        {children}
      </div>
    </div>
  );

  const p = (text) => <p style={{ marginBottom: '12px' }}>{text}</p>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background, transition: 'background-color 0.3s ease' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', maxWidth: '1400px', margin: '0 auto' }}>
        <div onClick={() => navigate('/')} style={{ fontSize: '24px', fontWeight: 'bold', color: colors.primary, cursor: 'pointer' }}>
          Travel Gang
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <ThemeToggle />
          <button
            onClick={() => navigate(-1)}
            style={{ padding: '10px 20px', backgroundColor: colors.backgroundTertiary, color: colors.text, border: `1px solid ${colors.border}`, borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
          >
            ← Back
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 40px 80px' }}>
        <h1 style={{ color: colors.text, fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>
          Privacy Policy
        </h1>
        <p style={{ color: colors.textSecondary, marginBottom: '40px', fontSize: '14px' }}>
          Last updated: March 1, 2026
        </p>

        <div style={{ padding: '16px 20px', backgroundColor: `${colors.primary}10`, border: `1px solid ${colors.primary}30`, borderRadius: '8px', marginBottom: '36px' }}>
          <p style={{ color: colors.text, fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
            Your privacy matters to us. This policy explains what data we collect, how we use it, and your rights regarding your personal information. We do not sell your data to anyone, ever.
          </p>
        </div>

        <Section title="1. Who We Are">
          {p('Travel Gang is a collaborative trip planning service. When this policy refers to "we," "us," or "our," it means Travel Gang and its operators.')}
          {p('If you have questions about this Privacy Policy, please contact us through the feedback form within the app.')}
        </Section>

        <Section title="2. Information We Collect">
          <p style={{ marginBottom: '8px', fontWeight: '600', color: colors.text }}>Information you provide directly:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            {[
              'Email address (required for account creation)',
              'Display name and optional profile information (bio, avatar color, favorite destinations)',
              'Trip plans, tasks, activities, and expense data you create',
              'Comments and messages within plans',
              'Feedback, suggestions, and bug reports you submit',
            ].map((item, i) => <li key={i} style={{ marginBottom: '6px' }}>{item}</li>)}
          </ul>

          <p style={{ marginBottom: '8px', fontWeight: '600', color: colors.text }}>Information collected automatically:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            {[
              'Account creation date and last login timestamp',
              'Browser notification preferences (stored locally in your browser)',
              'Firebase Authentication metadata (login provider, account creation time)',
            ].map((item, i) => <li key={i} style={{ marginBottom: '6px' }}>{item}</li>)}
          </ul>

          <p style={{ marginBottom: '8px', fontWeight: '600', color: colors.text }}>Payment information:</p>
          {p('If you purchase a paid plan (subscription or one-time), your payment is processed by Stripe. We receive confirmation of your purchase and your email address, but we never see or store your credit card details. Stripe\'s privacy policy governs payment data.')}
        </Section>

        <Section title="3. How We Use Your Information">
          {p('We use the information we collect to:')}
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            {[
              'Create and maintain your account',
              'Provide and improve the Service',
              'Process payments and activate your license',
              'Send transactional emails (account verification, password reset)',
              'Notify you of new activity in your plans (with your permission)',
              'Respond to support requests and feedback',
              'Monitor for abuse and enforce our Terms of Service',
              'Understand how the Service is used to improve it',
            ].map((item, i) => <li key={i} style={{ marginBottom: '6px' }}>{item}</li>)}
          </ul>
          {p('We do not use your data for advertising, and we do not sell or rent your personal information to any third party.')}
        </Section>

        <Section title="4. Data Storage and Security">
          {p('Your data is stored in Google Firebase (Firestore), a secure cloud database infrastructure operated by Google. Data is encrypted in transit using TLS and at rest using AES-256 encryption.')}
          {p('Access to your data in Firestore is controlled by security rules that ensure users can only read and write their own data, or data for plans they are members of.')}
          {p('While we take reasonable security measures, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your data.')}
          {p('We retain your data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or business purposes.')}
        </Section>

        <Section title="5. Third-Party Services">
          {p('We use the following third-party services to operate Travel Gang:')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
            {[
              { name: 'Firebase (Google)', use: 'Authentication, database, and hosting infrastructure', link: 'https://policies.google.com/privacy' },
              { name: 'Stripe', use: 'Payment processing for all paid plans', link: 'https://stripe.com/privacy' },
              { name: 'Vercel', use: 'Web application hosting and deployment', link: 'https://vercel.com/legal/privacy-policy' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '12px 16px', backgroundColor: colors.backgroundTertiary, borderRadius: '8px' }}>
                <span style={{ fontWeight: '600', color: colors.text }}>{s.name}</span>
                <span style={{ color: colors.textSecondary }}> — {s.use}</span>
              </div>
            ))}
          </div>
          {p('Each of these services has their own privacy policies governing how they handle data. We encourage you to review them.')}
        </Section>

        <Section title="6. Cookies and Local Storage">
          {p('Travel Gang uses browser local storage (not traditional cookies) to store:')}
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            {[
              'Your theme preference (light/dark mode)',
              'Notification permission preferences',
              'Firebase Authentication session tokens',
            ].map((item, i) => <li key={i} style={{ marginBottom: '6px' }}>{item}</li>)}
          </ul>
          {p('We do not use advertising cookies or third-party tracking cookies. You can clear local storage at any time through your browser settings, though this will log you out and reset your preferences.')}
        </Section>

        <Section title="7. Sharing Your Information">
          {p('We do not sell, trade, or rent your personal information. We may share your data only in the following limited circumstances:')}
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            {[
              'With other members of a plan you have joined, to enable collaboration features',
              'With third-party service providers listed above, solely to operate the Service',
              'If required by law, court order, or governmental authority',
              'To protect the rights, property, or safety of Travel Gang or others',
              'In connection with a merger, acquisition, or sale of assets (you will be notified)',
            ].map((item, i) => <li key={i} style={{ marginBottom: '6px' }}>{item}</li>)}
          </ul>
        </Section>

        <Section title="8. Your Rights">
          {p('Depending on your location, you may have the following rights regarding your personal data:')}
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            {[
              'Access — request a copy of the personal data we hold about you',
              'Correction — request correction of inaccurate or incomplete data',
              'Deletion — request deletion of your personal data ("right to be forgotten")',
              'Portability — request your data in a structured, machine-readable format',
              'Objection — object to certain types of processing of your personal data',
              'Restriction — request that we restrict processing of your data',
            ].map((item, i) => <li key={i} style={{ marginBottom: '6px' }}>{item}</li>)}
          </ul>
          {p('To exercise any of these rights, contact us through the in-app feedback form. We will respond within 30 days.')}
          {p('You can update or delete your profile information at any time from the Profile page within the app. To delete your account entirely, contact us through the feedback form.')}
        </Section>

        <Section title="9. Children's Privacy">
          {p('Travel Gang is not directed at children under 13 years of age. We do not knowingly collect personal information from children under 13. If we learn we have collected information from a child under 13, we will delete it immediately.')}
          {p('If you are a parent or guardian and believe your child has provided us with personal information, please contact us through the feedback form.')}
        </Section>

        <Section title="10. International Data Transfers">
          {p('Travel Gang is operated from the United States. If you access the Service from outside the United States, your data may be transferred to and processed in the United States, where data protection laws may differ from your country.')}
          {p('By using the Service, you consent to the transfer of your information to the United States. We rely on Google Firebase\'s compliance with applicable data transfer frameworks for international data transfers.')}
        </Section>

        <Section title="11. California Privacy Rights (CCPA)">
          {p('If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):')}
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            {[
              'The right to know what personal information we collect and how it is used',
              'The right to delete your personal information',
              'The right to opt out of the sale of your personal information (we do not sell data)',
              'The right to non-discrimination for exercising your privacy rights',
            ].map((item, i) => <li key={i} style={{ marginBottom: '6px' }}>{item}</li>)}
          </ul>
          {p('To exercise your CCPA rights, contact us through the in-app feedback form.')}
        </Section>

        <Section title="12. Changes to This Policy">
          {p('We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice within the app or sending an email to your registered address.')}
          {p('Your continued use of the Service after changes to this policy constitutes your acceptance of the updated policy. We encourage you to review this policy periodically.')}
        </Section>

        <Section title="13. Contact Us">
          {p('If you have questions, concerns, or requests related to this Privacy Policy, please contact us through the Feedback page within the app. We take privacy concerns seriously and will respond promptly.')}
        </Section>

        <div style={{ padding: '20px', backgroundColor: colors.backgroundTertiary, borderRadius: '10px', marginTop: '20px' }}>
          <p style={{ color: colors.textMuted, fontSize: '13px', margin: 0, lineHeight: '1.6' }}>
            This Privacy Policy was last updated on March 1, 2026. By using Travel Gang, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Privacy;
