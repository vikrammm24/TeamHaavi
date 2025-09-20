import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: 'https://facebook.com/', label: 'Facebook', external: true },
    { icon: <Twitter className="w-5 h-5" />, href: 'https://twitter.com/', label: 'Twitter', external: true },
    { icon: <Instagram className="w-5 h-5" />, href: 'https://instagram.com/', label: 'Instagram', external: true },
    { icon: <Linkedin className="w-5 h-5" />, href: 'https://linkedin.com/', label: 'LinkedIn', external: true },
  ];

  const footerLinks: Array<{ title: string; links: Array<{ label: string; href: string; external?: boolean }> }> = [
    {
      title: 'Platform',
      links: [
  { label: 'For Citizens', href: '/for-citizens' },
  { label: 'For Professionals', href: '/for-professionals' },
  { label: 'For Authorities', href: '/for-authorities' },
  { label: 'API Documentation', href: '/api-docs' },
      ],
    },
    {
      title: 'Support',
      links: [
  { label: 'Help Center', href: '/help' },
        { label: 'Contact Us', href: 'mailto:haavi@cityconnect.com', external: true },
  { label: 'System Status', href: '/status' },
  { label: 'Community Guidelines', href: '/community-guidelines' },
      ],
    },
    {
      title: 'Company',
      links: [
  { label: 'About Us', href: '/about' },
  { label: 'Careers', href: '/careers' },
  { label: 'Press', href: '/press' },
  { label: 'Privacy Policy', href: '/privacy' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">CC</span>
              </div>
              <span className="text-2xl font-bold">
                City<span className="text-green-400">Connect</span>
              </span>
            </div>
            <p className="text-gray-300 mb-6">
              Empowering citizens, connecting communities, building smarter cities together through technology and collaboration.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target={social.external ? '_blank' : undefined}
                  rel={social.external ? 'noopener noreferrer' : undefined}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links Sections */}
          {footerLinks.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (sectionIndex + 1) * 0.1 }}
            >
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((l) => (
                  <motion.li key={l.label}>
                    {l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-white transition-colors duration-300"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        to={l.href}
                        className="text-gray-300 hover:text-white transition-colors duration-300"
                      >
                        {l.label}
                      </Link>
                    )}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="border-t border-gray-800 pt-8 mt-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="mailto:haavi@cityconnect.com" className="flex items-center space-x-3 group">
              <Mail className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
              <span className="text-gray-300 group-hover:text-white transition-colors">haavi@cityconnect.com</span>
            </a>
            <a href="tel:+910000000233" className="flex items-center space-x-3 group">
              <Phone className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
              <span className="text-gray-300 group-hover:text-white transition-colors">+91 XXXXXXX233</span>
            </a>
            <a href="https://maps.google.com/?q=India" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 group">
              <MapPin className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
              <span className="text-gray-300 group-hover:text-white transition-colors">India</span>
            </a>
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="border-t border-gray-800 pt-6 mt-6 text-center text-gray-400"
        >
          <p>&copy; 2024 CityConnect. All rights reserved. Built with ❤️ for smarter cities.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;