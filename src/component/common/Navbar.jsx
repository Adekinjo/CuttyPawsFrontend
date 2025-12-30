import "bootstrap/dist/css/bootstrap.min.css";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaBell,
  FaHome,
  FaPaw,
  FaShoppingBag,
  FaShoppingCart,
  FaUser,
} from "react-icons/fa";
import { useCart } from "../context/CartContext";
import ApiService from "../../service/AuthService";
import "../../style/Navbar.css";

const Navbar = () => {
  const { cart } = useCart();
  const navigate = useNavigate();
  const isAuthenticated = ApiService.isAuthenticated();

  const totalItemsInCart = cart.reduce((total, item) => total + item.quantity, 0);

  const handleProfileClick = () => {
    navigate(isAuthenticated ? "/customer-profile" : "/login");
  };

  const handleNotificationsClick = () => {
    navigate(isAuthenticated ? "/notifications" : "/login");
  };

  return (
    <nav className="navbar-cuttypaws">
      <div className="cutty-nav-inner">
        <NavLink to="/" className="cutty-brand" aria-label="CuttyPaws Home">
          <span className="cutty-brand-badge" aria-hidden="true">
            <FaPaw />
          </span>
          <span className="cutty-brand-text">CuttyPaws</span>
        </NavLink>


        <div className="cutty-nav-actions">
          <NavIcon to="/categories" label="Shop" icon={<FaShoppingBag />} />
          <NavIcon
            to="/cart-view"
            label="Cart"
            icon={<FaShoppingCart />}
            badge={totalItemsInCart}
          />
          <button
            type="button"
            className="cutty-icon-btn"
            onClick={handleNotificationsClick}
            aria-label="Notifications"
          >
            <FaBell />
            {isAuthenticated && <span className="cutty-dot" />}
          </button>
          <button
            type="button"
            className="cutty-profile-btn"
            onClick={handleProfileClick}
            aria-label={isAuthenticated ? "Profile" : "Login"}
          >
            <FaUser />
          </button>
        </div>
      </div>
    </nav>
  );
};

const NavPill = ({ to, label, icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `cutty-nav-pill ${isActive ? "active" : ""}`
    }
    aria-label={label}
  >
    <span className="cutty-nav-icon" aria-hidden="true">
      {icon}
    </span>
    <span className="cutty-nav-label d-none d-sm-inline">{label}</span>
  </NavLink>
);

const NavIcon = ({ to, label, icon, badge }) => (
  <NavLink
    to={to}
    className="cutty-icon-btn cutty-link-btn"
    aria-label={label}
  >
    {icon}
    {badge > 0 && (
      <span className="cutty-nav-badge" aria-label={`${badge} items in cart`}>
        {badge}
      </span>
    )}
  </NavLink>
);

export default Navbar;















// import 'bootstrap/dist/css/bootstrap.min.css';
// import { useState, useCallback, useEffect, useRef } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import { FaSearch, FaShoppingCart, FaUserCircle, FaBox, FaTags, FaLayerGroup } from "react-icons/fa";
// import { useCart } from "../context/CartContext";
// import ApiService from "../../service/AuthService";
// import VoiceSearch from "../pages/VoiceSearch";
// import { debounce } from 'lodash';
// import Location from "../pages/Location";
// import Logo from "../../images/logo.png";

// const Navbar = () => {
//   const [searchValue, setSearchValue] = useState("");
//   const [suggestions, setSuggestions] = useState([]);
//   const [isInputFocused, setIsInputFocused] = useState(false);
//   const [userId, setUserId] = useState(null);
//   const { cart } = useCart();
//   const navigate = useNavigate();

//   const isAdmin = ApiService.isAdmin();
//   const isSupport = ApiService.isSupport();
//   const isCompany = ApiService.isCompany();
//   const isAuthenticated = ApiService.isAuthenticated();
//   const navbarToggleRef = useRef(null);
//   const navbarCollapseRef = useRef(null);

//   // User info fetch
//   useEffect(() => {
//     const fetchUserInfo = async () => {
//       if (isAuthenticated) {
//         try {
//           const userInfo = await ApiService.getLoggedInInfo();
//           setUserId(userInfo.user?.id);
//         } catch (err) {
//           console.error("Error fetching user info:", err);
//         }
//       }
//     };
//     fetchUserInfo();
//   }, [isAuthenticated]);

//   // Debounced search suggestions
//   const fetchSuggestions = useCallback(
//     debounce(async (query) => {
//       if (query.length < 2) {
//         setSuggestions([]);
//         return;
//       }
//       try {
//         const result = await ApiService.getSearchSuggestions(query);
//         setSuggestions(result || []);
//       } catch (error) {
//         console.error("Error fetching suggestions:", error);
//         setSuggestions([]);
//       }
//     }, 300),
//     []
//   );

