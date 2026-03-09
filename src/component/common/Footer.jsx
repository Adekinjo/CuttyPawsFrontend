import { NavLink } from 'react-router-dom';
import {
  FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaShieldAlt, FaEnvelope,
  FaTiktok, FaPhone, FaMapMarkerAlt, FaCcVisa, FaCcMastercard,
  FaCcAmex, FaCcPaypal, FaShippingFast, FaHeadset, FaGift, FaUserTie
} from 'react-icons/fa';
import { Container, Row, Col } from 'react-bootstrap';
import '../../style/Footer.css';

const Footer = () => {
  return (
    <footer className="cutty-footer py-5 mt-5">
      <Container>
        <Row className="g-4">
          {/* About CuttyPaws */}
          <Col md={4} className="mb-4">
            <h4 className="mb-4 cutty-footer-title">
              <FaGift className="me-2" />
              About CuttyPaws
            </h4>
            <p className="cutty-footer-text">
              CuttyPaws is a social + shopping space for pet owners. Discover trusted accessories,
              connect with fellow pet lovers, and shop essentials for happy pets.
            </p>
            <div className="d-flex flex-wrap gap-3 mt-3">
              <a href="https://www.visa.com.ng/" target="_blank" rel="noopener noreferrer" className="cutty-footer-icon-link">
                <FaCcVisa size={30} title="Visa" />
              </a>
              <a href="https://www.mastercard.com.ng/" target="_blank" rel="noopener noreferrer" className="cutty-footer-icon-link">
                <FaCcMastercard size={30} title="Mastercard" />
              </a>
              <a href="https://www.americanexpress.com/ng/" target="_blank" rel="noopener noreferrer" className="cutty-footer-icon-link">
                <FaCcAmex size={30} title="American Express" />
              </a>
              <a href="https://www.paypal.com/ng/" target="_blank" rel="noopener noreferrer" className="cutty-footer-icon-link">
                <FaCcPaypal size={30} title="PayPal" />
              </a>
              <img 
                src="https://assets.website-files.com/5f5a6eadb2d9d60f5a3d0c9a/5f5cacb1b2d9d65e4f3d3c9e_Paystack%20Logo%20-%20Blue%20and%20White.png" 
                alt="Paystack" 
                className="cutty-footer-paystack"
                style={{ 
                  height: '30px', 
                  objectFit: 'contain'
                }}
              />
            </div>
          </Col>

          {/* Quick Links */}
          <Col md={4} className="mb-4">
            <h4 className="mb-4 cutty-footer-title">Quick Links</h4>
            <ul className="list-unstyled">
              <li className="mb-2">
                <NavLink to="/customer-support" className="cutty-footer-link text-decoration-none">
                  <FaHeadset className="me-2" />
                  Customer Support
                </NavLink>
              </li>
              <li className="mb-2">
                <NavLink to="/privacy-policy" className="cutty-footer-link text-decoration-none">
                  <FaShieldAlt className="me-2" />
                  Privacy Policy
                </NavLink>
              </li>
              <li className="mb-2">
                <NavLink to="/categories" className="cutty-footer-link text-decoration-none">
                  <FaShippingFast className="me-2" />
                  Shop Categories
                </NavLink>
              </li>
              <li className="mb-2">
                <NavLink to="/about-us" className="cutty-footer-link text-decoration-none">
                  <FaMapMarkerAlt className="me-2" />
                  About Us
                </NavLink>
              </li>
              <li className="mb-2">
                <NavLink to="/faqs" className="cutty-footer-link text-decoration-none">
                  <FaEnvelope className="me-2" />
                  FAQs
                </NavLink>
              </li>
              <li className="mb-2">
                <NavLink to="/sellers-landing-page" className="cutty-footer-link text-decoration-none">
                  <FaUserTie className="me-2" />
                  Sell on CuttyPaws
                </NavLink>
              </li>
            </ul>
          </Col>

          {/* Contact Us */}
          <Col md={4} className="mb-4">
            <h4 className="mb-4 cutty-footer-title">
              <FaMapMarkerAlt className="me-2" />
              Contact Us
            </h4>
            <p>
              <a href="tel:+2348135072306" className="cutty-footer-link text-decoration-none">
                <FaPhone className="me-2" />
                +234 813 507 2306
              </a>
            </p>
            <p>
              <a href="mailto:support@cuttypaws.com" className="cutty-footer-link text-decoration-none">
                <FaEnvelope className="me-2" />
                support@cuttypaws.com
              </a>
            </p>
            <div className="mt-4">
              <h5 className="cutty-footer-title mb-3">Follow Us</h5>
              <div className="d-flex gap-3">
                <a href="https://www.facebook.com/share/1841FN7UDL/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="cutty-footer-icon-link">
                  <FaFacebook size={25} title="Facebook" />
                </a>
                <a href="https://x.com/CuttyPaws" target="_blank" rel="noopener noreferrer" className="cutty-footer-icon-link">
                  <FaTwitter size={25} title="Twitter" />
                </a>
                <a href="https://www.instagram.com/cutty.paws" target="_blank" rel="noopener noreferrer" className="cutty-footer-icon-link">
                  <FaInstagram size={25} title="Instagram" />
                </a>
                <a href="https://www.tiktok.com/@cuttypaws.com" target="_blank" rel="noopener noreferrer" className="cutty-footer-icon-link">
                  <FaTiktok size={25} title="TikTok" />
                </a>
                <a href="https://www.linkedin.com/in/cutty-paws-3b00603b6" target="_blank" rel="noopener noreferrer" className="cutty-footer-icon-link">
                  <FaLinkedin size={25} title="LinkedIn" />
                </a>
              </div>
            </div>
          </Col>
        </Row>

        <Row className="mt-5 cutty-footer-bottom">
          <Col className="text-center">
            <p className="mb-0 cutty-footer-text">
              &copy; {new Date().getFullYear()} CuttyPaws. All rights reserved.
            </p>
            <p className="cutty-footer-text">
              Built for pet owners and animal lovers.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
