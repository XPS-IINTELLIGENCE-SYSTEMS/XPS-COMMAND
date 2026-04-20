import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Privacy Policy</h1>
            <p className="text-xs text-muted-foreground">Last updated: April 19, 2026</p>
          </div>
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-foreground/80">
          <section>
            <h2 className="text-lg font-bold text-foreground">1. Introduction</h2>
            <p>Xtreme Polishing Systems ("XPS," "we," "us," or "our") operates the XPS Intelligence Platform (the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">2. Information We Collect</h2>
            <h3 className="text-sm font-semibold text-foreground mt-3">2.1 Personal Information</h3>
            <p>When you register or use our Service, we may collect:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Name, email address, phone number</li>
              <li>Company name and business information</li>
              <li>Billing and payment information</li>
              <li>Profile and account preferences</li>
            </ul>

            <h3 className="text-sm font-semibold text-foreground mt-3">2.2 Information from Third-Party Services</h3>
            <p>When you connect third-party services (such as Google, HubSpot, or other integrations), we may receive:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Basic profile information (name, email) from OAuth providers</li>
              <li>Calendar data, email metadata, drive files (depending on scopes you authorize)</li>
              <li>CRM and business data from connected platforms</li>
            </ul>
            <p>We only request the minimum permissions needed for the features you use. You can revoke access at any time through your account settings or the third-party provider's settings.</p>

            <h3 className="text-sm font-semibold text-foreground mt-3">2.3 Automatically Collected Information</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Device information, browser type, IP address</li>
              <li>Usage data, page views, feature interactions</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide, maintain, and improve the Service</li>
              <li>To personalize your experience and deliver AI-powered features</li>
              <li>To process transactions and send related information</li>
              <li>To send administrative notifications and updates</li>
              <li>To respond to customer service requests</li>
              <li>To detect, prevent, and address technical or security issues</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">4. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share data with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Service Providers:</strong> Third-party vendors who assist in operating the Service (hosting, analytics, AI processing)</li>
              <li><strong>AI Services:</strong> We use AI models to power features. Data sent to AI providers is used solely for generating responses and is not used to train their models</li>
              <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">5. Google API Services — Limited Use Disclosure</h2>
            <p>Our use and transfer of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements. Specifically:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>We only use Google user data for the purposes described in this policy and as authorized by the user</li>
              <li>We do not transfer Google user data to third parties except as necessary to provide the Service, comply with law, or as part of a merger/acquisition</li>
              <li>We do not use Google user data for serving advertisements</li>
              <li>We do not allow humans to read Google user data unless with user consent, for security purposes, to comply with law, or when aggregated and anonymized for internal operations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">6. Data Security</h2>
            <p>We implement industry-standard security measures including encryption in transit (TLS/SSL), encrypted storage, access controls, and regular security audits. However, no method of electronic transmission or storage is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">7. Data Retention</h2>
            <p>We retain your personal information for as long as your account is active or as needed to provide the Service. You can request deletion of your data by contacting us. We will delete or anonymize your data within 30 days of a verified request, unless retention is required by law.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">8. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access, correct, or delete your personal data</li>
              <li>Withdraw consent for data processing</li>
              <li>Request data portability</li>
              <li>Opt out of marketing communications</li>
              <li>Revoke third-party service connections</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">9. Children's Privacy</h2>
            <p>The Service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page and updating the "Last updated" date.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">11. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at:</p>
            <p className="font-semibold text-foreground">Xtreme Polishing Systems<br />
            Email: jeremy@shopxps.com<br />
            Website: xpsintelligence.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}