// src/component/common/BackButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "../../style/BackButton.css";

const BackButton = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    // If there's history, go back, otherwise go to home
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <button 
      className="back-button"
      onClick={handleGoBack}
      aria-label="Go back to previous page"
    >
      <FaArrowLeft />
    </button>
  );
};

export default BackButton;