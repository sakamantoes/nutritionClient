import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Github, 
  Twitter, 
  Instagram,
  Mail,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'API', href: '/api' },
      { label: 'Documentation', href: '/docs' },
    ],
    Company: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'GDPR', href: '/gdpr' },
    ],
    Resources: [
      { label: 'Nutrition Guide', href: '/guide' },
      { label: 'Recipe Library', href: '/recipes' },
      { label: 'Community', href: '/community' },
      { label: 'Support', href: '/support' },
    ],
  };

  const socialLinks = [
    { icon: Github, label: 'GitHub', href: 'https://github.com' },
    { icon: Twitter, label: 'Twitter', href: 'https://twitter.com' },
    { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
    { icon: Mail, label: 'Email', href: 'mailto:support@nutritiontracker.com' },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold gradient-text">
                    NutriTrack
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    AI-powered nutrition tracking
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Transform your health journey with AI-powered nutrition insights, 
                personalized meal plans, and real-time tracking.
              </p>
              <div className="flex items-center space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  {category}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:underline transition-colors flex items-center"
                      >
                        {link.label}
                        {link.href.startsWith('http') && (
                          <ExternalLink className="h-3 w-3 ml-1" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © {currentYear} Nutrition Tracker. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <Link
                to="/sitemap"
                className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
              >
                Sitemap
              </Link>
              <Link
                to="/accessibility"
                className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
              >
                Accessibility
              </Link>
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Heart className="h-3 w-3 mr-1 text-danger" />
                Made with love for healthy living
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PWA Install Prompt */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <p className="text-sm">
            <span className="font-semibold">✨ Install NutriTrack App</span> - Get instant access from your home screen
          </p>
          <button
            onClick={() => {
              if ('beforeInstallPrompt' in window) {
                window.beforeInstallPrompt.prompt();
              }
            }}
            className="text-sm bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg transition-colors"
          >
            Install Now
          </button>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;