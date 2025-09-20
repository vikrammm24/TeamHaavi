import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, BarChart3, Shield, Smartphone, Zap, Play } from 'lucide-react';
import Navbar from '../components/Navbar';
import Reveal from '../components/ui/Reveal';
import Tilt from '../components/ui/Tilt';
import Footer from '../components/Footer';

const Features: React.FC = () => {
  const features = [
    { icon: <MapPin className="w-8 h-8" />, title: 'Smart Issue Reporting', description: 'Report city issues with precise geolocation and photo evidence' },
    { icon: <Users className="w-8 h-8" />, title: 'Professional Matching', description: 'AI-powered system connects issues with qualified professionals' },
    { icon: <BarChart3 className="w-8 h-8" />, title: 'Real-time Analytics', description: 'Track progress and city improvements with comprehensive dashboards' },
    { icon: <Shield className="w-8 h-8" />, title: 'Transparent Process', description: 'Complete visibility into issue resolution from report to completion' },
    { icon: <Smartphone className="w-8 h-8" />, title: 'AI Assistant (Multilingual)', description: 'Conversational support across languages for accessibility' },
    { icon: <Zap className="w-8 h-8" />, title: 'Instant Notifications', description: 'Real-time updates on your reports and community issues' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-12">
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg brand-icon">
                <Play className="w-5 h-5" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Explore Features</h1>
            </div>
          </Reveal>
          <p className="text-gray-600 mb-10 max-w-3xl">CityConnect unifies citizen engagement, civic issue management, and public transport optimization into a single experience powered by AI, IoT, and realtime analytics.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => (
              <Reveal key={idx} delay={idx * 0.05}>
                <Tilt glare className="rounded-xl">
                <motion.div
                  whileHover={{ y: -6, scale: 1.0 }}
                  className="rounded-xl border bg-white p-6 shadow hover:shadow-xl transition-all"
                >
                  <div className="mb-3 text-blue-600" style={{ color: 'var(--bg3)' }}>{f.icon}</div>
                  <div className="font-semibold text-gray-800 mb-1">{f.title}</div>
                  <div className="text-sm text-gray-600">{f.description}</div>
                </motion.div>
                </Tilt>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-gray-50 p-6 border">
              <div className="font-semibold text-gray-800 mb-2">Why CityConnect</div>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>Report issues with live location and photos</li>
                <li>AI matches problems to vetted professionals</li>
                <li>Authorities get real-time analytics and dashboards</li>
                <li>Smart notifications keep everyone in sync</li>
              </ul>
            </div>
            <div className="rounded-xl bg-gray-50 p-6 border">
              <div className="font-semibold text-gray-800 mb-2">Coming soon</div>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>Community polls and consultations</li>
                <li>Enhanced transport optimization</li>
                <li>Deeper CCTV + IoT integrations</li>
                <li>Expanded rewards and gamification</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Features;
