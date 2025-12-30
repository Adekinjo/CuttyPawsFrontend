import { NavLink } from 'react-router-dom';
import {
  FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaShieldAlt, FaEnvelope,
  FaTiktok, FaPhone, FaMapMarkerAlt, FaCcVisa, FaCcMastercard,
  FaCcAmex, FaCcPaypal, FaShippingFast, FaHeadset, FaGift, FaUserTie
} from 'react-icons/fa';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-5">
      <Container>
        <Row className="g-4">
          {/* About KinjoMarket Section */}
          <Col md={4} className="mb-4">
            <h4 className="mb-4 text-warning">
              <FaGift className="me-2" />
              About KinjoMarket
            </h4>
            <p className="text-white-50">
              KinjoMarket is your one-stop destination for all your shopping needs. 
              We offer a wide range of products, from electronics to fashion, with 
              fast delivery and excellent customer service.
            </p>
            <div className="d-flex flex-wrap gap-3 mt-3">
              <a href="https://www.visa.com.ng/" target="_blank" rel="noopener noreferrer" className="text-white">
                <FaCcVisa size={30} title="Visa" />
              </a>
              <a href="https://www.mastercard.com.ng/" target="_blank" rel="noopener noreferrer" className="text-white">
                <FaCcMastercard size={30} title="Mastercard" />
              </a>
              <a href="https://www.americanexpress.com/ng/" target="_blank" rel="noopener noreferrer" className="text-white">
                <FaCcAmex size={30} title="American Express" />
              </a>
              <a href="https://www.paypal.com/ng/" target="_blank" rel="noopener noreferrer" className="text-white">
                <FaCcPaypal size={30} title="PayPal" />
              </a>
              <img 
                src="https://assets.website-files.com/5f5a6eadb2d9d60f5a3d0c9a/5f5cacb1b2d9d65e4f3d3c9e_Paystack%20Logo%20-%20Blue%20and%20White.png" 
                alt="Paystack" 
                style={{ 
                  height: '30px', 
                  filter: 'brightness(0) invert(1)',
                  objectFit: 'contain'
                }}
              />
            </div>
          </Col>

          {/* Quick Links Section */}
          <Col md={4} className="mb-4">
            <h4 className="mb-4 text-warning">Quick Links</h4>
            <ul className="list-unstyled">
              <li className="mb-2">
                <NavLink to="/customer-support" className="text-white text-decoration-none hover-text-warning">
                  <FaHeadset className="me-2" />
                  Customer Support
                </NavLink>
              </li>
              <li className="mb-2">
                <NavLink to="/privacy-policy" className="text-white text-decoration-none hover-text-warning">
                  <FaShieldAlt className="me-2" />
                  Privacy Policy
                </NavLink>
              </li>
              <li className="mb-2">
                <NavLink to="/shipping-returns" className="text-white text-decoration-none hover-text-warning">
                  <FaShippingFast className="me-2" />
                  Shipping & Returns
                </NavLink>
              </li>
              <li className="mb-2">
                <NavLink to="/store-locator" className="text-white text-decoration-none hover-text-warning">
                  <FaMapMarkerAlt className="me-2" />
                  Store Locator
                </NavLink>
              </li>
              <li className="mb-2">
                <NavLink to="/faqs" className="text-white text-decoration-none hover-text-warning">
                  <FaEnvelope className="me-2" />
                  FAQs
                </NavLink>
              </li>
              <li className="mb-2">
                <NavLink to="/sell-on-kinjomarket" className="text-white text-decoration-none hover-text-warning">
                  <FaUserTie className="me-2" />
                  Sell on KinjoMarket
                </NavLink>
              </li>
            </ul>
          </Col>

          {/* Contact Us Section */}
          <Col md={4} className="mb-4">
            <h4 className="mb-4 text-warning">
              <FaMapMarkerAlt className="me-2" />
              Contact Us
            </h4>
            <p>
              <a href="tel:+2348135072306" className="text-white text-decoration-none hover-text-warning">
                <FaPhone className="me-2" />
                +234 813 507 2306
              </a>
            </p>
            <p>
              <a href="mailto:support@kinjomarket.com" className="text-white text-decoration-none hover-text-warning">
                <FaEnvelope className="me-2" />
                support@kinjomarket.com
              </a>
            </p>
            <div className="mt-4">
              <h5 className="text-warning mb-3">Follow Us</h5>
              <div className="d-flex gap-3">
                <a href="https://www.facebook.com/profile.php?id=61573896356088" target="_blank" rel="noopener noreferrer" className="text-white">
                  <FaFacebook size={25} title="Facebook" />
                </a>
                <a href="https://x.com/kinjomarket" target="_blank" rel="noopener noreferrer" className="text-white">
                  <FaTwitter size={25} title="Twitter" />
                </a>
                <a href="https://www.instagram.com/kinjomarket" target="_blank" rel="noopener noreferrer" className="text-white">
                  <FaInstagram size={25} title="Instagram" />
                </a>
                <a href="https://www.tiktok.com/@kinjomarket" target="_blank" rel="noopener noreferrer" className="text-white">
                  <FaTiktok size={25} title="TikTok" />
                </a>
                <a href="https://www.linkedin.com/company/kinjomarket" target="_blank" rel="noopener noreferrer" className="text-white">
                  <FaLinkedin size={25} title="LinkedIn" />
                </a>
              </div>
            </div>
          </Col>
        </Row>

        {/* Copyright Section */}
        <Row className="mt-5">
          <Col className="text-center">
            <p className="mb-0 text-white-50">
              &copy; {new Date().getFullYear()} KinjoMarket. All rights reserved.
            </p>
            <p className="text-white-50">
              Designed with ❤️ by KinjoMarket Team
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;