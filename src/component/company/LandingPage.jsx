import { useNavigate } from "react-router-dom";
import logo from "../../images/Logo.png";
import {
  FaStore,
  FaPaw,
  FaBoxes,
  FaChartLine,
  FaShieldAlt,
  FaUsers,
  FaRocket,
  FaCheckCircle,
  FaMoneyCheckAlt,
  FaTags,
  FaHeadset,
  FaArrowRight,
} from "react-icons/fa";
import { Container, Row, Col, Button, Card } from "react-bootstrap";

const SellerLanding = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FaStore,
      title: "Your Own Seller Space",
      text: "Create your seller profile, showcase your pet products, and build your brand on CuttyPaws.",
    },
    {
      icon: FaBoxes,
      title: "Easy Product Listing",
      text: "Add product images, pricing, colors, sizes, stock, and descriptions in one place.",
    },
    {
      icon: FaUsers,
      title: "Reach Pet Owners",
      text: "Connect with a growing community of pet lovers already browsing products and pet content.",
    },
    {
      icon: FaMoneyCheckAlt,
      title: "Secure Payments",
      text: "Accept payments through a secure checkout flow designed to support marketplace selling.",
    },
    {
      icon: FaChartLine,
      title: "Grow With Insights",
      text: "Track your store activity, product visibility, and performance as the platform expands.",
    },
    {
      icon: FaShieldAlt,
      title: "Trusted Platform",
      text: "Sell through a platform focused on safe transactions, clear seller onboarding, and buyer trust.",
    },
  ];

  const steps = [
    "Create your seller account",
    "Set up your store profile",
    "Upload your pet products",
    "Start receiving orders",
  ];

  const sellerTypes = [
    "Pet accessories sellers",
    "Pet grooming brands",
    "Pet food and treats vendors",
    "Small pet businesses",
    "Independent pet product creators",
    "Established pet stores",
  ];

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Top Nav */}
      <nav className="navbar navbar-expand-lg bg-white shadow-sm py-3">
        <Container>
          <div className="d-flex align-items-center">
            <img src={logo} alt="CuttyPaws" height="48" className="me-2" />
            <div>
              <div className="fw-bold fs-4 text-dark">CuttyPaws</div>
              <div className="small text-muted">Seller Center</div>
            </div>
          </div>

          <Button
            variant="success"
            className="rounded-pill px-4 fw-semibold"
            onClick={() => navigate("/seller-register-page")}
          >
            Start Selling <FaArrowRight className="ms-2" />
          </Button>
        </Container>
      </nav>

      {/* Hero */}
      <section className="py-5 py-lg-6 bg-white">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <div className="mb-3 text-success fw-semibold text-uppercase small">
                Sell on CuttyPaws
              </div>

              <h1 className="display-4 fw-bold mb-3 text-dark">
                Grow Your Pet Business With a Marketplace Built for Pet Lovers
              </h1>

              <p className="lead text-muted mb-4">
                Join CuttyPaws as a seller and list pet accessories, essentials,
                and other pet-focused products for customers who already love
                shopping and engaging in the pet community.
              </p>

              <div className="d-flex flex-wrap gap-3 mb-4">
                <Button
                  variant="success"
                  size="lg"
                  className="rounded-pill px-4 fw-semibold"
                  onClick={() => navigate("/seller-register-page")}
                >
                  Become a Seller <FaRocket className="ms-2" />
                </Button>

                <Button
                  variant="outline-dark"
                  size="lg"
                  className="rounded-pill px-4"
                  onClick={() => {
                    const section = document.getElementById("how-it-works");
                    if (section) section.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Learn More
                </Button>
              </div>

              <Row className="g-3">
                <Col sm={4}>
                  <div className="p-3 bg-light rounded-4 text-center h-100">
                    <FaPaw className="text-success mb-2" size={24} />
                    <div className="fw-semibold">Pet-Focused Audience</div>
                  </div>
                </Col>
                <Col sm={4}>
                  <div className="p-3 bg-light rounded-4 text-center h-100">
                    <FaTags className="text-success mb-2" size={24} />
                    <div className="fw-semibold">Simple Product Setup</div>
                  </div>
                </Col>
                <Col sm={4}>
                  <div className="p-3 bg-light rounded-4 text-center h-100">
                    <FaHeadset className="text-success mb-2" size={24} />
                    <div className="fw-semibold">Seller Support</div>
                  </div>
                </Col>
              </Row>
            </Col>

            <Col lg={6}>
              <div className="bg-success text-white rounded-4 shadow p-4 p-lg-5">
                <h3 className="fw-bold mb-4">Why sellers join CuttyPaws</h3>

                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-start">
                    <FaCheckCircle className="me-3 mt-1 flex-shrink-0" />
                    <div>
                      Reach pet owners in a niche marketplace environment
                    </div>
                  </div>

                  <div className="d-flex align-items-start">
                    <FaCheckCircle className="me-3 mt-1 flex-shrink-0" />
                    <div>
                      Showcase products in a platform designed around pets and
                      pet care
                    </div>
                  </div>

                  <div className="d-flex align-items-start">
                    <FaCheckCircle className="me-3 mt-1 flex-shrink-0" />
                    <div>
                      Build trust with a dedicated seller presence and product
                      visibility
                    </div>
                  </div>

                  <div className="d-flex align-items-start">
                    <FaCheckCircle className="me-3 mt-1 flex-shrink-0" />
                    <div>
                      Start with a straightforward registration flow and expand
                      your catalog over time
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Who Can Sell */}
      <section className="py-5">
        <Container>
          <Row className="justify-content-center mb-4">
            <Col lg={8} className="text-center">
              <h2 className="fw-bold mb-3">Who Can Sell on CuttyPaws?</h2>
              <p className="text-muted mb-0">
                CuttyPaws is designed for businesses and creators serving pet
                owners with quality products.
              </p>
            </Col>
          </Row>

          <Row className="g-3">
            {sellerTypes.map((type, index) => (
              <Col md={6} lg={4} key={index}>
                <div className="bg-white shadow-sm border rounded-4 p-4 h-100 d-flex align-items-center">
                  <FaPaw className="text-success me-3 flex-shrink-0" />
                  <span className="fw-semibold text-dark">{type}</span>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Features */}
      <section className="py-5 bg-white">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <h2 className="fw-bold mb-3">Everything You Need to Start Selling</h2>
              <p className="text-muted mb-0">
                CuttyPaws gives sellers the essentials to list, manage, and grow
                in a pet-centered marketplace.
              </p>
            </Col>
          </Row>

          <Row className="g-4">
            {features.map((feature, index) => (
              <Col md={6} lg={4} key={index}>
                <Card className="h-100 border-0 shadow-sm rounded-4">
                  <Card.Body className="p-4">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 mb-3"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <feature.icon className="text-success" size={24} />
                    </div>
                    <h4 className="h5 fw-bold">{feature.title}</h4>
                    <p className="text-muted mb-0">{feature.text}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-5">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <h2 className="fw-bold mb-3">How It Works</h2>
              <p className="text-muted mb-0">
                Get started in a few simple steps and prepare your store for
                customers.
              </p>
            </Col>
          </Row>

          <Row className="g-4">
            {steps.map((step, index) => (
              <Col md={6} lg={3} key={index}>
                <Card className="h-100 border-0 shadow-sm rounded-4 text-center">
                  <Card.Body className="p-4">
                    <div
                      className="mx-auto mb-3 rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold"
                      style={{ width: "56px", height: "56px", fontSize: "1.1rem" }}
                    >
                      {index + 1}
                    </div>
                    <h5 className="fw-bold">{step}</h5>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-5 bg-dark text-white">
        <Container className="text-center">
          <h2 className="fw-bold mb-3">Ready to Open Your Seller Account?</h2>
          <p className="lead text-light mb-4">
            Join CuttyPaws and start building your seller presence today.
          </p>
          <Button
            variant="success"
            size="lg"
            className="rounded-pill px-5 fw-semibold"
            onClick={() => navigate("/seller-register-page")}
          >
            Continue to Seller Registration <FaArrowRight className="ms-2" />
          </Button>
        </Container>
      </section>
    </div>
  );
};

export default SellerLanding;