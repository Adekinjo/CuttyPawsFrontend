// src/pages/profile/SettingsPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./settings.css";

import AuthService from "../../service/AuthService";
import NotificationService from "../../service/NotificationService";

import {
  FaArrowLeft,
  FaChevronRight,
  FaUserCircle,
  FaHistory,
  FaBookmark,
  FaAddressCard,
  FaCreditCard,
  FaBell,
  FaShieldAlt,
  FaQuestionCircle,
  FaSignOutAlt
} from "react-icons/fa";

export default function SettingsPage() {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD USER + NOTIFICATIONS
  ========================== */
  useEffect(() => {
    loadSettingsData();
  }, []);

  async function loadSettingsData() {
    try {
      setLoading(true);

      const res = await AuthService.getLoggedInInfo();
      setUserInfo(res?.user || null);

      try {
        const unread = await NotificationService.getUnreadCount();
        setUnreadCount(unread?.count || unread || 0);
      } catch {
        setUnreadCount(0);
      }

    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     LOGOUT
  ========================== */
  function handleLogout() {
    if (!window.confirm("Are you sure you want to log out?")) return;
    AuthService.logout();
    navigate("/login");
  }

  const handleAddressClick = () => {
    navigate(userInfo.address ? "/edit-address" : "/address")
  }

  /* =========================
     SETTINGS ROW
  ========================== */
  const Row = ({ icon, bg, title, sub, onClick, danger, badge }) => (
    <button
      type="button"
      className={`cp-setting-row w-100 text-start border-0 ${danger ? "cp-logout-row" : ""}`}
      onClick={onClick}
    >
      <div className="cp-setting-left">
        <div className="cp-setting-icon" style={{ background: bg }}>
          {icon}
        </div>
        <div>
          <p
            className="cp-setting-title"
            style={{ color: danger ? "#dc2626" : undefined }}
          >
            {title}
          </p>
          {sub ? <p className="cp-setting-sub">{sub}</p> : null}
        </div>
      </div>

      <div className="d-flex align-items-center gap-2">
        {badge ? <span className="cp-badge">{badge}</span> : null}
        <FaChevronRight color={danger ? "#dc2626" : "#9ca3af"} />
      </div>
    </button>
  );

  /* =========================
     LOADING STATE
  ========================== */
  if (loading) {
    return (
      <div className="cp-settings-page d-flex justify-content-center align-items-center">
        <div className="spinner-border" style={{ color: "#FF7B54" }} />
      </div>
    );
  }

  return (
    <div className="cp-settings-page">

      {/* ================= HEADER ================= */}
      <div className="sticky-top bg-white border-bottom">
        <div className="container py-3 d-flex align-items-center gap-3">
          <button
            className="btn btn-outline-secondary rounded-circle"
            style={{ width: 40, height: 40 }}
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
          </button>
          <h1 className="fs-5 fw-bold mb-0">Settings</h1>
        </div>
      </div>

      <div className="container py-4" style={{ maxWidth: 720 }}>

        {/* ================= USER CARD ================= */}
        <div className="cp-settings-hero p-4 mb-4">
          <div className="d-flex align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <img
                src={userInfo?.profileImageUrl || "https://via.placeholder.com/64"}
                alt="Profile"
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 999,
                  objectFit: "cover",
                  border: "2px solid rgba(255,255,255,.6)"
                }}
              />
              <div>
                <div className="fw-bold fs-5">{userInfo?.name}</div>
                <div style={{ opacity: 0.9 }}>{userInfo?.email}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SETTINGS LIST ================= */}
        <div className="cp-settings-card">

          <Row
            icon={<FaUserCircle color="#7c3aed" />}
            bg="#f3e8ff"
            title="Edit Profile"
            sub="Update your personal information"
            onClick={() => navigate("/update-user-profile")}
          />

          <Row
            icon={<FaHistory color="#2563eb" />}
            bg="#dbeafe"
            title="Order History"
            sub="View your past orders and tracking"
            onClick={() => navigate("/order-history-page")}
          />

          <Row
            icon={<FaBookmark color="#ef4444" />}
            bg="#fee2e2"
            title="Saved Products"
            sub="Items you want to buy later"
            onClick={() => navigate("/profile?tab=saved")}
          />

          <Row
            icon={<FaAddressCard color="#f97316" />}
            bg="#ffedd5"
            title="Addresses"
            sub="Manage shipping addresses"
            onClick={handleAddressClick}
          />

          <Row
            icon={<FaCreditCard color="#4f46e5" />}
            bg="#e0e7ff"
            title="Payment Methods"
            sub="Manage cards and payment options"
            onClick={() => navigate("/payment-methods")}
          />

          <Row
            icon={<FaBell color="#f59e0b" />}
            bg="#fef3c7"
            title="Notifications"
            sub="Configure notification preferences"
            badge={unreadCount > 0 ? unreadCount : null}
            onClick={() => navigate("/notifications")}
          />

          <Row
            icon={<FaShieldAlt color="#10b981" />}
            bg="#d1fae5"
            title="Privacy & Security"
            sub="Password, privacy, and security settings"
            onClick={() => navigate("/privacy")}
          />

          <Row
            icon={<FaQuestionCircle color="#0ea5e9" />}
            bg="#cffafe"
            title="Help & Support"
            sub="Get help and contact support"
            onClick={() => navigate("/help")}
          />

          <Row
            icon={<FaSignOutAlt />}
            bg="#ffe4e6"
            title="Logout"
            sub="Sign out of your account"
            danger
            onClick={handleLogout}
          />

        </div>

        {/* ================= FOOTER ================= */}
        <div className="text-center mt-4 pt-4 border-top">
          <div className="text-muted small mb-2">CuttyPaws Version 1.0.0</div>
          <div className="cp-footer-links">
            <button className="btn btn-link text-muted p-0 small">Terms of Service</button>
            <span>•</span>
            <button className="btn btn-link text-muted p-0 small">Privacy Policy</button>
          </div>
        </div>

      </div>
    </div>
  );
}
