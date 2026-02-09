import React from 'react';
import { LegalPageLayout } from './LegalPageLayout';

const SECTIONS = [
  { id: 'acceptance', title: 'Acceptance of Terms' },
  { id: 'service-description', title: 'Service Description' },
  { id: 'accounts', title: 'Accounts & Registration' },
  { id: 'subscriptions', title: 'Subscriptions & Billing' },
  { id: 'ai-disclaimer', title: 'AI Disclaimer' },
  { id: 'acceptable-use', title: 'Acceptable Use' },
  { id: 'intellectual-property', title: 'Intellectual Property' },
  { id: 'user-content', title: 'User Content' },
  { id: 'termination', title: 'Termination' },
  { id: 'limitation', title: 'Limitation of Liability' },
  { id: 'indemnification', title: 'Indemnification' },
  { id: 'governing-law', title: 'Governing Law' },
  { id: 'changes', title: 'Changes to These Terms' },
  { id: 'contact', title: 'Contact Us' },
];

interface TermsOfServicePageProps {
  onBack: () => void;
}

export const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onBack }) => {
  return (
    <LegalPageLayout
      title="Terms of Service"
      lastUpdated="February 7, 2026"
      sections={SECTIONS}
      onBack={onBack}
    >
      <h2 id="acceptance">Acceptance of Terms</h2>
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Civitas AI
        platform (&quot;the Service&quot;), operated by Civitas AI (&quot;we,&quot; &quot;us,&quot;
        or &quot;our&quot;). By creating an account, accessing, or using the Service, you agree to
        be bound by these Terms.
      </p>
      <p>
        If you do not agree to these Terms, you may not use the Service. We reserve the right to
        refuse service to anyone for any reason at any time.
      </p>

      <h2 id="service-description">Service Description</h2>
      <p>
        Civitas AI is an AI-powered real estate investment analysis platform that provides:
      </p>
      <ul>
        <li>Property search and market research via conversational AI agents</li>
        <li>Investment analysis including valuation, cap rate, cash-on-cash return, and operating expense estimates</li>
        <li>Strategy-specific insights for Short-Term Rentals, Long-Term Rentals, BRRRR, and Flip strategies</li>
        <li>AI-generated investment reports and strategy briefs</li>
        <li>Portfolio monitoring and watchlist tracking (Pro plan)</li>
        <li>Deal pipeline automation (Pro plan)</li>
      </ul>

      <h2 id="accounts">Accounts &amp; Registration</h2>
      <p>To use the Service, you must:</p>
      <ul>
        <li>Be at least 18 years old</li>
        <li>Provide accurate and complete registration information</li>
        <li>Maintain the security of your account credentials</li>
        <li>Notify us immediately of any unauthorized access to your account</li>
      </ul>
      <p>
        You are responsible for all activity that occurs under your account. We reserve the right
        to suspend or terminate accounts that violate these Terms.
      </p>

      <h2 id="subscriptions">Subscriptions &amp; Billing</h2>
      <h3>Plans</h3>
      <p>The Service is offered in the following tiers:</p>
      <ul>
        <li><strong>Free</strong> — limited to 2 property analyses per month, 2 reports per month, and up to 10 watchlist properties</li>
        <li><strong>Pro</strong> — unlimited analyses and reports, up to 100 watchlist properties, access to deal pipeline, portfolio monitoring, and deep reasoning</li>
      </ul>

      <h3>Payment</h3>
      <ul>
        <li>Pro subscriptions are billed monthly via Stripe</li>
        <li>All fees are non-refundable except as required by applicable law</li>
        <li>We may offer promotional pricing (e.g., first-month discounts) at our discretion</li>
        <li>You authorize us to charge your payment method on file for recurring subscription fees</li>
      </ul>

      <h3>Cancellation</h3>
      <p>
        You may cancel your Pro subscription at any time from your account settings. Upon
        cancellation, you will retain Pro access until the end of your current billing period, after
        which your account will revert to the Free tier.
      </p>

      <h2 id="ai-disclaimer">AI Disclaimer</h2>
      <p>
        <strong>
          The Service uses artificial intelligence to generate analysis and insights. This output is
          for informational and educational purposes only and does NOT constitute:
        </strong>
      </p>
      <ul>
        <li>Financial advice</li>
        <li>Legal advice</li>
        <li>Tax advice</li>
        <li>A guarantee of investment performance</li>
        <li>A substitute for professional due diligence</li>
      </ul>
      <p>
        AI-generated content may contain errors, inaccuracies, or outdated information. Property
        valuations, rental estimates, and market projections are approximations based on available
        data and should not be the sole basis for investment decisions. Always consult qualified
        professionals (real estate agents, attorneys, accountants, financial advisors) before making
        investment decisions.
      </p>
      <p>
        <strong>
          We expressly disclaim all liability for investment decisions made based on information
          provided by the Service.
        </strong>
      </p>

      <h2 id="acceptable-use">Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for any illegal purpose or in violation of any applicable law</li>
        <li>Attempt to reverse-engineer, decompile, or extract source code from the Service</li>
        <li>Scrape, crawl, or use automated tools to extract data from the Service at scale</li>
        <li>Resell, redistribute, or commercially exploit AI-generated outputs without permission</li>
        <li>Attempt to circumvent usage limits, rate limits, or subscription restrictions</li>
        <li>Interfere with or disrupt the Service or its infrastructure</li>
        <li>Impersonate another person or misrepresent your affiliation</li>
        <li>Upload malicious code, viruses, or harmful content</li>
      </ul>

      <h2 id="intellectual-property">Intellectual Property</h2>
      <p>
        The Service, including its design, code, algorithms, AI models, branding, and documentation,
        is owned by Civitas AI and protected by intellectual property laws. You may not copy,
        modify, distribute, or create derivative works from the Service without our express written
        permission.
      </p>
      <p>
        &quot;Civitas AI,&quot; &quot;Vasthu,&quot; and associated logos are trademarks of Civitas AI.
      </p>

      <h2 id="user-content">User Content</h2>
      <p>
        You retain ownership of the data you provide to the Service (queries, property information,
        preferences). By using the Service, you grant us a limited license to process this data
        solely for the purpose of providing the Service to you.
      </p>
      <p>
        AI-generated reports, analyses, and insights produced by the Service are provided for your
        personal and professional use. You may use, share, and reference these outputs in your
        investment activities.
      </p>

      <h2 id="termination">Termination</h2>
      <p>
        You may delete your account at any time through the Privacy &amp; Security settings. Account
        deletion permanently removes all your data.
      </p>
      <p>
        We may suspend or terminate your account if you violate these Terms, engage in abusive
        behavior, or if required by law. We will provide reasonable notice when possible.
      </p>

      <h2 id="limitation">Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, CIVITAS AI AND ITS OFFICERS, DIRECTORS, EMPLOYEES,
        AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
        PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR INVESTMENT
        OPPORTUNITIES, ARISING FROM YOUR USE OF THE SERVICE.
      </p>
      <p>
        OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM THESE TERMS OR THE SERVICE SHALL NOT EXCEED
        THE AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
      </p>

      <h2 id="indemnification">Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless Civitas AI from any claims, damages, losses, or
        expenses (including reasonable attorney fees) arising from your use of the Service, your
        violation of these Terms, or your violation of any third-party rights.
      </p>

      <h2 id="governing-law">Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the laws of the State of
        Delaware, United States, without regard to conflict of law provisions. Any disputes arising
        from these Terms shall be resolved in the state or federal courts located in Delaware.
      </p>

      <h2 id="changes">Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. We will notify you of material changes by
        posting the updated Terms on this page and updating the &quot;Last updated&quot; date. Your
        continued use of the Service after changes constitutes acceptance of the revised Terms.
      </p>

      <h2 id="contact">Contact Us</h2>
      <p>If you have questions about these Terms of Service, please contact us at:</p>
      <ul>
        <li><strong>Email:</strong> legal@civitas.ai</li>
      </ul>
    </LegalPageLayout>
  );
};
