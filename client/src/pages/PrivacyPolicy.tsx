import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-blue-100 mt-2">Last updated: March 2026</p>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Joy Drive ("we," "us," "our," or "Company") is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our mobile application and website.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Personal Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Name, email address, and phone number</li>
                  <li>Date of birth and identification number</li>
                  <li>Address and location information</li>
                  <li>Payment and banking information</li>
                  <li>Profile photo and preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">Location Data</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We collect real-time location data to provide ride services, track trips, and
                  improve our service quality. You can control location sharing in app settings.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">Device Information</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Device type, operating system, unique device identifiers, and mobile network information.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">Usage Data</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Information about how you interact with our app, including search queries, bookings,
                  and ratings.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Provide and improve our transportation services</li>
              <li>Process payments and prevent fraud</li>
              <li>Communicate with you about your account and trips</li>
              <li>Send promotional offers and updates (with your consent)</li>
              <li>Conduct analytics and research</li>
              <li>Comply with legal obligations</li>
              <li>Ensure safety and security of our platform</li>
              <li>Resolve disputes and troubleshoot issues</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold mb-4">3. Data Sharing and Disclosure</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may share your information with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Drivers and other passengers (limited information for trip purposes)</li>
              <li>Payment processors and financial institutions</li>
              <li>Service providers and contractors</li>
              <li>Law enforcement when required by law</li>
              <li>Business partners with your consent</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We implement industry-standard security measures including encryption, secure servers,
              and access controls to protect your personal information. However, no method of transmission
              over the Internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold mb-4">5. Your Rights</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Control location sharing</li>
              <li>Request data portability</li>
              <li>Lodge a complaint with relevant authorities</li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold mb-4">6. Cookies and Tracking</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience, analyze usage,
              and personalize content. You can control cookie settings in your browser.
            </p>
          </section>

          {/* Retention */}
          <section>
            <h2 className="text-2xl font-bold mb-4">7. Data Retention</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We retain your personal information for as long as necessary to provide services, comply
              with legal obligations, and resolve disputes. You can request deletion at any time.
            </p>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-2xl font-bold mb-4">8. Third-Party Links</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Our app may contain links to third-party websites. We are not responsible for their privacy
              practices. Please review their privacy policies before providing any information.
            </p>
          </section>

          {/* Children */}
          <section>
            <h2 className="text-2xl font-bold mb-4">9. Children's Privacy</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Joy Drive is not intended for children under 18. We do not knowingly collect information
              from children. If we learn we have collected information from a child, we will delete it promptly.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-2xl font-bold mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We may update this Privacy Policy periodically. We will notify you of significant changes
              via email or through the app. Your continued use of Joy Drive constitutes acceptance of
              the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have questions about this Privacy Policy or our privacy practices:
            </p>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:privacy@joydrive.co.za" className="text-blue-600 hover:underline">
                  privacy@joydrive.co.za
                </a>
              </p>
              <p>
                <strong>Address:</strong> Joy Drive, Johannesburg, South Africa
              </p>
              <p>
                <strong>Phone:</strong>{' '}
                <a href="tel:+27123456789" className="text-blue-600 hover:underline">
                  +27 (0)1 234 5678
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
