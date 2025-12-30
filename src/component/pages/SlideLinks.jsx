import React from 'react';
import '../../style/SlideLink.css'; 

const SlidingLinks = () => {
  const links = [
    { id: 1, text: 'Deals', url: '/deals' },
    { id: 2, text: 'New Arrivals', url: '/new-arrivals' },
    { id: 3, text: 'Trending', url: '/trending' },
    { id: 5, text: 'Free Delivery', url: '/free-delivery' },
    { id: 6, text: 'Payment on Delivery', url: '/payment-on-delivery' },
    { id: 7, text: 'Free Get Rok', url: '/free-get-rok' },
    { id: 8, text: 'Loyalty', url: '/loyalty' },
    { id: 9, text: 'Contact Us', url: '/customer-support' },
    { id: 10, text: 'More', url: '/categories' },
  ];

  return (
    <div className="sliding-links-container">
      <div className="sliding-links">
        {links.map((link) => (
          <a key={link.id} href={link.url} className="sliding-link">
            {link.text}
          </a>
        ))}
      </div>
    </div>
  );
};

export default SlidingLinks;