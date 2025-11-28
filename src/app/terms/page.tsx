import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | ExamPrepPlus',
  description: 'Terms of Service for ExamPrepPlus - Your trusted partner for RRB NTPC exam preparation.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: November 28, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to ExamPrepPlus. By accessing or using our website, mobile applications, or any related services (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              These Terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              ExamPrepPlus is an online platform that provides:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
              <li>Practice questions and mock tests for RRB NTPC and other government exams</li>
              <li>Performance analytics and progress tracking</li>
              <li>Study materials and exam preparation resources</li>
              <li>Personalized learning recommendations</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We reserve the right to modify, suspend, or discontinue any part of the Service at any time without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
            
            <h3 className="text-lg font-medium mb-2">3.1 Registration</h3>
            <p className="text-muted-foreground leading-relaxed">
              To access certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information as needed</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized access to your account</li>
            </ul>

            <h3 className="text-lg font-medium mb-2 mt-6">3.2 Account Responsibility</h3>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for all activities that occur under your account. We are not liable for any loss or damage arising from unauthorized use of your account.
            </p>

            <h3 className="text-lg font-medium mb-2 mt-6">3.3 Account Termination</h3>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violation of these Terms or for any other reason at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Subscriptions and Payments</h2>
            
            <h3 className="text-lg font-medium mb-2">4.1 Free and Premium Plans</h3>
            <p className="text-muted-foreground leading-relaxed">
              ExamPrepPlus offers both free and premium subscription plans. Free plans have limited access to features. Premium plans provide full access to all features as described on our pricing page.
            </p>

            <h3 className="text-lg font-medium mb-2 mt-6">4.2 Payment Processing</h3>
            <p className="text-muted-foreground leading-relaxed">
              All payments are processed securely through Razorpay. By making a purchase, you agree to Razorpay's terms of service. Prices are displayed in Indian Rupees (INR) and include applicable taxes.
            </p>

            <h3 className="text-lg font-medium mb-2 mt-6">4.3 Subscription Duration</h3>
            <p className="text-muted-foreground leading-relaxed">
              Premium subscriptions are valid for the duration specified at the time of purchase (monthly, half-yearly, or yearly). Subscriptions do not auto-renew unless explicitly stated.
            </p>

            <h3 className="text-lg font-medium mb-2 mt-6">4.4 Refund Policy</h3>
            <p className="text-muted-foreground leading-relaxed">
              We offer a 7-day money-back guarantee for premium subscriptions. If you are not satisfied within 7 days of purchase, you may request a full refund by contacting our support team. After 7 days, refunds are not available. Partial refunds for unused periods are not provided.
            </p>

            <h3 className="text-lg font-medium mb-2 mt-6">4.5 Promo Codes</h3>
            <p className="text-muted-foreground leading-relaxed">
              Promo codes are subject to their specific terms and conditions. They cannot be combined with other offers unless explicitly stated. We reserve the right to modify or cancel promo codes at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
              <li>Share your account credentials with others</li>
              <li>Use the Service for any unlawful purpose</li>
              <li>Copy, reproduce, or distribute our content without permission</li>
              <li>Attempt to reverse engineer, hack, or compromise our systems</li>
              <li>Use automated tools to access the Service (bots, scrapers, etc.)</li>
              <li>Impersonate another person or entity</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Upload or transmit viruses or malicious code</li>
              <li>Interfere with the proper functioning of the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Intellectual Property</h2>
            
            <h3 className="text-lg font-medium mb-2">6.1 Our Content</h3>
            <p className="text-muted-foreground leading-relaxed">
              All content on ExamPrepPlus, including but not limited to questions, explanations, study materials, graphics, logos, and software, is owned by ExamPrepPlus or its licensors and is protected by copyright, trademark, and other intellectual property laws.
            </p>

            <h3 className="text-lg font-medium mb-2 mt-6">6.2 Limited License</h3>
            <p className="text-muted-foreground leading-relaxed">
              We grant you a limited, non-exclusive, non-transferable license to access and use the Service for personal, non-commercial educational purposes only. This license does not include the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
              <li>Modify or copy our content</li>
              <li>Use content for commercial purposes</li>
              <li>Create derivative works</li>
              <li>Download content for offline distribution</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
              <li>The Service will be uninterrupted or error-free</li>
              <li>The content is accurate, complete, or current</li>
              <li>Using our Service will guarantee success in any exam</li>
              <li>Defects will be corrected</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Exam patterns, syllabus, and questions may change. We strive to keep our content updated but cannot guarantee it matches the latest official exam patterns at all times.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, EXAMPREPPLUS AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
              <li>Loss of profits, data, or goodwill</li>
              <li>Service interruption or computer damage</li>
              <li>Cost of substitute services</li>
              <li>Any damages resulting from exam results</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Our total liability shall not exceed the amount paid by you for the Service in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless ExamPrepPlus and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Service may contain links to or integrate with third-party services (such as Razorpay for payments). We are not responsible for the content, privacy policies, or practices of third-party services. Your use of third-party services is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">11. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or the Service shall be subject to the exclusive jurisdiction of the courts in India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">12. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of significant changes by posting a notice on our website or sending an email. Your continued use of the Service after changes are posted constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">13. Severability</h2>
            <p className="text-muted-foreground leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">14. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-medium">ExamPrepPlus</p>
              <p className="text-muted-foreground">Email: support@examprepplus.com</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 ExamPrepPlus. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
