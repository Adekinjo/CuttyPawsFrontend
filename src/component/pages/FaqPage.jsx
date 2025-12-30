
import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";

const FAQPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [{
    question: "How long does shipping take?",
    answer: "Shipping usually takes 3-5 business days within the US.",
  },
  {
    question: "What is your return policy?",
    answer: "You can return products within 30 days of purchase for a full refund.",
  },
  {
    question: "Do you offer international shipping?",
    answer: "Yes, we ship to most countries. International shipping takes 7-14 business days.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept credit/debit cards, PayPal, and Apple Pay.",
  },
  {
    question: "How can I track my order?",
    answer: "Once your order is shipped, you will receive a tracking number via email.",
  },
  {
    question: "Can I cancel my order after it has been placed?",
    answer: "Yes, you can cancel your order within 24 hours of placing it. After that, the order will be processed for shipping.",
  },
  {
    question: "Do you offer discounts or promotions?",
    answer: "Yes, we regularly offer discounts and promotions. Subscribe to our newsletter to stay updated!",
  },
  {
    question: "How do I create an account?",
    answer: "Click on the 'Sign Up' button at the top of the page and fill out the registration form.",
  },
  {
    question: "What should I do if I forget my password?",
    answer: "Click on the 'Forgot Password' link on the login page and follow the instructions to reset your password.",
  },
  {
    question: "Are my payment details secure?",
    answer: "Yes, we use SSL encryption to ensure your payment details are secure.",
  },
  {
    question: "Do you offer gift wrapping?",
    answer: "Yes, we offer gift wrapping for an additional fee. You can select this option during checkout.",
  },
  {
    question: "Can I change my shipping address after placing an order?",
    answer: "Yes, you can change your shipping address within 24 hours of placing the order. Contact our support team for assistance.",
  },
  {
    question: "What is your warranty policy?",
    answer: "We offer a 1-year warranty on all products. Please refer to the warranty card included with your purchase for details.",
  },
  {
    question: "How do I contact customer support?",
    answer: "You can contact our customer support team via email at support@example.com or call us at +1-800-123-4567.",
  },
  {
    question: "Do you have a physical store?",
    answer: "Yes, we have a physical store located at 123 Main Street, New York, NY. Visit us during business hours!",
  },];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <Container fluid className="faq-section py-5">
      <Row className="justify-content-center">
        <Col lg={8} className="text-center mb-5">
          <h2 className="display-4 mb-3 text-white">Frequently Asked Questions</h2>
          <p className="lead text-white-50">Find answers to common questions about Kinjomarket</p>
        </Col>
      </Row>
      
      <Row className="justify-content-center">
        <Col lg={8}>
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className={`card mb-3 shadow-sm ${activeIndex === index ? 'border-primary' : ''}`}
              style={{ transition: 'all 0.3s ease' }}
            >
              <div 
                className="card-header bg-white cursor-pointer"
                onClick={() => toggleFAQ(index)}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 text-dark">{faq.question}</h5>
                  <span className={`text-${activeIndex === index ? 'primary' : 'secondary'}`}>
                    <i className={`fas fa-${activeIndex === index ? 'minus' : 'plus'}`}></i>
                  </span>
                </div>
              </div>
              
              <div className={`card-body faq-answer ${activeIndex === index ? 'show' : ''}`}>
                <p className="mb-0 text-secondary">{faq.answer}</p>
              </div>
            </div>
          ))}
        </Col>
      </Row>
      <style jsx>{`
  .faq-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }
  
  .faq-answer {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-out;
    padding: 0 1.25rem;
  }
  
  .faq-answer.show {
    max-height: 500px;
    transition: max-height 0.5s ease-in;
    padding: 1.25rem;
  }
  
  .card {
    transition: transform 0.3s, box-shadow 0.3s;
  }
  
  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.15);
  }
  
  .cursor-pointer {
    cursor: pointer;
  }
`}</style>
    </Container>
  );
};

export default FAQPage;

// Add this CSS to your stylesheet
