import '../../style/TermsAndCondition.css';  

const TermsAndConditions = () => {
  return (
    <div className="terms-container">
      <h1>Terms and Conditions</h1>
      <p className="intro-text">
        Welcome to our website. By using our site, you agree to comply with and be bound by the following terms and conditions of use. Please read them carefully.
      </p>

      <div className="terms-section">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using our website, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our website.
        </p>
      </div>

      <div className="terms-section">
        <h2>2. Use of the Website</h2>
        <p>
          You agree to use this website only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the website.
        </p>
      </div>

      <div className="terms-section">
        <h2>3. Intellectual Property</h2>
        <p>
          All content on this website, including text, graphics, logos, and images, is the property of our company and is protected by copyright and other intellectual property laws.
        </p>
      </div>

      <div className="terms-section">
        <h2>4. User Accounts</h2>
        <p>
          If you create an account on our website, you are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.
        </p>
      </div>

      <div className="terms-section">
        <h2>5. Limitation of Liability</h2>
        <p>
          We will not be liable for any loss or damage arising from your use of this website, including but not limited to indirect or consequential loss or damage.
        </p>
      </div>

      <div className="terms-section">
        <h2>6. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms and Conditions at any time. Your continued use of the website after any changes constitutes your acceptance of the new terms.
        </p>
      </div>

      <div className="terms-section">
        <h2>7. Governing Law</h2>
        <p>
          These Terms and Conditions are governed by and construed in accordance with the laws of the state of New York, USA. Any disputes will be resolved in the courts of New York.
        </p>
      </div>

      <div className="terms-section">
        <h2>8. Contact Us</h2>
        <p>
          If you have any questions about these Terms and Conditions, please contact us at <strong>support@example.com</strong>.
        </p>
      </div>
    </div>
  );
};

export default TermsAndConditions;