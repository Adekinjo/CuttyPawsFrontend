import "../../style/PrivacyPolicy.css"; // Import the CSS file

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy-container">
      <h1>Privacy Policy</h1>
      <p className="intro-text">
        Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website.
      </p>

      <div className="policy-section">
        <h2>1. Information We Collect</h2>
        <p>
          We may collect personal information such as your name, email address, phone number, and payment details when you create an account, place an order, or contact us.
        </p>
      </div>

      <div className="policy-section">
        <h2>2. How We Use Your Information</h2>
        <p>
          We use your information to process orders, provide customer support, improve our services, and send you promotional offers (if you opt-in).
        </p>
      </div>

      <div className="policy-section">
        <h2>3. Sharing Your Information</h2>
        <p>
          We do not sell or share your personal information with third parties except for shipping partners and payment processors necessary to fulfill your orders.
        </p>
      </div>

      <div className="policy-section">
        <h2>4. Data Security</h2>
        <p>
          We use SSL encryption and follow industry-standard security practices to protect your data. However, no method of transmission over the internet is 100% secure.
        </p>
      </div>

      <div className="policy-section">
        <h2>5. Your Rights</h2>
        <p>
          You have the right to access, update, or delete your personal information. You can also opt-out of receiving promotional emails at any time.
        </p>
      </div>

      <div className="policy-section">
        <h2>6. Cookies</h2>
        <p>
          We use cookies to enhance your browsing experience. You can disable cookies in your browser settings, but this may affect the functionality of our website.
        </p>
      </div>

      <div className="policy-section">
        <h2>7. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Any changes will be posted on this page, and we encourage you to review it periodically.
        </p>
      </div>

      <div className="policy-section">
        <h2>8. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at <strong>privacy@example.com</strong>.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;