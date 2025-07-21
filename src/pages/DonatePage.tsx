import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import '../styles/DonatePage.css';

const DonatePage: React.FC = () => {
  return (
    <div className="donate-container">
      <Header />
      
      <div className="donate-content">
        <h1 className="donate-title">Support Our Platform</h1>
        <p className="donate-description">
          Your donation helps us maintain and improve our services.
        </p>
        
        <div className="donate-image-container">
          <img 
            src="/pay.png" 
            alt="Donation QR Code" 
            className="donate-image"
          />
        </div>
        
        <p className="donate-thank-you">
          Scan the QR code to make a donation. Thank you for your support!
        </p>
      </div>
      
      <Footer />
    </div>
  );
};

export default DonatePage;
