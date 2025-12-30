import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGem, faCoins, faMedal, faGift, faStar, faTicketAlt, 
  faUserPlus, faCheckCircle, faShoppingBag, faTruck, 
  faCrown, faShieldAlt, faRocket, faBirthdayCake, 
  faHandHoldingHeart, faCommentsDollar, faChartLine
} from '@fortawesome/free-solid-svg-icons';
import HomeAppliance from '../pages/HomeAppliance';
import RecentView from '../pages/RecentView';

const Loyalty = () => {
  const [points, setPoints] = useState(2450);
  const [referralCode] = useState('SHOP123');
  const [copied, setCopied] = useState(false);

  const tiers = [
    { 
      name: 'Silver', 
      icon: faShieldAlt,
      color: '#C0C0C0',
      minPoints: 0, 
      benefits: ['5% Discount', 'Basic Rewards', 'Monthly Draw Entry'] 
    },
    { 
      name: 'Gold', 
      icon: faMedal,
      color: '#FFD700',
      minPoints: 1000, 
      benefits: ['10% Discount', 'Free Shipping', 'Exclusive Offers', 'Priority Support'] 
    },
    { 
      name: 'Platinum', 
      icon: faCrown,
      color: '#00CED1',
      minPoints: 2500, 
      benefits: ['15% Discount', 'VIP Support', 'Early Access', 'Birthday Gift', 'Personal Shopper'] 
    }
  ];

  const currentTier = tiers.find(tier => points >= tier.minPoints && points < (tiers[tiers.indexOf(tier) + 1]?.minPoints || Infinity));
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const progress = nextTier ? ((points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100 : 100;

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container my-5">
      {/* Main Card */}
      <div className="card shadow-lg border-0 overflow-hidden">
        {/* Animated Header */}
        <div className="card-header py-4 text-center position-relative" 
             style={{ 
               background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
               overflow: 'hidden'
             }}>
          <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10"
               style={{ background: `url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}></div>
          <h2 className="mb-0 text-black display-5 fw-bold ">
            <FontAwesomeIcon icon={faGem} className="me-3 animate__animated animate__pulse " />
            Premium Rewards Program
            <FontAwesomeIcon icon={faCrown} className="ms-3 animate__animated animate__pulse" />
          </h2>
          <div className="mt-3">
            <span className="badge bg-warning text-dark fs-6 shadow-sm">
              <FontAwesomeIcon icon={faRocket} className="me-2" />
              Level Up Your Rewards!
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="card-body position-relative">
          {/* Floating Points Display */}
          <div className="position-absolute top-0 end-0 m-3">
            <div className="d-flex align-items-center bg-white p-3 rounded-3 shadow-sm">
              <FontAwesomeIcon icon={faCoins} className="fa-xl text-warning me-2" />
              <div>
                <div className="text-muted small">Available Points</div>
                <div className="h4 mb-0 fw-bold text-dark">{points.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Tier Progress Section */}
          <div className="row mb-5 g-4">
            <div className="col-lg-8">
              <div className="card h-100 border-0 shadow-sm tier-card">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <FontAwesomeIcon 
                      icon={currentTier.icon} 
                      className={`fa-3x me-3`} 
                      style={{ color: currentTier.color }}
                    />
                    <div>
                      <h3 className="mb-1">{currentTier.name} Tier</h3>
                      <div className="text-muted">Member since 2023</div>
                    </div>
                  </div>
                  
                  <div className="progress mb-4" style={{ height: '25px', borderRadius: '15px' }}>
                    <div 
                      className="progress-bar progress-bar-striped progress-bar-animated" 
                      role="progressbar" 
                      style={{ 
                        width: `${progress}%`,
                        background: `linear-gradient(90deg, ${currentTier.color} 0%, ${nextTier?.color || currentTier.color} 100%)`,
                        boxShadow: `0 0 15px ${currentTier.color}33`
                      }}
                    >
                      <span className="h5 mb-0">{Math.floor(progress)}% Complete</span>
                    </div>
                  </div>

                  {nextTier ? (
                    <div className="alert alert-info d-flex align-items-center">
                      <FontAwesomeIcon icon={faChartLine} className="fa-xl me-3" />
                      <div>
                        <strong>Next Tier:</strong> {nextTier.name} - Earn {(nextTier.minPoints - points).toLocaleString()} more points
                      </div>
                    </div>
                  ) : (
                    <div className="alert alert-success d-flex align-items-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="fa-xl me-3" />
                      Congratulations! You've reached the highest tier!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tier Benefits */}
            <div className="col-lg-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0"><FontAwesomeIcon icon={faCheckCircle} className="me-2" />Your Benefits</h5>
                </div>
                <div className="card-body">
                  <ul className="list-unstyled">
                    {currentTier.benefits.map((benefit, index) => (
                      <li key={index} className="mb-3 d-flex align-items-center">
                        <span className="badge bg-success me-2 p-2">
                          <FontAwesomeIcon icon={faCheckCircle} />
                        </span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Earning Opportunities */}
          <div className="row mb-5 g-4">
            <div className="col-12">
              <h4 className="text-center mb-4">
                <FontAwesomeIcon icon={faHandHoldingHeart} className="me-2 text-primary" />
                Boost Your Points
              </h4>
            </div>
            {[
              { icon: faShoppingBag, title: 'Shopping', points: '₦100 = 10 Points', color: 'primary' },
              { icon: faUserPlus, title: 'Refer Friends', points: '500 Points Each', color: 'success' },
              { icon: faBirthdayCake, title: 'Birthday Bonus', points: '1000 Points', color: 'danger' },
              { icon: faCommentsDollar, title: 'Social Engagement', points: 'Up to 300 Points', color: 'warning' }
            ].map((item, index) => (
              <div key={index} className="col-md-3">
                <div className={`card h-100 border-0 shadow-sm hover-effect bg-${item.color}-subtle`}>
                  <div className="card-body text-center p-4">
                    <FontAwesomeIcon 
                      icon={item.icon} 
                      className={`fa-3x mb-3 text-${item.color}`} 
                    />
                    <h5 className="mb-2">{item.title}</h5>
                    <div className={`badge bg-${item.color} text-white`}>{item.points}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Rewards Catalog */}
          <div className="row mb-5 g-4">
            <div className="col-12">
              <h4 className="text-center mb-4">
                <FontAwesomeIcon icon={faGift} className="me-2 text-danger" />
                Premium Rewards
              </h4>
            </div>
            {[
              { title: '₦500 Voucher', points: '5,000', icon: faTicketAlt, color: 'success' },
              { title: 'Free Shipping', points: '2,500', icon: faTruck, color: 'primary' },
              { title: 'VIP Experience', points: '10,000', icon: faGem, color: 'warning' },
              { title: 'Charity Donation', points: '7,500', icon: faHandHoldingHeart, color: 'info' }
            ].map((reward, index) => (
              <div key={index} className="col-md-3">
                <div className="card h-100 border-0 shadow-lg hover-effect">
                  <div className="card-body text-center p-4">
                    <div className={`icon-wrapper bg-${reward.color}-subtle p-3 rounded-circle mb-3`}>
                      <FontAwesomeIcon 
                        icon={reward.icon} 
                        className={`fa-2x text-${reward.color}`} 
                      />
                    </div>
                    <h5 className={`text-${reward.color}`}>{reward.title}</h5>
                    <div className="text-muted mb-3">{reward.points} Points</div>
                    <button className={`btn btn-outline-${reward.color} w-100`}>
                      Redeem Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Referral Section */}
          <div className="row">
            <div className="col-lg-8 offset-lg-2">
              <div className="card border-0 shadow-lg bg-gradient-referral">
                <div className="card-body text-center p-5">
                  <h3 className="mb-4">
                    <FontAwesomeIcon icon={faUserPlus} className="me-3 text-white" />
                    <span className="text-white">Invite Friends & Earn More</span>
                  </h3>
                  <div className="input-group mb-3 w-75 mx-auto">
                    <input
                      type="text"
                      className="form-control form-control-lg border-0"
                      value={referralCode}
                      readOnly
                      style={{ borderRadius: '15px 0 0 15px' }}
                    />
                    <button 
                      className={`btn ${copied ? 'btn-success' : 'btn-light'} btn-lg border-0`}
                      onClick={copyReferralCode}
                      style={{ borderRadius: '0 15px 15px 0' }}
                    >
                      {copied ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                  <p className="text-white opacity-75 mb-0">
                    Earn 500 points for each successful referral • Limited time offer!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5"><HomeAppliance /></div>
      <div className="mt-4"><RecentView /></div>

      <style jsx>{`
        .tier-card {
          background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
          border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.05);
        }
        
        .hover-effect {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .hover-effect:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        
        .bg-gradient-referral {
          background: linear-gradient(135deg, #00b09b 0%, #96c93d 100%);
          border-radius: 20px;
          overflow: hidden;
        }
        
        .progress-bar-animated {
          animation: progress-glow 1.5s ease-in-out infinite alternate;
        }
        
        @keyframes progress-glow {
          from { box-shadow: 0 0 10px ${currentTier.color}33; }
          to { box-shadow: 0 0 20px ${currentTier.color}66; }
        }
        
        .icon-wrapper {
          transition: transform 0.3s ease;
        }
        
        .hover-effect:hover .icon-wrapper {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default Loyalty;