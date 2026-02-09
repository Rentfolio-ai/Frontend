import React from 'react';
import { LegalPageLayout } from './LegalPageLayout';

const SECTIONS = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'data-we-collect', title: 'Data We Collect' },
  { id: 'how-we-use', title: 'How We Use Your Data' },
  { id: 'third-party', title: 'Third-Party Services' },
  { id: 'privacy-controls', title: 'Your Privacy Controls' },
  { id: 'data-retention', title: 'Data Retention & Deletion' },
  { id: 'data-security', title: 'Data Security' },
  { id: 'your-rights', title: 'Your Rights (GDPR / CCPA)' },
  { id: 'children', title: "Children's Privacy" },
  { id: 'changes', title: 'Changes to This Policy' },
  { id: 'contact', title: 'Contact Us' },
];

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack }) => {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated="February 7, 2026"
      sections={SECTIONS}
      onBack={onBack}
    >
      <h2 id="introduction">Introduction</h2>
      <p>
        Civitas AI (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates an AI-powered real estate
        investment analysis platform (&quot;the Service&quot;). This Privacy Policy explains how we
        collect, use, share, and protect your personal information when you use our website and
        services.
      </p>
      <p>
        By creating an account or using the Service, you agree to the collection and use of
        information in accordance with this policy. If you do not agree, please do not use the
        Service.
      </p>

      <h2 id="data-we-collect">Data We Collect</h2>

      <h3>Account Information</h3>
      <p>When you sign up, we collect:</p>
      <ul>
        <li>Your name and email address</li>
        <li>Authentication credentials (managed securely via Firebase Authentication)</li>
        <li>Subscription tier and billing information (processed by Stripe; we do not store full card numbers)</li>
      </ul>

      <h3>Usage Data</h3>
      <p>When you use the Service, we may collect:</p>
      <ul>
        <li><strong>Property searches and queries</strong> — the cities, addresses, and investment criteria you search for</li>
        <li><strong>Chat conversations</strong> — messages exchanged with our AI research and strategist agents</li>
        <li><strong>Generated reports</strong> — investment reports and analyses created for you</li>
        <li><strong>Feature usage metrics</strong> — which tools you use, how often, and in what modes (research, strategist, hunter)</li>
      </ul>

      <h3>Technical Data</h3>
      <ul>
        <li>Device information (browser type, operating system)</li>
        <li>IP address and approximate location (used for session management)</li>
        <li>Session identifiers and login timestamps</li>
      </ul>

      <h2 id="how-we-use">How We Use Your Data</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li><strong>Provide AI analysis</strong> — your queries and property data are sent to AI models to generate personalized investment insights</li>
        <li><strong>Personalize your experience</strong> — remembering your preferred markets, strategies, and conversation history</li>
        <li><strong>Process payments</strong> — managing your subscription through Stripe</li>
        <li><strong>Enforce usage limits</strong> — tracking analyses and reports against your plan allowances</li>
        <li><strong>Improve the Service</strong> — aggregated, anonymized usage patterns help us improve features (only if you have analytics enabled)</li>
        <li><strong>Security</strong> — detecting fraud, abuse, and unauthorized access</li>
        <li><strong>Communications</strong> — sending essential account notifications (password resets, subscription changes)</li>
      </ul>

      <h2 id="third-party">Third-Party Services</h2>
      <p>We use the following third-party services that may process your data:</p>
      <ul>
        <li>
          <strong>Stripe</strong> — payment processing. Stripe collects and processes your payment
          information under their own{' '}
          <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
          We receive only a limited token, your subscription status, and the last four digits of your card.
        </li>
        <li>
          <strong>Firebase (Google)</strong> — authentication and identity management. Firebase
          processes your email and auth tokens under{' '}
          <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">Google&apos;s Privacy Policy</a>.
        </li>
        <li>
          <strong>OpenAI &amp; Anthropic</strong> — AI model providers. Your queries and property data
          are sent to these providers to generate analysis. Both providers have data processing
          agreements and do not use API data for model training. If you enable the &quot;Model
          Training Opt-Out&quot; toggle, we will not persist your conversation data.
        </li>
        <li>
          <strong>Redis</strong> — temporary in-memory storage for conversation context (auto-expires
          after 24 hours).
        </li>
      </ul>

      <h2 id="privacy-controls">Your Privacy Controls</h2>
      <p>
        We provide granular privacy controls in your account settings (Privacy &amp; Security page).
        You can toggle each of the following at any time:
      </p>
      <ul>
        <li>
          <strong>Chat History</strong> — when disabled, your conversations are not saved between
          sessions. Each message is treated as a fresh conversation with no memory of previous
          exchanges.
        </li>
        <li>
          <strong>Analytics</strong> — when disabled, we do not record usage events (property
          analyses, report generation) in our analytics tracking system.
        </li>
        <li>
          <strong>Model Training Opt-Out</strong> — when enabled, your conversation content is not
          stored persistently in any form. Queries are processed ephemerally and discarded after
          the response is delivered.
        </li>
        <li>
          <strong>Online Status</strong> — when disabled, your IP address and location are not
          stored in session records, and are not visible in the active sessions list.
        </li>
      </ul>

      <h2 id="data-retention">Data Retention &amp; Deletion</h2>
      <ul>
        <li><strong>Conversation memory</strong> — stored in Redis with a 24-hour TTL. Automatically deleted after expiry.</li>
        <li><strong>Usage tracking records</strong> — retained for billing cycle calculations. Anonymized after 12 months.</li>
        <li><strong>Generated reports</strong> — retained until you delete them or delete your account.</li>
        <li><strong>Account data</strong> — retained as long as your account is active.</li>
      </ul>
      <p>
        You can <strong>delete your account immediately</strong> from the Privacy &amp; Security
        settings. This permanently removes all your data including your profile, conversations,
        reports, usage history, sessions, and preferences. This action is irreversible.
      </p>
      <p>
        You can also <strong>export all your data</strong> at any time via the Data Export feature
        in Privacy &amp; Security settings.
      </p>

      <h2 id="data-security">Data Security</h2>
      <p>We implement appropriate technical and organizational measures to protect your data:</p>
      <ul>
        <li>All data is transmitted over HTTPS/TLS encryption</li>
        <li>Authentication tokens are securely managed via Firebase</li>
        <li>Payment data is handled entirely by Stripe (PCI-DSS compliant)</li>
        <li>Database access is restricted and requires authentication</li>
        <li>API endpoints are protected by rate limiting and API key verification</li>
        <li>Sensitive error details are never exposed to clients</li>
      </ul>

      <h2 id="your-rights">Your Rights (GDPR / CCPA)</h2>
      <p>Depending on your jurisdiction, you may have the following rights:</p>
      <ul>
        <li><strong>Right to Access</strong> — request a copy of all personal data we hold about you (available via Data Export)</li>
        <li><strong>Right to Rectification</strong> — update your personal information via your profile settings</li>
        <li><strong>Right to Erasure</strong> — delete your account and all associated data (available via account deletion)</li>
        <li><strong>Right to Data Portability</strong> — export your data in a structured format (available via Data Export)</li>
        <li><strong>Right to Restrict Processing</strong> — disable analytics and chat history via privacy toggles</li>
        <li><strong>Right to Object</strong> — opt out of model training via the Model Training Opt-Out toggle</li>
        <li><strong>Right to Non-Discrimination</strong> — we will not treat you differently for exercising your privacy rights</li>
      </ul>
      <p>
        <strong>California Residents (CCPA):</strong> We do not sell your personal information. You
        have the right to know what data we collect, request deletion, and opt out of any data
        sharing. All of these are available through your account settings.
      </p>

      <h2 id="children">Children&apos;s Privacy</h2>
      <p>
        The Service is not intended for anyone under the age of 18. We do not knowingly collect
        personal information from children. If you believe a child has provided us with personal
        data, please contact us and we will promptly delete it.
      </p>

      <h2 id="changes">Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of significant
        changes by posting the updated policy on this page and updating the &quot;Last updated&quot;
        date. Continued use of the Service after changes constitutes acceptance of the revised policy.
      </p>

      <h2 id="contact">Contact Us</h2>
      <p>If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at:</p>
      <ul>
        <li><strong>Email:</strong> privacy@civitas.ai</li>
      </ul>
    </LegalPageLayout>
  );
};
