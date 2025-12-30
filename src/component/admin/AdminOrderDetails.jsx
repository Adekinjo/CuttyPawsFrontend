import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  FaBox,
  FaTag,
  FaCalendarAlt,
  FaUser,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "../../style/AdminOrderDetails.css";
import ApiService from "../../service/ApiService";

const OrderStatus = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

const statusColors = {
  PENDING: "#f6ad55",
  CONFIRMED: "#4299e1",
  SHIPPED: "#9f7aea",
  DELIVERED: "#48bb78",
  CANCELLED: "#f56565",
  RETURNED: "#667eea",
};

const AdminOrderDetails = () => {
  const { itemId } = useParams();
  const [orderItems, setOrderItems] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedStatus, setSelectedStatus] = useState({});

  useEffect(() => {
    fetchOrderDetails(itemId);
  }, [itemId]);

  const fetchOrderDetails = async (itemId) => {
    try {
      const response = await ApiService.getOrderItemById(itemId);
      setOrderItems(response.orderItemList);
    } catch (error) {
      console.error(error.message || error);
    }
  };

  const handleStatusChange = (orderItemId, newStatus) => {
    setSelectedStatus((prev) => ({ ...prev, [orderItemId]: newStatus }));
  };

  const handleSubmitStatusChange = async (orderItemId) => {
    try {
      await ApiService.updateOrderitemStatus(
        orderItemId,
        selectedStatus[orderItemId]
      );
      setMessage("Order status updated successfully!");
      setTimeout(() => setMessage(""), 3000);
      fetchOrderDetails(itemId);
    } catch (error) {
      setMessage(
        error.response?.data?.message || error.message || "Failed to update status"
      );
    }
  };

  const getContrastColor = (hexColor) => {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#2d3748" : "#ffffff";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? "Invalid Date" : date.toLocaleDateString();
  };

  return (
    <div className="order-details-container">
      {message && (
        <div
          className={`message-banner ${
            message.includes("successfully") ? "success" : "error"
          }`}
        >
          {message}
        </div>
      )}
      <h1 className="page-title">Order Details</h1>
      {orderItems.length > 0 ? (
        orderItems.map((orderItem) => (
          <div key={orderItem.id}>
            {/* Product Information Section */}
            <div className="product-details-card">
              <div className="product-header">
                <FaBox />
                <span>Product Information</span>
              </div>
              <div className="product-content">
                <div className="product-image-container">
                  <img
                    src={orderItem.productImageUrl}
                    alt={orderItem.productName}
                    className="product-image"
                  />
                  <div className="product-badge">
                    <FaTag />
                    <span>{orderItem.status}</span>
                  </div>
                </div>
                <div className="product-info">
                  <div className="info-group">
                    <h3>Product Details</h3>
                    <div className="info-row">
                      Name: <strong>{orderItem.productName}</strong>
                    </div>
                    <div className="info-row">
                      Color:
                      <div
                        className="color-swatch"
                        style={{ backgroundColor: orderItem.selectedColor }}
                      ></div>
                    </div>
                    <div className="info-row">
                      Size: <strong>{orderItem.selectedSize}</strong>
                    </div>
                  </div>
                  <div className="info-group">
                    <h3>Pricing</h3>
                    <div className="info-row">
                      Unit Price: <strong>₦{orderItem.price.toFixed(2)}</strong>
                    </div>
                    <div className="info-row">
                      Quantity: <strong>{orderItem.quantity}</strong>
                    </div>
                    <div className="info-row">
                      Total Price:{" "}
                      <strong>
                      ₦{(orderItem.price * orderItem.quantity).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Status Timeline */}
            <div className="status-timeline-card">
              <div className="status-header">
                <FaCalendarAlt />
                <span>Order Journey</span>
              </div>
              <div className="timeline-container">
                {OrderStatus.map((status, index) => (
                  <div key={status} className="timeline-step">
                    <div
                      className="status-marker"
                      style={{
                        backgroundColor: statusColors[status],
                        color: getContrastColor(statusColors[status]),
                      }}
                    >
                      {index + 1}
                    </div>
                    <div className="status-info">
                      <span className="status-label">{status}</span>
                      {orderItem.status === status && (
                        <span className="status-date">
                          {formatDate(orderItem.updatedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Update Section */}
            <div className="status-update-card">
              <div className="update-header">
                <span>Update Status</span>
                <div
                  className="current-status"
                  style={{
                    backgroundColor: statusColors[orderItem.status],
                    color: getContrastColor(statusColors[orderItem.status]),
                  }}
                >
                  Current: {orderItem.status}
                </div>
              </div>
              <div className="update-controls">
                <select
                  className="status-select"
                  value={selectedStatus[orderItem.id] || ""}
                  onChange={(e) =>
                    handleStatusChange(orderItem.id, e.target.value)
                  }
                >
                  <option value="">Select Status</option>
                  {OrderStatus.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button
                  className="update-button"
                  onClick={() => handleSubmitStatusChange(orderItem.id)}
                  disabled={
                    !selectedStatus[orderItem.id] ||
                    selectedStatus[orderItem.id] === orderItem.status
                  }
                >
                  Confirm Update
                </button>
              </div>
            </div>

            {/* User & Shipping Information */}
            <div className="user-details-card">
              <div className="user-section">
                <h3>Customer Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Name:</strong>
                    <span>{orderItem.user.name}</span>
                  </div>
                  <div className="info-item">
                    <strong>Email:</strong>
                    <span>{orderItem.user.email}</span>
                  </div>
                  <div className="info-item">
                    <strong>Phone:</strong>
                    <span>{orderItem.user.phoneNumber}</span>
                  </div>
                </div>
              </div>
              <div className="shipping-section">
                <h3>Shipping Address</h3>
                <div className="address-grid">
                  <div className="info-item">
                    <strong>Street:</strong>
                    <span>{orderItem.user.address?.street}</span>
                  </div>
                  <div className="info-item">
                    <strong>City:</strong>
                    <span>{orderItem.user.address?.city}</span>
                  </div>
                  <div className="info-item">
                    <strong>State:</strong>
                    <span>{orderItem.user.address?.state}</span>
                  </div>
                  <div className="info-item">
                    <strong>Zip Code:</strong>
                    <span>{orderItem.user.address?.zipcode}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>Loading order details...</p>
      )}
    </div>
  );
};

export default AdminOrderDetails;