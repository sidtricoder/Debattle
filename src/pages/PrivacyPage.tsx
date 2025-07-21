import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPage: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-12 px-4 flex justify-center items-start font-['Poppins',sans-serif]">
    <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-blue-100 dark:border-gray-800 p-8 md:p-12">
      <h1 className="text-4xl font-extrabold text-blue-900 dark:text-white mb-2 text-center">Privacy Policy</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">Last updated: July 21, 2025</p>
      <div className="prose prose-blue dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
        {/* --- Main Policy Content (adapted from privacy.html) --- */}
        <p>This Privacy Policy describes how Debattle ("we", "us", or "our") collects, uses, and protects your information when you use our platform. By using Debattle, you agree to the collection and use of information in accordance with this policy.</p>
        <h2>1. Information We Collect</h2>
        <ul>
          <li><strong>Personal Data:</strong> Name, email address, and other information you provide when registering or contacting us.</li>
          <li><strong>Usage Data:</strong> Information about how you use the platform, such as IP address, browser type, device information, and pages visited.</li>
          <li><strong>Cookies & Tracking:</strong> We use cookies and similar technologies to enhance your experience and analyze usage. You can control cookies via your browser settings.</li>
        </ul>
        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To provide, maintain, and improve our services.</li>
          <li>To personalize your experience and remember your preferences.</li>
          <li>To communicate with you about updates, security, and support.</li>
          <li>To analyze usage and improve platform security and performance.</li>
          <li>To comply with legal obligations and protect our rights.</li>
        </ul>
        <h2>3. Sharing & Disclosure</h2>
        <ul>
          <li>We do <strong>not</strong> sell your personal information.</li>
          <li>We may share data with trusted service providers who help us operate the platform (e.g., hosting, analytics), under strict confidentiality agreements.</li>
          <li>We may disclose information if required by law or to protect our users and platform.</li>
        </ul>
        <h2>4. Data Security</h2>
        <p>We use industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure. We encourage you to use strong passwords and protect your account credentials.</p>
        <h2>5. Data Retention</h2>
        <p>We retain your personal data only as long as necessary for the purposes described in this policy, or as required by law. You may request deletion of your data by contacting us.</p>
        <h2>6. Your Rights</h2>
        <ul>
          <li>Access, update, or delete your personal information via your account settings or by contacting us.</li>
          <li>Opt out of marketing communications at any time.</li>
          <li>Request information about how your data is processed.</li>
        </ul>
        <h2>7. Children's Privacy</h2>
        <p>Debattle is not intended for children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us for removal.</p>
        <h2>8. International Users</h2>
        <p>Your information may be processed and stored in countries outside your own. We ensure adequate protection for your data as required by applicable law.</p>
        <h2>9. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the date above. Please review this page periodically.</p>
        <h2>10. Contact Us</h2>
        <p>If you have questions or requests regarding this Privacy Policy, please <Link to="/contact">contact us</Link>.</p>
        <p>For more details, see our <Link to="/terms">Terms of Service</Link>.</p>
      </div>
    </div>
  </div>
);

export default PrivacyPage; 