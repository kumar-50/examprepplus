import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | ExamPrepPlus',
  description: 'Privacy Policy for ExamPrepPlus - Your trusted partner for RRB NTPC exam preparation.',
};

export default function PrivacyPolicyPage() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: November 28, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to ExamPrepPlus ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services for RRB NTPC and other government exam preparation.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              By using ExamPrepPlus, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-lg font-medium mb-2">2.1 Personal Information</h3>
            <p className="text-muted-foreground leading-relaxed">
              When you register for an account, we collect:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
              <li>Full name</li>
              <li>Email address</li>
              <li>Password (encrypted)</li>
              <li>Phone number (optional)</li>
              <li>Profile picture (optional)</li>
            </ul>

            <h3 className="text-lg font-medium mb-2 mt-6">2.2 Usage Information</h3>
            <p className="text-muted-foreground leading-relaxed">
              We automatically collect certain information when you use our platform:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
              <li>Test and quiz attempt history</li>
              <li>Performance analytics and scores</li>
              <li>Study progress and streaks</li>
              <li>Time spent on the platform</li>
              <li>Device information and browser type</li>
              <li>IP address and location data</li>
            </ul>

            <h3 className="text-lg font-medium mb-2 mt-6">2.3 Payment Information</h3>
            <p className="text-muted-foreground leading-relaxed">
              When you make a purchase, payment processing is handled by Razorpay. We do not store your credit card or bank account details. We only receive transaction confirmation and payment status from Razorpay.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
              <li>To provide and maintain our exam preparation services</li>
              <li>To personalize your learning experience and recommendations</li>
              <li>To track your progress and generate performance analytics</li>
              <li>To process payments and manage subscriptions</li>
              <li>To send important updates about your account or our services</li>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To improve our platform and develop new features</li>
              <li>To prevent fraud and ensure platform security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
              <li><strong>Service Providers:</strong> With trusted third-party services like Razorpay (payments), Resend (emails), and Supabase (database hosting) who assist in operating our platform</li>
              <li><strong>Legal Requirements:</strong> When required by law or to respond to legal processes</li>
              <li><strong>Protection of Rights:</strong> To protect our rights, privacy, safety, or property</li>
              <li><strong>Business Transfers:</strong> In connection with any merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
              <li>SSL/TLS encryption for all data transmission</li>
              <li>Encrypted password storage using industry-standard hashing</li>
              <li>Secure cloud infrastructure with regular security updates</li>
              <li>Access controls limiting employee access to personal data</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              However, no method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide you services. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or regulatory purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the following rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Download your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise these rights, please contact us at support@examprepplus.com
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
              <li>Keep you signed in to your account</li>
              <li>Remember your preferences</li>
              <li>Analyze platform usage and performance</li>
              <li>Improve user experience</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You can control cookies through your browser settings. Disabling cookies may affect some functionality of our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our services are intended for users who are at least 13 years of age. We do not knowingly collect personal information from children under 13. If we discover that we have collected data from a child under 13, we will delete it immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">11. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
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
