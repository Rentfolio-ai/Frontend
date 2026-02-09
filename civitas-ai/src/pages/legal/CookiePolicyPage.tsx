import React from 'react';
import { LegalPageLayout } from './LegalPageLayout';

const SECTIONS = [
  { id: 'what-are-cookies', title: 'What Are Cookies?' },
  { id: 'how-we-use', title: 'How We Use Cookies' },
  { id: 'essential', title: 'Essential Cookies' },
  { id: 'functional', title: 'Functional Cookies' },
  { id: 'analytics', title: 'Analytics Cookies' },
  { id: 'third-party', title: 'Third-Party Cookies' },
  { id: 'local-storage', title: 'Local Storage & Session Storage' },
  { id: 'managing', title: 'Managing Cookies' },
  { id: 'changes', title: 'Changes to This Policy' },
  { id: 'contact', title: 'Contact Us' },
];

interface CookiePolicyPageProps {
  onBack: () => void;
}

export const CookiePolicyPage: React.FC<CookiePolicyPageProps> = ({ onBack }) => {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      lastUpdated="February 7, 2026"
      sections={SECTIONS}
      onBack={onBack}
    >
      <h2 id="what-are-cookies">What Are Cookies?</h2>
      <p>
        Cookies are small text files stored on your device by your web browser when you visit a
        website. They are widely used to make websites work efficiently and to provide information
        to the owners of the site. Similar technologies include local storage and session storage.
      </p>
      <p>
        This policy explains what cookies and similar technologies Civitas AI (&quot;we,&quot;
        &quot;us,&quot; or &quot;our&quot;) uses, why we use them, and how you can manage them.
      </p>

      <h2 id="how-we-use">How We Use Cookies</h2>
      <p>We use cookies and similar technologies for the following purposes:</p>
      <ul>
        <li><strong>Authentication</strong> — keeping you signed in across sessions</li>
        <li><strong>Preferences</strong> — remembering your settings and customizations</li>
        <li><strong>Functionality</strong> — enabling core features like conversation memory</li>
        <li><strong>Security</strong> — protecting against unauthorized access</li>
      </ul>

      <h2 id="essential">Essential Cookies</h2>
      <p>
        These are required for the Service to function and cannot be disabled. They include:
      </p>
      <ul>
        <li>
          <strong>Authentication token</strong> (<code>civitas-token</code>) — stores your session
          token so you remain signed in. Without this, you would need to log in on every page load.
        </li>
        <li>
          <strong>User data</strong> (<code>civitas-user</code>) — stores basic profile information
          (name, email, user ID) for displaying your account in the interface.
        </li>
      </ul>

      <h2 id="functional">Functional Cookies</h2>
      <p>
        These cookies enhance your experience by remembering choices you make:
      </p>
      <ul>
        <li>
          <strong>Theme &amp; UI preferences</strong> — stores your chosen theme, sidebar state, and
          display settings
        </li>
        <li>
          <strong>Investment preferences</strong> — stores your preferred markets, strategies, and
          budget ranges for personalized suggestions
        </li>
        <li>
          <strong>Recent session data</strong> (<code>civitas-recent-*</code>) — enables the
          &quot;resume session&quot; feature after a soft logout (auto-expires after 24 hours)
        </li>
      </ul>

      <h2 id="analytics">Analytics Cookies</h2>
      <p>
        If you have <strong>Analytics</strong> enabled in your privacy settings, we may collect
        anonymized usage metrics to understand how the Service is used and to improve features.
        These include:
      </p>
      <ul>
        <li>Pages visited and features used</li>
        <li>Aggregate usage patterns (not tied to individual identity)</li>
      </ul>
      <p>
        You can disable analytics tracking at any time from <strong>Settings &rarr; Privacy &amp;
        Security &rarr; Analytics</strong>. When disabled, no analytics cookies are set.
      </p>

      <h2 id="third-party">Third-Party Cookies</h2>
      <p>Some third-party services we integrate may set their own cookies:</p>
      <ul>
        <li>
          <strong>Stripe</strong> — our payment processor may set cookies during the checkout flow
          for fraud prevention and payment processing. See{' '}
          <a href="https://stripe.com/cookie-settings" target="_blank" rel="noopener noreferrer">
            Stripe&apos;s Cookie Policy
          </a>.
        </li>
        <li>
          <strong>Firebase (Google)</strong> — our authentication provider may set cookies for
          session management and security. See{' '}
          <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer">
            Google&apos;s Cookie Policy
          </a>.
        </li>
      </ul>
      <p>
        We do not control third-party cookies. Please refer to each provider&apos;s privacy and
        cookie policies for details on how they use cookies.
      </p>

      <h2 id="local-storage">Local Storage &amp; Session Storage</h2>
      <p>
        In addition to cookies, we use browser local storage and session storage for similar
        purposes. These technologies store data directly in your browser and do not expire
        automatically like cookies (unless explicitly cleared).
      </p>
      <p>Data we store includes:</p>
      <ul>
        <li><strong>Authentication tokens</strong> — in localStorage (persistent) or sessionStorage (per-tab)</li>
        <li><strong>User profile cache</strong> — for fast loading without additional API calls</li>
        <li><strong>UI state</strong> — sidebar position, active tab, scroll positions</li>
      </ul>
      <p>
        You can clear all local storage data by using the &quot;Clear site data&quot; option in your
        browser&apos;s developer tools (Application tab).
      </p>

      <h2 id="managing">Managing Cookies</h2>
      <p>You can manage cookies in several ways:</p>
      <ul>
        <li>
          <strong>Privacy controls in the app</strong> — toggle Analytics off in Settings &rarr;
          Privacy &amp; Security to prevent analytics-related cookies
        </li>
        <li>
          <strong>Browser settings</strong> — most browsers allow you to block or delete cookies.
          Note that blocking essential cookies will prevent you from using the Service.
        </li>
        <li>
          <strong>Sign out</strong> — signing out clears your authentication tokens
        </li>
        <li>
          <strong>Delete account</strong> — deleting your account removes all server-side data.
          Clear browser storage to remove client-side data.
        </li>
      </ul>

      <h2 id="changes">Changes to This Policy</h2>
      <p>
        We may update this Cookie Policy from time to time to reflect changes in the cookies we use
        or for other operational, legal, or regulatory reasons. We will post the updated policy on
        this page with a revised &quot;Last updated&quot; date.
      </p>

      <h2 id="contact">Contact Us</h2>
      <p>If you have questions about our use of cookies, please contact us at:</p>
      <ul>
        <li><strong>Email:</strong> privacy@civitas.ai</li>
      </ul>
    </LegalPageLayout>
  );
};
