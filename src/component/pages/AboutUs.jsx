import React from 'react';

const AboutUs = () => {
  return (
    <div className="container-fluid p-0">
      {/* Hero Section with Gradient Background */}
      <section className="hero-gradient py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h1 className="display-4 text-white mb-4">
                <i className="fas fa-shopping-bag me-3 bounce-icon"></i>
                Welcome to Kinjomarket
                <i className="fas fa-certificate ms-3 text-warning"></i>
              </h1>
              <p className="lead text-light opacity-75">
                Your one-stop destination for quality products and seamless shopping experiences.
              </p>
              <div className="mt-4">
                <button className="btn btn-light btn-lg rounded-pill me-3">
                  <i className="fas fa-award me-2"></i>Our Achievements
                </button>
                <button className="btn btn-outline-light btn-lg rounded-pill">
                  <i className="fas fa-video me-2"></i>Watch Video
                </button>
              </div>
            </div>
            <div className="col-md-6">
              <div className="position-relative">
                <img 
                  src="./kinjomarket.png" 
                  alt="Kinjomarket" 
                  className="img-fluid rounded-3 shadow-lg floating-image"
                />
                <div className="decorative-icons">
                  <i className="fas fa-star text-warning floating-icon-1"></i>
                  <i className="fas fa-heart text-danger floating-icon-2"></i>
                  <i className="fas fa-circle text-primary floating-icon-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Animated Icons */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5 display-5 fw-bold text-primary">
            <i className="fas fa-medal me-3"></i>
            Why Choose Us?
            <i className="fas fa-medal ms-3"></i>
          </h2>
          <div className="row g-4">
            {[
              {icon: 'fas fa-shipping-fast', title: 'Fast Delivery', text: 'Swift and reliable shipping to your doorstep'},
              {icon: 'fas fa-shield-alt', title: 'Secure Payments', text: '100% secure payment processing'},
              {icon: 'fas fa-headset', title: '24/7 Support', text: 'Round-the-clock customer service'},
              {icon: 'fas fa-undo', title: 'Easy Returns', text: 'Hassle-free return policy'},
              {icon: 'fas fa-percent', title: 'Daily Offers', text: 'Exciting discounts every day'},
              {icon: 'fas fa-gift', title: 'Rewards Program', text: 'Earn points with every purchase'},
            ].map((item, index) => (
              <div className="col-md-4 col-sm-6" key={index}>
                <div className="card h-100 border-0 shadow-sm hover-transform">
                  <div className="card-body text-center p-4">
                    <div className="icon-wrapper mb-3">
                      <i className={`${item.icon} fa-3x text-primary`}></i>
                    </div>
                    <h5 className="card-title fw-bold">{item.title}</h5>
                    <p className="card-text text-muted">{item.text}</p>
                    <i className="fas fa-chevron-circle-right text-primary mt-2"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section with Animated Globe */}
      <section className="bg-primary text-white py-5 position-relative overflow-hidden">
        <div className="container position-relative z-2">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h2 className="display-6 mb-4">
                <i className="fas fa-history me-3"></i>
                Our Story
              </h2>
              <p className="lead">
                Founded in 2023, Kinjomarket started with a simple idea: to create an e-commerce platform
                that prioritizes customer satisfaction above all else. Today, we're proud to serve millions
                of customers worldwide.
              </p>
              <div className="mt-4">
                <div className="d-flex gap-3">
                  <div className="stats-box bg-white text-primary p-3 rounded-3">
                    <h3 className="mb-0">1M+</h3>
                    <small>Happy Customers</small>
                  </div>
                  <div className="stats-box bg-white text-primary p-3 rounded-3">
                    <h3 className="mb-0">50+</h3>
                    <small>Countries Served</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="globe-animation">
                <i className="fas fa-globe-americas fa-10x text-white-50 spin-icon"></i>
                <div className="orbit-dots">
                  <div className="dot dot-1"></div>
                  <div className="dot dot-2"></div>
                  <div className="dot dot-3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section with Gradient Cards */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5 display-5 fw-bold text-primary">
            <i className="fas fa-heartbeat me-3"></i>
            Our Core Values
            <i className="fas fa-heartbeat ms-3"></i>
          </h2>
          <div className="row g-4">
            {[
              {icon: 'fas fa-users', title: 'Customer First', text: 'Our customers are at the heart of everything we do'},
              {icon: 'fas fa-leaf', title: 'Sustainability', text: 'Committed to eco-friendly practices'},
              {icon: 'fas fa-lightbulb', title: 'Innovation', text: 'Constantly evolving to serve you better'},
              {icon: 'fas fa-hand-holding-heart', title: 'Community', text: 'Supporting local businesses'},
              {icon: 'fas fa-chart-line', title: 'Growth', text: 'Continuous improvement mindset'},
              {icon: 'fas fa-balance-scale', title: 'Integrity', text: 'Ethical business practices'},
            ].map((item, index) => (
              <div className="col-md-4" key={index}>
                <div className="card h-100 border-0 gradient-card">
                  <div className="card-body text-center p-4">
                    <i className={`${item.icon} fa-3x text-white mb-3`}></i>
                    <h4 className="text-white">{item.title}</h4>
                    <p className="text-light mb-0">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add Custom Styles */}
      <style jsx>{`
        .hero-gradient {
          background: linear-gradient(135deg, #2b5876 0%, #4e4376 100%);
        }
        
        .floating-image {
          animation: float 3s ease-in-out infinite;
        }
        
        .bounce-icon {
          animation: bounce 2s infinite;
        }
        
        .spin-icon {
          animation: spin 20s linear infinite;
        }
        
        .hover-transform:hover {
          transform: translateY(-10px);
          transition: all 0.3s ease;
        }
        
        .gradient-card {
          background: linear-gradient(45deg, #4b6cb7 0%, #182848 100%);
          border-radius: 15px;
        }
        
        .decorative-icons {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        
        .floating-icon-1 {
          position: absolute;
          top: 10%;
          left: 5%;
          animation: float 3s ease-in-out infinite;
        }
        
        .floating-icon-2 {
          position: absolute;
          top: 70%;
          right: 10%;
          animation: float 4s ease-in-out infinite;
        }
        
        .floating-icon-3 {
          position: absolute;
          top: 40%;
          right: 5%;
          animation: float 5s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AboutUs;