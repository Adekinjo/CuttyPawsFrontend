import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../style/DeliveryCarousel.css"; // Import the CSS file
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const DeliveryCarousel = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  // Settings for the carousel
  const settings = {
    dots: false, // Hide dots
    infinite: true, // Infinite loop
    speed: 500, // Transition speed
    slidesToShow: 5, // Show 5 items by default
    slidesToScroll: 1, // Scroll one item at a time
    arrows: false, // Hide arrows
    responsive: [
      {
        breakpoint: 1024, // For tablets
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768, // For mobile devices
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          swipeToSlide: true, // Enable swiping
        },
      },
      {
        breakpoint: 480, // For smaller mobile devices
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          swipeToSlide: true, // Enable swiping
        },
      },
    ],
  };

  // Data for the carousel items
  const carouselItems = [
    {
      id: 1,
      text: "FREE DELIVERY",
      path: "/free-delivery", // Path to navigate to
    },
    {
      id: 2,
      text: "PAYMENT ON DELIVERY",
      path: "/payment-on-delivery", // Path to navigate to
    },
    {
      id: 3,
      text: "FREE GET ROK",
      path: "/free-get-rok", // Path to navigate to
    },
    {
      id: 4,
      text: "CONTACT US",
      path: "/customer-support", // Path to navigate to
    },
    {
      id: 5,
      text: "LOYALTY",
      path: "/loyalty", // Path to navigate to
    },
  ];

  // Handle click event to navigate to the respective component
  const handleItemClick = (path) => {
    navigate(path);
  };

  return (
    <div className="delivery-carousel">
      <Slider {...settings}>
        {carouselItems.map((item) => (
          <div key={item.id} className="carousel-item" onClick={() => handleItemClick(item.path)}>
            <div className="text">{item.text}</div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default DeliveryCarousel;