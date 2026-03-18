import { ArrowLeft, Heart, Users, Zap, Shield } from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

export function AboutPage({ onBack }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-green-600 text-white p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-3xl font-bold">About Joy Drive</h1>
        <p className="text-green-100 mt-2">Your Journey, Our Pride</p>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Mission */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Joy Drive is committed to providing safe, reliable, and affordable transportation
            solutions across South Africa. We connect passengers with professional drivers,
            ensuring every journey is comfortable, secure, and enjoyable. Our mission is to
            revolutionize urban mobility while supporting local drivers and communities.
          </p>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Heart,
                title: 'Safety First',
                description: 'Your safety is our top priority. All drivers are verified and vehicles are regularly maintained.',
              },
              {
                icon: Users,
                title: 'Community',
                description: 'We support local drivers and contribute to the communities we serve.',
              },
              {
                icon: Zap,
                title: 'Reliability',
                description: 'Fast response times, transparent pricing, and consistent service quality.',
              },
              {
                icon: Shield,
                title: 'Trust',
                description: 'Secure transactions, privacy protection, and honest communication.',
              },
            ].map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                >
                  <Icon className="w-8 h-8 text-green-600 mb-3" />
                  <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Why Choose Joy Drive?</h2>
          <ul className="space-y-4">
            {[
              'Easy booking with real-time tracking',
              'Transparent pricing with no hidden charges',
              'Multiple vehicle options for different needs',
              'Professional and courteous drivers',
              '24/7 customer support',
              'Secure payment options including Stripe',
              'Loyalty rewards program',
              'Environmental commitment with eco-friendly vehicles',
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="text-gray-700 dark:text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Contact */}
        <section className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
          <p className="mb-6">Have questions? We'd love to hear from you!</p>
          <div className="space-y-3">
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:support@joydrive.co.za" className="hover:underline">
                support@joydrive.co.za
              </a>
            </p>
            <p>
              <strong>Phone:</strong>{' '}
              <a href="tel:+27788002462" className="hover:underline">
                +27 788 002 462
              </a>
            </p>
            <p>
              <strong>Hours:</strong> Monday - Sunday, 6:00 AM - 11:00 PM
            </p>
          </div>
        </section>

        {/* Version */}
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>Joy Drive App v1.0.0</p>
          <p>© 2026 Joy Drive. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