//   // Suggestion click handler
//   const handleSuggestionClick = (suggestion) => {
//     if (!suggestion?.id || !suggestion?.type) return;

//     switch (suggestion.type) {
//       case 'product':
//         navigate(`/product/${suggestion.category?.toLowerCase()}/${suggestion.subCategory?.toLowerCase()}/${suggestion.name.toLowerCase()}/dp/${suggestion.id}`);
//         break;
//       case 'category':
//         navigate(`/category/${suggestion.id}`);
//         break;
//       case 'subcategory':
//         navigate(`/products-sub-category/${suggestion.id}`);
//         break;
//       default:
//         console.warn('Unknown suggestion type:', suggestion.type);
//     }
//     setSearchValue("");
//     setSuggestions([]);
//     closeNavbar(); // Close navbar on suggestion click
//   };

//   // Search input handlers
//   const handleSearchChange = (e) => {
//     const value = e.target.value;
//     setSearchValue(value);
//     fetchSuggestions(value);
//   };

//   const handleVoiceSearch = async (transcript) => {
//     setSearchValue(transcript);
    
//     // Clear any previous suggestions
//     setSuggestions([]);
    
//     // Use setTimeout to ensure state updates complete before navigation
//     setTimeout(() => {
//       if (transcript && transcript.trim()) {
//         const searchQuery = transcript.trim();
        
//         // Navigate to search page
//         navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
        
//         // Close mobile navbar
//         closeNavbar();
//       }
//     }, 100);
//   };

//   // Search submission
//   const handleSearchSubmit = async (e) => {
//     e.preventDefault();
//     if (!searchValue.trim()) return;

//     try {
//       navigate(`/search?query=${encodeURIComponent(searchValue.trim())}`);
//       setSuggestions([]);
//       closeNavbar(); // Close navbar on search submit
//     } catch (error) {
//       console.error("Search error:", error);
//     }
//   };

//   // Navigation helpers
//   const handleLogout = () => {
//     if (window.confirm("Are you sure you want to logout?")) {
//       ApiService.logout();
//       navigate("/", { replace: true });
//     }
//   };

//   // Close navbar function
//   const closeNavbar = () => {
//     if (navbarCollapseRef.current && window.innerWidth < 992) {
//       // Use Bootstrap's collapse method to hide the navbar
//       const bsCollapse = new window.bootstrap.Collapse(navbarCollapseRef.current, {
//         toggle: false
//       });
//       bsCollapse.hide();
//     }
//   };

//   // Handle nav link click
//   const handleNavLinkClick = (onClick) => {
//     return () => {
//       closeNavbar();
//       if (onClick) onClick();
//     };
//   };

//   const totalItemsInCart = cart.reduce((total, item) => total + item.quantity, 0);

//   return (
//     <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top">
//       <div className="container-fluid">
//         {/* Mobile Header */}
//         <div className="d-flex d-lg-none justify-content-between align-items-center w-100 mb-2">
//           <NavLink to="/" className="navbar-brand" onClick={closeNavbar}>
//             <img src={Logo} alt="kinjomarket" height="40" />
//           </NavLink>

//           {/* Location Component (Mobile Only) */}
//           <div className="d-flex align-items-center gap-3">
//             <Location />
//           </div>

//           <div className="d-flex align-items-center gap-3">
//             <NavLink to="/cart-view" className="position-relative" onClick={closeNavbar}>
//               <FaShoppingCart size={24} />
//               {totalItemsInCart > 0 && (
//                 <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
//                   {totalItemsInCart}
//                 </span>
//               )}
//             </NavLink>

//             <button
//               ref={navbarToggleRef}
//               className="navbar-toggler"
//               type="button"
//               data-bs-toggle="collapse"
//               data-bs-target="#navbarContent"
//               aria-controls="navbarContent"
//               aria-expanded="false"
//               aria-label="Toggle navigation"
//             >
//               <span className="navbar-toggler-icon"></span>
//             </button>
//           </div>
//         </div>

//         {/* Desktop Logo */}
//         <NavLink to="/" className="navbar-brand d-none d-lg-block order-lg-0 me-3">
//           <img src={Logo} alt="Kinjomarket" height="40" />
//         </NavLink>

