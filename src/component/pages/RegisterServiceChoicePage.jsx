import { useNavigate } from "react-router-dom";
import { SERVICE_TYPES } from "../../utils/serviceProvider";
import "../../style/RegisterServiceChoice.css";

const featuredServices = [
  "PET_WALKER",
  "GROOMER",
  "VETERINARIAN",
  "PET_SITTER",
  "PET_DAYCARE",
  "PET_TRAINER",
];

export default function RegisterServiceChoicePage() {
  const navigate = useNavigate();

  const handleServiceSelect = (serviceType) => {
    navigate("/service-provider/register", { state: { serviceType } });
  };

  return (
    <div className="service-choice-page">
      <div className="service-choice-shell">
        <div className="service-choice-card">
          <div className="service-choice-header">
            <img src="/faveicon.png" alt="CuttyPaws paw" className="service-choice-logo" />
            <div>
              <p className="service-choice-eyebrow">Register Your Business</p>
              <h1>Choose what you want to join as</h1>
              <p className="service-choice-subtitle">
                Pick the registration flow that matches your business. Pet owners can keep using the standard account registration.
              </p>
            </div>
          </div>

          <div className="service-choice-grid">
            <button
              type="button"
              className="service-choice-option service-choice-option--seller"
              onClick={() => navigate("/seller-register-page")}
            >
              <span className="service-choice-badge">Marketplace</span>
              <h2>Seller</h2>
              <p>Open a product storefront to sell pet goods, accessories, food, or supplies.</p>
              <span className="service-choice-cta">Continue to seller registration</span>
            </button>

            <div className="service-choice-option service-choice-option--services">
              <span className="service-choice-badge">Service Provider</span>
              <h2>Pet Services</h2>
              <p>Apply as a provider such as a pet walker, groomer, vet, daycare, boarding business, or trainer.</p>

              <div className="service-choice-tags">
                {SERVICE_TYPES.filter((item) => featuredServices.includes(item.value)).map((service) => (
                  <button
                    key={service.value}
                    type="button"
                    className="service-choice-tag"
                    onClick={() => handleServiceSelect(service.value)}
                  >
                    {service.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="service-choice-main-cta"
                onClick={() => navigate("/service-provider/register")}
              >
                View all service provider options
              </button>
            </div>
          </div>

          <div className="service-choice-footer">
            <button type="button" className="service-choice-link" onClick={() => navigate("/register")}>
              Back to personal account registration
            </button>
            <button type="button" className="service-choice-link" onClick={() => navigate("/login")}>
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
