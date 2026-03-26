import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';

function Terms() {
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
          Collab Planner
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
          Terms of Service
        </h1>
        <p style={{ color: colors.textSecondary, marginBottom: '40px', fontSize: '14px' }}>
          Last updated: March 1, 2026
        </p>

        <div style={{ padding: '16px 20px', backgroundColor: `${colors.warning}15`, border: `1px solid ${colors.warning}40`, borderRadius: '8px', marginBottom: '36px' }}>
          <p style={{ color: colors.text, fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
            <strong>Please read these Terms of Service carefully before using Collab Planner.</strong> By accessing or using our service, you agree to be bound by these terms. If you do not agree, do not use the service.
          </p>
        </div>

        <Section title="1. Acceptance of Terms">
          {p('By creating an account, accessing, or using Collab Planner ("the Service"), you agree to be bound by these Terms of Service ("Terms"). These Terms apply to all visitors, users, and others who access the Service.')}
          {p('We reserve the right to update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms. We will notify users of material changes via email or an in-app notice.')}
        </Section>

        <Section title="2. Description of Service">
          {p('Collab Planner is a collaborative trip planning web application that allows users to create plans, manage tasks, track expenses, and coordinate with group members in real time.')}
          {p('The Service is provided "as is" and we reserve the right to modify, suspend, or discontinue any part of the Service at any time, with or without notice.')}
        </Section>

        <Section title="3. User Accounts">
          {p('You must provide accurate, complete, and current information when creating an account. You are responsible for maintaining the confidentiality of your account credentials.')}
          {p('You are solely responsible for all activity that occurs under your account. You must notify us immediately of any unauthorized use of your account.')}
          {p('You must be at least 13 years of age to use the Service. By using the Service, you represent that you meet this age requirement.')}
          {p('We reserve the right to suspend or terminate accounts that violate these Terms, are used for fraudulent activity, or remain inactive for extended periods.')}
        </Section>

        <Section title="4. Payments and Plans">
          {p('Collab Planner offers the following plans:')}
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li style={{ marginBottom: '6px' }}><strong>Free / Pay Per Trip:</strong> Sign up free. Pay-per-trip users pay $2 per trip at confirmation plus $1 per collaborator when they join.</li>
            <li style={{ marginBottom: '6px' }}><strong>Individual Monthly:</strong> $10/month, unlimited plans, $1 per collaborator when they join a trip.</li>
            <li style={{ marginBottom: '6px' }}><strong>Individual Annual:</strong> $100/year (2 months free), $1 per collaborator when they join a trip.</li>
            <li style={{ marginBottom: '6px' }}><strong>Business Monthly:</strong> $50/month, first 10 collaborators free, $2/month per additional collaborator.</li>
            <li style={{ marginBottom: '6px' }}><strong>Business Annual:</strong> $500/year (2 months free), first 10 collaborators free, $2/month per additional collaborator.</li>
            <li style={{ marginBottom: '6px' }}><strong>Lifetime Deal (LTD):</strong> $49 one-time, $1 per collaborator on all future trips, unlimited access to features.</li>
          </ul>
          {p('All payments are processed securely by Stripe. We do not store your payment card information.')}
          {p('Refund Policy: We offer a 14-day money-back guarantee on paid plan purchases. To request a refund, contact us within 14 days of purchase. No refunds will be issued after this period. Refunds are issued at our sole discretion.')}
          {p('"Lifetime" (for LTD) refers to the lifetime of the product, not your personal lifetime. Should the Service be discontinued, LTD holders will be given at least 90 days notice.')}
          {p('We reserve the right to modify pricing and available plans at any time. Existing subscribers and LTD holders will not be subject to new pricing for features available at the time of their purchase.')}
        </Section>

        <Section title="5. Free Tier Limitations">
          {p('Free tier users are limited to: 1 trip plan, up to 3 members per plan, and trips of up to 4 days in duration. These limits may change at our discretion with reasonable notice.')}
        </Section>

        <Section title="6. Acceptable Use">
          {p('You agree not to use the Service to:')}
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            {[
              'Violate any applicable law or regulation',
              'Infringe on the intellectual property rights of others',
              'Upload or transmit harmful, offensive, or illegal content',
              'Harass, abuse, or harm other users',
              'Attempt to gain unauthorized access to any part of the Service',
              'Use the Service to send spam or unsolicited messages',
              'Reverse engineer, decompile, or attempt to extract the source code of the Service',
              'Use automated scripts to collect data or interact with the Service',
            ].map((item, i) => (
              <li key={i} style={{ marginBottom: '6px' }}>{item}</li>
            ))}
          </ul>
          {p('Violation of these rules may result in immediate account termination without refund.')}
        </Section>

        <Section title="7. User Content">
          {p('You retain ownership of any content you submit to the Service, including trip plans, tasks, expenses, and comments ("User Content").')}
          {p('By submitting User Content, you grant us a non-exclusive, worldwide, royalty-free license to store, display, and process your content solely for the purpose of providing the Service.')}
          {p('You represent that you have the right to submit your User Content and that it does not violate any third-party rights. We are not responsible for any User Content and do not endorse any opinions expressed by users.')}
          {p('We reserve the right to remove any User Content that violates these Terms or that we deem inappropriate, without notice.')}
        </Section>

        <Section title="8. Privacy">
          {p('Your use of the Service is subject to our Privacy Policy, which is incorporated into these Terms by reference. By using the Service, you consent to the collection and use of your data as described in our Privacy Policy.')}
          {p('We use Firebase (Google) for authentication and data storage. Your data is stored securely and is not sold to third parties.')}
        </Section>

        <Section title="9. Intellectual Property">
          {p('The Service and its original content, features, and functionality are owned by Collab Planner and are protected by applicable intellectual property laws.')}
          {p('You may not copy, modify, distribute, sell, or lease any part of the Service or its software without our prior written consent.')}
        </Section>

        <Section title="10. Disclaimer of Warranties">
          {p('THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.')}
          {p('WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE. WE DO NOT WARRANT THAT ANY DEFECTS WILL BE CORRECTED OR THAT THE SERVICE IS FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.')}
          {p('YOUR USE OF THE SERVICE IS SOLELY AT YOUR OWN RISK.')}
        </Section>

        <Section title="11. Limitation of Liability">
          {p('TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL COLLAB PLANNER, ITS OPERATORS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES — INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES — ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.')}
          {p('OUR TOTAL CUMULATIVE LIABILITY TO YOU FOR ANY CLAIMS ARISING UNDER THESE TERMS SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO US IN THE 12 MONTHS PRIOR TO THE CLAIM, OR (B) $49 USD.')}
          {p('SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR LIMITATIONS ON LIABILITY. IN SUCH CASES, OUR LIABILITY WILL BE LIMITED TO THE FULLEST EXTENT PERMITTED BY LAW.')}
        </Section>

        <Section title="12. Indemnification">
          {p('You agree to defend, indemnify, and hold harmless Collab Planner and its operators from any claims, damages, obligations, losses, liabilities, costs, or expenses (including attorney\'s fees) arising from: (a) your use of the Service; (b) your User Content; (c) your violation of these Terms; or (d) your violation of any third-party rights.')}
        </Section>

        <Section title="13. Affiliate Program">
          {p('Collab Planner may offer an affiliate program. Affiliates earn 20% commission on the first payment when a customer uses their referral link, and 5% recurring commission after 3 months from customers who continue their subscription.')}
          {p('Affiliates are subject to disqualification for failing to meet performance standards or for conduct that damages the reputation of Collab Planner. Participation in the affiliate program is at our sole discretion.')}
          {p('Additional affiliate terms and conditions apply and will be provided upon approval of an affiliate application.')}
        </Section>

        <Section title="14. Third-Party Services">
          {p('The Service integrates with third-party services including Firebase (Google), Stripe, and Vercel. Your use of these services is subject to their respective terms and privacy policies. We are not responsible for the practices of any third-party services.')}
        </Section>

        <Section title="15. Termination">
          {p('We may terminate or suspend your account and access to the Service at our sole discretion, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.')}
          {p('You may terminate your account at any time by contacting us. Upon termination, your right to use the Service will immediately cease. Paid plan purchases are non-refundable after the 14-day refund window.')}
          {p('All provisions of these Terms which by their nature should survive termination — including ownership provisions, warranty disclaimers, indemnity, and limitations of liability — shall survive termination.')}
        </Section>

        <Section title="16. Governing Law and Disputes">
          {p('These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law provisions.')}
          {p('Any disputes arising out of or relating to these Terms or the Service shall first be attempted to be resolved through informal negotiation. If informal negotiation fails, disputes shall be resolved through binding arbitration in accordance with the American Arbitration Association rules.')}
          {p('You waive any right to participate in a class action lawsuit or class-wide arbitration.')}
        </Section>

        <Section title="17. Contact">
          {p('If you have questions about these Terms, please contact us through the feedback page within the app or via the contact information provided on our website.')}
        </Section>

        <div style={{ padding: '20px', backgroundColor: colors.backgroundTertiary, borderRadius: '10px', marginTop: '20px' }}>
          <p style={{ color: colors.textMuted, fontSize: '13px', margin: 0, lineHeight: '1.6' }}>
            These Terms of Service were last updated on March 1, 2026. By continuing to use Collab Planner after this date, you agree to the current Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Terms;
