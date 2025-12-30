// import  { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import '../../style/adminOrderDetails.css'
// import ApiService from "../../service/ApiService";


// const OrderStatus = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];

// const CompanyOrderDetails = () => {
//     const { itemId } = useParams();
//     const [orderItems, setOrderItems] = useState([]);
//     const [message, setMessage] = useState('');
//     const [selectedStatus, setSelectedStatus] = useState({});


//     useEffect(() => {
//         fetchOrderDetails(itemId);
//     }, [itemId]);

//     const fetchOrderDetails = async (itemId) => {
//         try {
//             const response = await ApiService.getOrderItemById(itemId);
//             setOrderItems(response.orderItemList)
//         } catch (error) {
//             console.log(error.message || error);
//         }
//     }

//     const handleStatusChange = (orderItemId, newStatus) => {
//         setSelectedStatus({ ...selectedStatus, [orderItemId]: newStatus })
//     }

//     const handleSubmitStatusChange = async (orderItemId) => {
//         try {
//             await ApiService.updateOrderitemStatus(orderItemId, selectedStatus[orderItemId]);
//             setMessage('order item status was successfully updated')
//             setTimeout(() => {
//                 setMessage('');
//             }, 3000)
//         } catch (error) {
//             setMessage(error.response?.data?.message || error.message || 'unable  to update order item status')
//         }
//     }


//     return (
//         <div className="order-details-page">
//             {message && <div className="message">{message}</div>}
//             <h2>Order Details</h2>
//             {orderItems.length ? (
//                 orderItems.map((orderItem) => (
//                     <div key={orderItem.id} className="order-item-details">
//                         <div className="info">
//                             <h3>Order Information</h3>
//                             <p><strong>Order Item ID:</strong>{orderItem.id}</p>
//                             <p><strong>Quantity:</strong>{orderItem.quantity}</p>
//                             <p><strong>Total Price:</strong>{orderItem.price}</p>
//                             <p><strong>Order Status:</strong>{orderItem.status}</p>
//                             <p><strong>date Ordered:</strong>{new Date(orderItem.createdAt).toLocaleDateString()}</p>
//                         </div>
//                         <div className="info">
//                             <h3>User Information</h3>
//                             <p><strong>Name:</strong>{orderItem.user.name}</p>
//                             <p><strong>Email:</strong>{orderItem.user.email}</p>
//                             <p><strong>Phone:</strong>{orderItem.user.phoneNumber}</p>
//                             <p><strong>Role:</strong>{orderItem.user.role}</p>

//                             <div className="info">
//                                 <h3>Delivery Address</h3>
//                                 <p><strong>Country:</strong>{orderItem.user.address?.country}</p>
//                                 <p><strong>State:</strong>{orderItem.user.address?.state}</p>
//                                 <p><strong>City:</strong>{orderItem.user.address?.city}</p>
//                                 <p><strong>Street:</strong>{orderItem.user.address?.street}</p>
//                                 <p><strong>Zip Code:</strong>{orderItem.user.address?.zipcode}</p>
//                             </div>
//                         </div>
//                         <div>
//                             <h2>Product Information</h2>
//                             <img src={orderItem.productImageUrl} alt={orderItem.productName} />
//                             <p><strong>Name:</strong>{orderItem.productName}</p>
//                             <p><strong>Color:</strong>{orderItem.selectedColor}</p>
//                             <p><strong>Size:</strong>{orderItem.selectedSize}</p>
//                             <p><strong>Price:</strong>{orderItem.price}</p>
//                         </div>
//                         <div className="status-change">
//                             <h4>Change Status</h4>
//                             <select
//                                 className="status-option"
//                                 value={selectedStatus[orderItem.id] || orderItem.status}
//                                 onChange={(e) => handleStatusChange(orderItem.id, e.target.value)}>

//                                 {OrderStatus.map(status => (
//                                     <option key={status} value={status}>{status}</option>
//                                 ))}
//                             </select>
//                             <button className="update-status-button" onClick={() => handleSubmitStatusChange(orderItem.id)}>Update Status</button>
//                         </div>
//                     </div>

//                 ))
//             ) : (
//                 <p>Loading order details ....</p>
//             )}
//         </div>
//     );

// }

// export default CompanyOrderDetails;







import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  FaInfoCircle,
  FaUser,
  FaMapMarkerAlt,
  FaBox,
  FaTag,
  FaPalette,
  FaRulerVertical,
  FaMoneyBillAlt,
  FaCalendarAlt,
  FaSyncAlt,
  FaCheckCircle,
  FaCube,
  FaLayerGroup,
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

const CompanyOrderDetails = () => {
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
      console.log(error.message || error);
    }
  };

  const handleStatusChange = (orderItemId, newStatus) => {
    setSelectedStatus({ ...selectedStatus, [orderItemId]: newStatus });
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

  // Corrected getContrastColor function
  const getContrastColor = (hexColor) => {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#2d3748" : "#ffffff";
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
                      Unit Price: <strong>${orderItem.price.toFixed(2)}</strong>
                    </div>
                    <div className="info-row">
                      Quantity: <strong>{orderItem.quantity}</strong>
                    </div>
                    <div className="info-row">
                      Total Price:{" "}
                      <strong>
                        ${(orderItem.price * orderItem.quantity).toFixed(2)}
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
                          {new Date(orderItem.updatedAt).toLocaleDateString()}
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

export default CompanyOrderDetails;
