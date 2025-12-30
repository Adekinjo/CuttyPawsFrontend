import { useState } from "react";
import ApiService from "../../service/ApiService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faComment,
  faHeadset,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../style/CustomerSupport.css";

const CustomerSupport = () => {
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await ApiService.createInquiry(formData);
      alert("Inquiry submitted successfully!");
      console.log("Created Inquiry:", response);
      setFormData({ customerName: "", email: "", subject: "", message: "" }); // Clear form
    } catch (error) {
      console.error("Error submitting inquiry:", error);
    }
  };

  // Function to open WhatsApp chat
  const openWhatsAppChat = () => {
    const phoneNumber = "+2348135072306"; // Your WhatsApp number
    const url = `https://wa.me/${phoneNumber}`;
    window.open(url, "_blank"); // Opens WhatsApp in a new tab
  };

  return (
    <div className="support-page container my-5">
      <h1 className="text-center mb-4 support-title">
        <FontAwesomeIcon icon={faHeadset} className="me-2" />
        Report Your Complaint
      </h1>

      <div className="row justify-content-center">
        <div className="col-md-8">
          <form className="support-form p-4 shadow rounded" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div className="mb-3">
              <label htmlFor="customerName" className="form-label">
                <FontAwesomeIcon icon={faUser} className="me-2" />
                Your Name
              </label>
              <input
                type="text"
                id="customerName"
                placeholder="Enter your name"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                required
                className="form-control"
              />
            </div>

            {/* Email Field */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                Your Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="form-control"
              />
            </div>

            {/* Subject Field */}
            <div className="mb-3">
              <label htmlFor="subject" className="form-label">
                <FontAwesomeIcon icon={faComment} className="me-2" />
                Subject
              </label>
              <input
                type="text"
                id="subject"
                placeholder="Enter the subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                required
                className="form-control"
              />
            </div>

            {/* Message Field */}
            <div className="mb-3">
              <label htmlFor="message" className="form-label">
                <FontAwesomeIcon icon={faComment} className="me-2" />
                Complaint/Message
              </label>
              <textarea
                id="message"
                placeholder="Enter your complaint or message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                required
                className="form-control"
                rows="5"
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary w-100">
              <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
              Submit
            </button>
          </form>
        </div>
      </div>

      {/* WhatsApp Chat Button */}
      <div className="text-center mt-4">
        <button className="btn btn-success btn-lg" onClick={openWhatsAppChat}>
          <FontAwesomeIcon icon={faHeadset} className="me-2" />
          Chat with Support on WhatsApp
        </button>
      </div>
    </div>
  );
};

export default CustomerSupport;