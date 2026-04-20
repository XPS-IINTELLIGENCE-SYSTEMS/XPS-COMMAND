import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Terms of Service</h1>
            <p className="text-xs text-muted-foreground">Last updated: April 19, 2026</p>
          </div>
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-foreground/80">
          <section>
            <h2 className="text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>By accessing or using the XPS Intelligence Platform (the "Service") operated by Xtreme Polishing Systems ("XPS," "we," "us," or "our"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">2. Description of Service</h2>
            <p>The XPS Intelligence Platform is a business intelligence and automation platform that provides:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Lead generation, management, and CRM tools</li>
              <li>AI-powered content creation, branding, and media tools</li>
              <li>Project management, bidding, and estimating tools</li>
              <li>Third-party integrations (Google Workspace, HubSpot, etc.)</li>
              <li>Automated workflows and agent-based task execution</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">3. User Accounts</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must provide accurate and complete registration information</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
              <li>Upload malicious code, viruses, or harmful data</li>
              <li>Scrape, harvest, or collect data from the Service without authorization</li>
              <li>Use the Service to send spam or unsolicited communications</li>
              <li>Impersonate any person or entity</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">5. Intellectual Property</h2>
            <p>The Service, including its design, features, code, and content, is owned by XPS and protected by intellectual property laws. You retain ownership of data and content you upload to the Service. By using the Service, you grant us a limited license to process your data solely for the purpose of providing the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">6. AI-Generated Content</h2>
            <p>The Service uses artificial intelligence to generate content including text, images, strategies, and recommendations. You acknowledge that:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>AI-generated content may not always be accurate or complete</li>
              <li>You are responsible for reviewing and verifying AI-generated outputs before use</li>
              <li>AI-generated content should not be relied upon as professional, legal, or financial advice</li>
              <li>You own any content you create using our AI tools, subject to third-party AI provider terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">7. Third-Party Integrations</h2>
            <p>The Service integrates with third-party services (Google, HubSpot, etc.). When you connect these services:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>You authorize us to access data from those services as permitted by the scopes you approve</li>
              <li>Your use of third-party services is also governed by their respective terms and privacy policies</li>
              <li>We are not responsible for the availability, accuracy, or practices of third-party services</li>
              <li>You can disconnect integrations at any time through your account settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">8. Payment Terms</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Certain features may require a paid subscription</li>
              <li>Fees are billed in advance on a recurring basis</li>
              <li>All fees are non-refundable unless otherwise stated</li>
              <li>We reserve the right to change pricing with 30 days notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">9. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, XPS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES, ARISING FROM YOUR USE OF THE SERVICE.</p>
            <p>OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">10. Disclaimer of Warranties</h2>
            <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">11. Indemnification</h2>
            <p>You agree to indemnify and hold harmless XPS, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">12. Termination</h2>
            <p>We may terminate or suspend your access to the Service at any time, with or without cause. Upon termination, your right to use the Service ceases immediately. You may export your data before termination by contacting support.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">13. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the State of Florida, United States, without regard to its conflict of law provisions.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">14. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. Material changes will be communicated via email or through the Service. Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">15. Contact Us</h2>
            <p>For questions about these Terms of Service, please contact us at:</p>
            <p className="font-semibold text-foreground">Xtreme Polishing Systems<br />
            Email: j.xpsxpress@gmail.com<br />
            Website: xpsintelligence.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}