//         {/* Search Bar */}
//         <div className="order-lg-1 flex-grow-1 mb-2 mb-lg-0">
//           <form className="d-flex position-relative" onSubmit={handleSearchSubmit}>
//             <div className="input-group">
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Search products, brands and categories"
//                 value={searchValue}
//                 onChange={handleSearchChange}
//                 onFocus={() => setIsInputFocused(true)}
//                 onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
//                 aria-label="Search products"
//               />
//               <button className="btn btn-outline-secondary" type="submit">
//                 <FaSearch />
//               </button>
//               <div className="btn btn-outline-secondary">
//                 <VoiceSearch onSearch={handleVoiceSearch} />
//               </div>
//             </div>

//             {/* Search Suggestions */}
//             {suggestions.length > 0 && isInputFocused && (
//               <div className="position-absolute top-100 start-0 w-100 bg-white border rounded shadow-sm mt-1 z-3">
//                 {suggestions.map((suggestion, index) => (
//                   <div
//                     key={`${suggestion.type}-${suggestion.id}-${index}`}
//                     className="p-2 hover-bg-light cursor-pointer d-flex align-items-center gap-2 text-truncate"
//                     onClick={() => handleSuggestionClick(suggestion)}
//                     onMouseDown={(e) => e.preventDefault()} // Prevent input blur
//                   >
//                     <div className="text-secondary">
//                       {suggestion.type === 'product' && <FaBox className="ms-1" />}
//                       {suggestion.type === 'category' && <FaTags className="ms-1" />}
//                       {suggestion.type === 'subcategory' && <FaLayerGroup className="ms-1" />}
//                     </div>
                    
//                     {suggestion.type === 'product' && (
//                       <img
//                         src={suggestion.imageUrl || '/placeholder-product.jpg'}
//                         alt={suggestion.name}
//                         className="suggestion-thumbnail"
//                         style={{ width: '40px', height: '40px', objectFit: 'cover' }}
//                       />
//                     )}

//                     <div className="flex-grow-1">
//                       <div className="d-flex justify-content-between align-items-center">
//                         <span className="text-truncate">{suggestion.name}</span>
//                         <span className="badge bg-secondary text-capitalize ms-2">
//                           {suggestion.type}
//                         </span>
//                       </div>
//                       {suggestion.type === 'subcategory' && (
//                         <div className="text-muted small text-truncate">
//                           in {suggestion.parentCategory || 'Uncategorized'}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </form>
//         </div>

//         {/* Navigation Links */}
//         <div 
//           className="collapse navbar-collapse order-lg-2" 
//           id="navbarContent"
//           ref={navbarCollapseRef}
//         >
//           <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
//             <NavItem to="/" label="Home" onClick={handleNavLinkClick(closeNavbar)} />
//             <NavItem to="/accessories" label="Accessories" onClick={handleNavLinkClick(closeNavbar)} />
//             <NavItem to="/categories" label="Categories" onClick={handleNavLinkClick(closeNavbar)} />

//             {isAuthenticated && (
//               <NavItem 
//                 to="/customer-profile" 
//                 label={<><FaUserCircle className="me-1" />Profile</>} 
//                 onClick={handleNavLinkClick(closeNavbar)}
//               />
//             )}

//             {isAdmin && <NavItem to="/admin" label="Admin" onClick={handleNavLinkClick(closeNavbar)} />}
//             {isSupport && <NavItem to="/support" label="Support" onClick={handleNavLinkClick(closeNavbar)} />}
//             {isCompany && <NavItem to="/company/company-dashboard" label="Seller" onClick={handleNavLinkClick(closeNavbar)} />}

//             {!isAuthenticated ? (
//               <NavItem to="/login" label="Login" onClick={handleNavLinkClick(closeNavbar)} />
//             ) : (
//               <li className="nav-item">
//                 <button
//                   className="nav-link border-0 bg-transparent"
//                   onClick={handleNavLinkClick(handleLogout)}
//                 >
//                   Logout
//                 </button>
//               </li>
//             )}
//           </ul>
//         </div>

//         {/* Desktop Cart */}
//         <NavLink
//           to="/cart-view"
//           className="position-relative d-none d-lg-block order-lg-3 ms-3"
//         >
//           <FaShoppingCart size={24} />
//           {totalItemsInCart > 0 && (
//             <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
//               {totalItemsInCart}
//             </span>
//           )}
//         </NavLink>
//       </div>
//     </nav>
//   );
// };

// // Reusable NavItem component
// const NavItem = ({ to, label, onClick, activeclassname = "active" }) => (
//   <li className="nav-item">
//     <NavLink
//       to={to}
//       className="nav-link"
//       activeclassname={activeclassname}
//       onClick={onClick}
//     >
//       {label}
//     </NavLink>
//   </li>
// );

// export default Navbar;