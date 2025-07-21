import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Heart,
  Shield,
  Users,
  Award
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '/features' },
      { name: 'Donate', href: '/donate' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ]
  };

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com', icon: Github },
    { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
    { name: 'Email', href: 'mailto:contact@debattle.com', icon: Mail }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your debates are encrypted and your privacy is protected.'
    },
    {
      icon: Users,
      title: 'Global Community',
      description: 'Connect with debaters from around the world.'
    },
    {
      icon: Award,
      title: 'AI-Powered Judging',
      description: 'Get instant feedback and scoring from our AI judges.'
    }
  ];

  return (
    <footer className="bg-background dark:bg-gray-950 border-t border-border dark:border-gray-800 text-foreground dark:text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-10 mb-8">
          {/* Brand Section */}
          <div className="mb-8 md:mb-0 md:w-1/4">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Debattle
              </span>
            </Link>
            <p className="text-secondary dark:text-gray-300 text-sm mb-4">
              The ultimate platform for intelligent debates, AI-powered judging, and skill development.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-secondary/10 dark:bg-gray-800 hover:bg-secondary/20 dark:hover:bg-gray-700 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Section */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Product Links */}
            <div>
              <h3 className="font-semibold text-foreground dark:text-white mb-4">Product</h3>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSfnfUe38VIZvwHVxPwOOWU0YcYJE7RW8-PQHCgcmLjlw9T35Q/viewform"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors text-sm"
                  >
                    Report Bug
                  </a>
                </li>
              </ul>
            </div>
            {/* Company Links */}
            <div>
              <h3 className="font-semibold text-foreground dark:text-white mb-4">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {/* Legal Links */}
            <div>
              <h3 className="font-semibold text-foreground dark:text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {/* Bottom Section */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-sm text-secondary dark:text-gray-400 gap-4">
          <span>&copy; {currentYear} Debattle. All rights reserved.</span>
          <div className="flex items-center space-x-2">
            <span>Made with</span>
            <Heart size={16} className="text-red-500" />
            <span>for the debate community</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
