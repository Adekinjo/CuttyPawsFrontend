import { NavLink } from "react-router-dom";
import "../../style/SecondNavbar.css"; // Import the updated CSS
import Location from "../pages/Location";

const SecondNavbar = () => {
  return (
    <nav className="second-navbar">
      {/* Location Component (Fixed on the left) */}
      <Location className="location" />

      {/* Container for scrollable links */}
      <div className="second-navbar-links-container">
        {/* Sell on AlabaOnline Link */}
        <NavLink
          to="/sellers-landing-page"
          className="sell-on-alabaonline"
          activeclassname="active"
        >
          Sell on Kinjomarket
        </NavLink>

        {/* Navigation Links */}
        <div className="second-navbar-links">
          {/* <NavLink to="/featured" activeclassname="active">
            Featured
          </NavLink> */}
          <NavLink to="/deals" activeclassname="active">
            Deals
          </NavLink>
          <NavLink to="/new-arrivals" activeclassname="active">
            New Arrivals
          </NavLink>
          <NavLink to="/trending" activeclassname="active">
            Trending
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default SecondNavbar;