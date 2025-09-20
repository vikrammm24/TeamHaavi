import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, MapPin, Zap, Shield, Smartphone, BarChart3, Play, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import Reveal from '../components/ui/Reveal';
import Tilt from '../components/ui/Tilt';
import Footer from '../components/Footer';
import ScrollingIcons from '../components/ScrollingIcons';
import LottiePlayer from '../components/ui/Lottie';
import pulse from '../assets/lottie/pulse.json';
import AnimatedIcon from '../components/ui/AnimatedIcon';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  // animation trigger retained earlier now simplified away
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start','end start'] });
  const parallaxY1 = useTransform(scrollYProgress, [0,1], [0, 180]);
  const parallaxY2 = useTransform(scrollYProgress, [0,1], [0, 260]);
  const parallaxOpacity = useTransform(scrollYProgress, [0,1], [1, 0]);
  useEffect(() => { /* initial hero intro already handled by framer variants */ }, []);

  const features = [
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Smart Issue Reporting",
      description: "Report city issues with precise geolocation and photo evidence"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Professional Matching",
      description: "AI-powered system connects issues with qualified professionals"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Real-time Analytics",
      description: "Track progress and city improvements with comprehensive dashboards"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Transparent Process",
      description: "Complete visibility into issue resolution from report to completion"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "AI Assistant (Multilingual)",
      description: "Conversational support across languages for accessibility"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Notifications",
      description: "Real-time updates on your reports and community issues"
    }
  ];

  return (
  <div ref={containerRef} className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
  <section className="relative overflow-hidden brand-hero text-white min-h-screen flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 bg-black"
          />
          
          {/* Floating geometric shapes */}
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-20 left-10 w-32 h-32 border-2 border-white border-opacity-20 rounded-full"
          />
          <motion.div
            animate={{ 
              rotate: -360,
              scale: [1, 0.9, 1]
            }}
            transition={{ 
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-40 right-20 w-24 h-24 border-2 border-white border-opacity-20 rounded-lg"
          />
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: 180
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-40 left-1/4 w-16 h-16 border-2 border-white border-opacity-20 rounded-full"
          />
          
          {/* Parallax layered mesh */}
          <motion.div style={{ y: parallaxY1, opacity: parallaxOpacity }} className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(34,197,94,0.18),transparent_65%)] mix-blend-screen" />
          </motion.div>
          <motion.div style={{ y: parallaxY2, opacity: parallaxOpacity }} className="pointer-events-none absolute inset-x-0 bottom-0 h-56">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 via-blue-800/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-center h-full space-x-1 px-4">
              {[...Array(28)].map((_, i) => (
                <motion.div
                  key={i}
                  className="bg-white/25 rounded-t"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: (40 + (i % 5) * 18) + 'px', opacity: 1 }}
                  transition={{ duration: 1.4, delay: i * 0.04, repeat: Infinity, repeatType: 'reverse', repeatDelay: 1 + (i % 7) * 0.2 }}
                  style={{ width: (6 + (i % 4) * 3) + 'px' }}
                />
              ))}
            </div>
          </motion.div>
        </div>
        
        <div className="relative container mx-auto px-4">
          <div className="text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="mb-8"
            >
              <div className="inline-flex items-center space-x-3 brand-badge backdrop-blur-sm rounded-full px-6 py-3 mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium">Unified Civic + Transport</span>
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-6xl md:text-8xl font-extrabold mb-8 leading-tight cc-text-stronger"
            >
              <span className="cc-gradient-text">City</span><span className="text-green-400 drop-shadow-[0_0_6px_rgba(34,197,94,0.8)]">Connect</span>
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base md:text-lg text-blue-50/95 mb-10 max-w-4xl mx-auto leading-relaxed"
            >
              <ul className="grid md:grid-cols-2 gap-3">
                <li className="flex items-start gap-3 cc-hero-bullet rounded-lg px-4 py-3">
                  <MapPin className="w-5 h-5 text-white mt-0.5" />
                  <span>Report geo-tagged issues with images; get real-time updates.</span>
                </li>
                <li className="flex items-start gap-3 cc-hero-bullet rounded-lg px-4 py-3">
                  <Shield className="w-5 h-5 text-white mt-0.5" />
                  <span>IoT + CCTV dashboard automates detection and routing.</span>
                </li>
                <li className="flex items-start gap-3 cc-hero-bullet rounded-lg px-4 py-3">
                  <Smartphone className="w-5 h-5 text-white mt-0.5" />
                  <span>Multilingual AI assistant for accessible city services.</span>
                </li>
                <li className="flex items-start gap-3 cc-hero-bullet rounded-lg px-4 py-3">
                  <BarChart3 className="w-5 h-5 text-white mt-0.5" />
                  <span>Data-driven transport optimization and smart ticketing.</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-5 justify-center items-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/features')}
                className="brand-chip backdrop-blur-sm hover:opacity-90 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center space-x-2 border border-white/20 transition-all duration-300"
              >
                <Play className="w-5 h-5" />
                <span>Explore Features</span>
              </motion.button>
            </motion.div>
            
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex justify-center items-center space-x-10 mt-14"
            >
              <div className="text-center relative">
                <div className="absolute -right-6 -top-6 w-8 h-8 opacity-70 pointer-events-none mix-blend-screen">
                  <LottiePlayer animationData={pulse} className="w-full h-full" />
                </div>
                <div className="text-3xl font-bold" style={{ color: 'var(--bg2)' }}>10K+</div>
                <div className="text-sm text-blue-200">Active Users</div>
              </div>
              <div className="w-px h-12 bg-white bg-opacity-30"></div>
              <div className="text-center relative">
                <div className="absolute -right-6 -top-6 w-8 h-8 opacity-70 pointer-events-none mix-blend-screen">
                  <LottiePlayer animationData={pulse} className="w-full h-full" />
                </div>
                <div className="text-3xl font-bold" style={{ color: 'var(--bg2)' }}>500+</div>
                <div className="text-sm text-blue-200">Issues Resolved</div>
              </div>
              <div className="w-px h-12 bg-white bg-opacity-30"></div>
              <div className="text-center relative">
                <div className="absolute -right-6 -top-6 w-8 h-8 opacity-70 pointer-events-none mix-blend-screen">
                  <LottiePlayer animationData={pulse} className="w-full h-full" />
                </div>
                <div className="text-3xl font-bold" style={{ color: 'var(--bg2)' }}>95%</div>
                <div className="text-sm text-blue-200">Satisfaction Rate</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

  {/* Scrolling Icons Band (moved up for visibility) */}
  <ScrollingIcons />

  {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <Reveal className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Smart City Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Revolutionizing urban management through technology, transparency, and community engagement
            </p>
          </Reveal>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Reveal key={index} delay={index * 0.06}>
                <Tilt glare className="rounded-xl">
                <motion.div
                  whileHover={{ y: -10, scale: 1.0 }}
                  className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group"
                >
                <motion.div 
                  whileHover={{ scale: 1.06, rotate: 3 }}
                  className="mb-4"
                >
                  <AnimatedIcon>
                    <span className="text-white">
                      {feature.icon}
                    </span>
                  </AnimatedIcon>
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
                </motion.div>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

  

      {/* Innovation Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <Reveal className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Innovation</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Unified Civic + Transport System • AI-Powered Civic Issue Detection • Dynamic Public Transport Optimization • ChatGPT-like AI Agent • Gamified Citizen Participation
            </p>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 text-sm">
            {[
              {
                title: 'Unified Civic + Transport System',
                desc: 'One AI-driven platform spanning civic services and transit.'
              },
              {
                title: 'AI-Powered Detection',
                desc: 'Computer vision + IoT for auto-detecting urban issues.'
              },
              {
                title: 'Transport Optimization',
                desc: 'Adjusts routes/schedules via real-time demand and traffic.'
              },
              {
                title: 'AI Assistant',
                desc: 'Conversational guidance and multilingual support.'
              },
              {
                title: 'Gamified Participation',
                desc: 'Leaderboards, badges, and points to boost engagement.'
              }
            ].map((i, idx) => (
              <Reveal key={idx} delay={idx * 0.05}>
                <div className="bg-gray-50 p-6 rounded-xl border hover:shadow-lg transition">
                <div className="font-semibold text-gray-800 mb-2">{i.title}</div>
                <div className="text-gray-600">{i.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Unique Functionality Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Unique Functionality</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Built-in capabilities to address real urban challenges and enable data-driven governance.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Geo-Tagged Reporting with Auto-Fill',
                desc: 'Auto-suggest issue types from images + location to reduce user effort.'
              },
              {
                title: 'Emergency Response Layer',
                desc: 'Push notifications and digital billboard alerts for city-wide broadcasting.'
              },
              {
                title: 'Visual Admin Dashboard',
                desc: 'Predictive insights to prioritize complaints and forecast service demand.'
              },
              {
                title: 'Multilingual Accessibility',
                desc: 'All services available through a multilingual AI chatbot and UI.'
              },
              {
                title: 'Civic Sentiment Analysis',
                desc: 'Analyze feedback to gauge public sentiment on policies and issues.'
              },
              {
                title: 'Smart Ticketing',
                desc: 'Seamless ticketing integrated with transport optimization.'
              }
            ].map((i, idx) => (
              <Reveal key={idx} delay={idx * 0.05}>
                <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl border transition">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{i.title}</h3>
                <p className="text-gray-600">{i.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
  <section className="py-20 brand-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '10,000+', label: 'Issues Resolved' },
              { number: '50+', label: 'Cities Connected' },
              { number: '25,000+', label: 'Active Citizens' },
              { number: '99.2%', label: 'Satisfaction Rate' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative z-10"
              >
                <div className="absolute -right-4 -top-4 w-10 h-10 opacity-70 pointer-events-none mix-blend-screen">
                  <LottiePlayer animationData={pulse} className="w-full h-full" />
                </div>
                <motion.div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: 'var(--bg2)', textShadow: '0 1px 6px rgba(0,0,0,0.18)' }}>{stat.number}</motion.div>
                <div className="text-white/80 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-gray-800 mb-6"
          >
            Ready to Transform Your City?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          >
            Join thousands of citizens, professionals, and authorities who are already making their communities better.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg flex items-center gap-2 mx-auto"
          >
            <Star className="w-6 h-6" />
            Start Your Journey
          </motion.button>
        </div>
      </section>

      
      <Footer />
    </div>
  );
};

export default LandingPage;