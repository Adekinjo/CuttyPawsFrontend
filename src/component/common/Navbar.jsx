import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaPlus,
  FaSearch,
  FaSignInAlt,
  FaShoppingCart,
  FaUserCircle,
  FaBell,
  FaBox,
  FaTags,
  FaLayerGroup
} from "react-icons/fa";

import { useCart } from "../context/CartContext";
import ApiService from "../../service/AuthService";
import VoiceSearch from "../pages/VoiceSearch";
import ProductService from "../../service/ProductService";
import NotificationService from "../../service/NotificationService";
import { debounce } from 'lodash';
import "../../style/Navbar.css";
import logo from "../../images/Logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const navbarCollapseRef = useRef(null);

  // Search state from first navbar
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [userId, setUserId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNavOpen, setIsNavOpen] = useState(false);

  const isAuthenticated = ApiService.isAuthenticated();
  const isAdmin = ApiService.isAdmin();
  const isSupport = ApiService.isSupport();
  const isCompany = ApiService.isCompany();

  const totalItemsInCart = useMemo(
    () => cart.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [cart]
  );

  // User info fetch from first navbar
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (isAuthenticated) {
        try {
          const userInfo = await ApiService.getLoggedInInfo();
          setUserId(userInfo.user?.id);
        } catch (err) {
          console.error("Error fetching user info:", err);
        }
      }
    };
    fetchUserInfo();
  }, [isAuthenticated]);

  useEffect(() => {
    let isMounted = true;

    const fetchUnreadCount = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await NotificationService.getUnreadCount();
        const count =
          typeof res === "number"
            ? res
            : res?.unreadCount || res?.count || res?.totalComments || 0;
        if (isMounted) setUnreadCount(count);
      } catch (err) {
        console.error("Error fetching unread notifications:", err);
      }
    };

    if (isAuthenticated) {
      fetchUnreadCount();
      NotificationService.connect((notification) => {
        if (!isMounted) return;
        if (typeof notification?.unreadCount === "number") {
          setUnreadCount(notification.unreadCount);
        } else {
          setUnreadCount((prev) => prev + 1);
        }
      });
    } else {
      setUnreadCount(0);
      NotificationService.disconnect();
    }

    return () => {
      isMounted = false;
      NotificationService.disconnect();
    };
  }, [isAuthenticated]);

  // Debounced search suggestions from first navbar
  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const result = await ProductService.getSearchSuggestions(query);
        setSuggestions(result || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      }
    }, 300),
    []
  );

  // Suggestion click handler from first navbar
  const handleSuggestionClick = (suggestion) => {
    if (!suggestion?.id || !suggestion?.type) return;

    switch (suggestion.type) {
      case 'product':
        navigate(`/product/${suggestion.category?.toLowerCase()}/${suggestion.subCategory?.toLowerCase()}/${suggestion.name.toLowerCase()}/dp/${suggestion.id}`);
        break;
      case 'category':
        navigate(`/category/${suggestion.id}`);
        break;
      case 'subcategory':
        navigate(`/products-sub-category/${suggestion.id}`);
        break;
      default:
        console.warn('Unknown suggestion type:', suggestion.type);
    }
    setSearchValue("");
    setSuggestions([]);
    closeNavbar();
  };

  // Search input handlers from first navbar
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    fetchSuggestions(value);
  };

  // Voice search handler from first navbar
  const handleVoiceSearch = async (transcript) => {
    setSearchValue(transcript);
    
    setSuggestions([]);
    
    setTimeout(() => {
      if (transcript && transcript.trim()) {
        const searchQuery = transcript.trim();
        navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
        closeNavbar();
      }
    }, 100);
  };

  // Search submission (updated with suggestions clearing)
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    try {
      navigate(`/search?query=${encodeURIComponent(searchValue.trim())}`);
      setSuggestions([]);
      closeNavbar();
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const closeNavbar = () => {
    if (window.innerWidth < 992) {
      setIsNavOpen(false);
    }
  };

  const toggleNavbar = () => {
    setIsNavOpen((prev) => !prev);
  };

  const handleLogout = () => {
    if (!window.confirm("Logout?")) return;
    ApiService.logout();
    closeNavbar();
    navigate("/");
  };

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate("/create-post");
  };

  // Handle nav link click (for closing navbar)
  const handleNavLinkClick = (onClick) => {
    return () => {
      closeNavbar();
      if (onClick) onClick();
    };
  };

  const mobileRoleLink = isAdmin
    ? { to: "/admin", label: "Admin", icon: <FaUserCircle /> }
    : isSupport
      ? { to: "/support", label: "Support", icon: <FaUserCircle /> }
      : isCompany
        ? { to: "/company/company-dashboard", label: "Seller", icon: <FaUserCircle /> }
        : null;

  return (
    <>
    <nav className="navbar navbar-expand-lg cutty-navbar sticky-top">
      <div className="container-fluid">
        {/* ===== Mobile Header ===== */}
        <div className="d-flex d-lg-none justify-content-between align-items-center w-100 cutty-mobile-header">
          <NavLink to="/" className="cutty-brand" onClick={closeNavbar}>
            <img className="cutty-brand-logo" src={logo} alt="CuttyPaws" />
          </NavLink>

          <div className="cutty-mobile-header-actions">
            {mobileRoleLink && (
              <NavLink to={mobileRoleLink.to} className="cutty-icon-btn" onClick={closeNavbar}>
                {mobileRoleLink.icon}
              </NavLink>
            )}

            <NavLink to="/cart-view" className="cutty-icon-btn position-relative" onClick={closeNavbar}>
              <FaShoppingCart />
              {totalItemsInCart > 0 && (
                <span className="cutty-nav-badge">{totalItemsInCart}</span>
              )}
            </NavLink>
          </div>
        </div>

        {/* ===== Desktop Brand ===== */}
        <NavLink to="/" className="cutty-brand d-none d-lg-flex me-3">
          <img className="cutty-brand-logo" src={logo} alt="CuttyPaws" />
        </NavLink>

        {/* ===== UPDATED: Search with suggestions dropdown ===== */}
        <div className="order-lg-1 flex-grow-1 mb-0 cutty-search-wrap">
          <form className="d-flex position-relative cutty-search-form" onSubmit={handleSearchSubmit}>
            <div className="input-group cutty-search-shell">
              <input
                type="text"
                className="form-control cutty-search-input"
                placeholder="Search products, pets or posts..."
                value={searchValue}
                onChange={handleSearchChange}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                aria-label="Search products"
              />
              <button className="btn btn-outline-secondary cutty-search-action cutty-search-submit" type="submit" aria-label="Search">
                <FaSearch />
              </button>
              <div className="btn btn-outline-secondary cutty-search-action cutty-search-voice" aria-hidden="true">
                <VoiceSearch onSearch={handleVoiceSearch} />
              </div>
            </div>

            {/* Search Suggestions */}
            {suggestions.length > 0 && isInputFocused && (
              <div className="position-absolute top-100 start-0 w-100 cutty-search-suggestions z-3">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.type}-${suggestion.id}-${index}`}
                    className="cutty-suggestion-item d-flex align-items-center gap-2 text-truncate"
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div className="cutty-suggestion-icon">
                      {suggestion.type === 'product' && <FaBox className="ms-1" />}
                      {suggestion.type === 'category' && <FaTags className="ms-1" />}
                      {suggestion.type === 'subcategory' && <FaLayerGroup className="ms-1" />}
                    </div>
                    
                    {suggestion.type === 'product' && (
                      <img
                        src={suggestion.imageUrl || '/placeholder-product.jpg'}
                        alt={suggestion.name}
                        className="suggestion-thumbnail cutty-suggestion-thumbnail"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      />
                    )}

                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-truncate">{suggestion.name}</span>
                        <span className="badge cutty-suggestion-badge text-capitalize ms-2">
                          {suggestion.type}
                        </span>
                      </div>
                      {suggestion.type === 'subcategory' && (
                        <div className="text-muted small text-truncate">
                          in {suggestion.parentCategory || 'Uncategorized'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* ===== Links ===== */}
        <div
          className={`collapse navbar-collapse order-lg-2${isNavOpen ? " show" : ""}`}
          id="navbarContent"
          ref={navbarCollapseRef}
        >
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            {/* "Shop" text is now visible on all screen sizes */}
            <NavItem to="/categories" label="Shop" onClick={handleNavLinkClick(closeNavbar)} />

            {isAuthenticated && (
              <NavItem
                to="/customer-profile"
                label={<><FaUserCircle /> Profile</>}
                onClick={handleNavLinkClick(closeNavbar)}
              />
            )}

            {isAdmin && <NavItem to="/admin" label="Admin" onClick={handleNavLinkClick(closeNavbar)} />}
            {isSupport && <NavItem to="/support" label="Support" onClick={handleNavLinkClick(closeNavbar)} />}
            {isCompany && <NavItem to="/company/company-dashboard" label="Seller" onClick={handleNavLinkClick(closeNavbar)} />}

            {!isAuthenticated ? (
              <NavItem to="/login" label="Login" onClick={handleNavLinkClick(closeNavbar)} />
            ) : (
              <li className="nav-item">
                <button className="nav-link" onClick={handleNavLinkClick(handleLogout)}>Logout</button>
              </li>
            )}
          </ul>
        </div>

        {/* ===== Desktop Icons ===== */}
        <div className="d-none d-lg-flex align-items-center gap-3 ms-3">
          {isAuthenticated && (
            <button
              className="cutty-icon-btn position-relative"
              onClick={() => navigate("/notifications")}
            >
              <FaBell />
              {unreadCount > 0 && (
                <span className="cutty-nav-badge">{unreadCount}</span>
              )}
            </button>
          )}

          <NavLink to="/cart-view" className="cutty-icon-btn position-relative" onClick={closeNavbar}>
            <FaShoppingCart />
            {totalItemsInCart > 0 && (
              <span className="cutty-nav-badge">{totalItemsInCart}</span>
            )}
          </NavLink>
        </div>
      </div>
    </nav>

    <div
      className={`cutty-mobile-bottom-nav d-lg-none ${
        "cutty-mobile-bottom-nav--five"
      }`}
    >
      <NavLink to="/" className="cutty-mobile-bottom-nav__item" onClick={closeNavbar}>
        <FaHome />
        <span>Home</span>
      </NavLink>

      <NavLink to="/categories" className="cutty-mobile-bottom-nav__item" onClick={closeNavbar}>
        <FaTags />
        <span>Shop</span>
      </NavLink>

      <button
        type="button"
        className="cutty-mobile-bottom-nav__item cutty-mobile-bottom-nav__item--button"
        onClick={handleCreatePost}
      >
        <FaPlus />
        <span>Post</span>
      </button>

      <NavLink
        to={isAuthenticated ? "/customer-profile" : "/login"}
        className="cutty-mobile-bottom-nav__item"
        onClick={closeNavbar}
      >
        {isAuthenticated ? <FaUserCircle /> : <FaSignInAlt />}
        <span>{isAuthenticated ? "Profile" : "Login"}</span>
      </NavLink>

      <button
        type="button"
        className="cutty-mobile-bottom-nav__item cutty-mobile-bottom-nav__item--button position-relative"
        onClick={() => navigate(isAuthenticated ? "/notifications" : "/login")}
        aria-label="Notifications"
      >
        <FaBell />
        <span>Alerts</span>
        {isAuthenticated && unreadCount > 0 && (
          <span className="cutty-nav-badge">{unreadCount}</span>
        )}
      </button>
    </div>

    <div className="cutty-mobile-nav-spacer d-lg-none" />
    </>
  );
};

const NavItem = ({ to, label, onClick }) => (
  <li className="nav-item">
    <NavLink
      to={to}
      className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      {label}
    </NavLink>
  </li>
);

export default Navbar;
