import { useNavigate } from 'react-router-dom';
import logo from "../../images/Logo.png";
import { 
  FaRocket, FaChartLine, FaBoxOpen, FaMoneyCheckAlt, FaShieldAlt,
  FaTachometerAlt, FaHandshake, FaMobileAlt, FaUsers, FaShoppingBag,
  FaCogs, FaHeadset, FaPercentage, FaRegClock, FaShippingFast,
  FaGlobe, FaLightbulb, FaTools, FaStar, FaAward, FaCoins, FaSync, FaUserCheck
} from 'react-icons/fa';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';

const SellerLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-light">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <Container>
          <div className="navbar-brand d-flex align-items-center">
            <img src={logo} alt="KinjoMarket" height="50" className="me-2" />
            <span className="h4 mb-0">KinjoMarket Seller Hub</span>
          </div>
          <Button 
            variant="light" 
            className="ms-auto"
            onClick={() => navigate('/company-register-page')}
          >
            Become a Seller <FaRocket className="ms-2" />
          </Button>
        </Container>
      </nav>

      {/* Hero Section */}
      <section className="py-5 bg-white">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="text-center text-lg-start mb-5 mb-lg-0">
              <h1 className="display-4 fw-bold mb-4">
                Grow Your Business with <span className="text-primary">KinjoMarket</span>
              </h1>
              <p className="lead text-muted mb-4">
                Join Africa's leading marketplace and reach millions of potential customers
              </p>
              <Button 
                variant="primary" 
                size="lg" 
                onClick={() => navigate('/company-register-page')}
                className="rounded-pill px-4"
              >
                Start Selling Today <FaRocket className="ms-2" />
              </Button>
              <div className="d-flex mt-4 gap-3 justify-content-center justify-content-lg-start">
                <div className="d-flex align-items-center">
                  <FaUsers className="text-primary me-2" />
                  <span className="fw-bold">1M+ Customers</span>
                </div>
                <div className="d-flex align-items-center">
                  <FaShoppingBag className="text-primary me-2" />
                  <span className="fw-bold">500K+ Products</span>
                </div>
                <div className="d-flex align-items-center">
                  <FaGlobe className="text-primary me-2" />
                  <span className="fw-bold">Global Reach</span>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <img 
                src={logo} 
                alt="Seller Illustration" 
                className="img-fluid rounded-3 shadow" 
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-5 display-5 fw-bold">
            Why Choose <span className="text-primary">KinjoMarket</span>?
          </h2>
          <Row className="g-4">
            {[
              { icon: FaTachometerAlt, title: "Powerful Dashboard", text: "Real-time analytics and insights" },
              { icon: FaBoxOpen, title: "Smart Inventory", text: "AI-powered stock management" },
              { icon: FaMoneyCheckAlt, title: "Instant Payments", text: "Fast, secure transactions" },
              { icon: FaShieldAlt, title: "Seller Protection", text: "Fraud prevention & support" },
              { icon: FaChartLine, title: "Growth Tools", text: "Marketing & sales analytics" },
              { icon: FaMobileAlt, title: "Mobile App", text: "Manage on-the-go" },
              { icon: FaPercentage, title: "Low Fees", text: "Competitive commission rates" },
              { icon: FaRegClock, title: "24/7 Support", text: "Dedicated seller assistance" },
              { icon: FaShippingFast, title: "Logistics", text: "Integrated shipping solutions" },
              { icon: FaLightbulb, title: "Innovative Tools", text: "Cutting-edge technology for sellers" },
              { icon: FaTools, title: "Easy Setup", text: "Quick and hassle-free onboarding" },
              { icon: FaStar, title: "Customer Satisfaction", text: "High ratings and reviews" },
              { icon: FaAward, title: "Award-Winning Platform", text: "Recognized for excellence" },
              { icon: FaCoins, title: "Flexible Pricing", text: "Affordable plans for all sellers" },
              { icon: FaSync, title: "Seamless Integration", text: "Works with your existing tools" },
              { icon: FaUserCheck, title: "Verified Buyers", text: "Trusted and authenticated customers" },
            ].map((feature, index) => (
              <Col key={index} md={6} lg={4}>
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body className="text-center p-4">
                    <feature.icon className="display-4 text-primary mb-3" />
                    <h3 className="h4">{feature.title}</h3>
                    <p className="text-muted mb-0">{feature.text}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <Container className="text-center">
          <FaHandshake className="display-1 mb-4" />
          <h2 className="display-5 fw-bold mb-3">Ready to Boost Your Sales?</h2>
          <p className="lead mb-4">Join our community of successful sellers today</p>
          <Button 
            variant="light" 
            size="lg" 
            className="rounded-pill px-5"
            onClick={() => navigate('/company-register-page')}
          >
            Get Started Now <FaRocket className="ms-2" />
          </Button>
        </Container>
      </section>
    </div>
  );
};

export default SellerLanding;