import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderService from "../../service/OrderService";
import { 
  FaArrowLeft,
  FaBoxOpen,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSync,
  FaEye,
  FaShoppingBag,
  FaTag,
  FaChevronRight,
  FaSortAmountDown,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../style/OrderHistory.css'

export default function OrderHistoryPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const res = await OrderService.getAllOrders();

      // Normalize response shapes
      const list =
        res?.orderItemList ||
        res?.orders ||
        res?.data ||
        (Array.isArray(res) ? res : []);

      const sorted = Array.isArray(list)
        ? [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];

      setOrders(sorted);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to load order history.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return orders.filter((o) => {
      const matchesQuery =
        !q ||
        String(o?.productName || "").toLowerCase().includes(q) ||
        String(o?.id || "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "ALL" ||
        String(o?.status || "").toUpperCase() === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let aValue, bValue;
      
      switch(sortBy) {
        case "date":
          aValue = new Date(a.createdAt || a.orderDate || 0);
          bValue = new Date(b.createdAt || b.orderDate || 0);
          break;
        case "amount":
          aValue = (Number(a.price) || 0) * (Number(a.quantity) || 0);
          bValue = (Number(b.price) || 0) * (Number(b.quantity) || 0);
          break;
        case "name":
          aValue = (a.productName || "").toLowerCase();
          bValue = (b.productName || "").toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filtered, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageSafe = Math.min(currentPage, totalPages);
  const paginated = sorted.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  function getStatusIcon(status) {
    const s = String(status || "").toUpperCase();
    if (["DELIVERED", "COMPLETED", "SUCCESS"].includes(s)) return <FaCheckCircle />;
    if (["PENDING", "PROCESSING"].includes(s)) return <FaClock />;
    if (["SHIPPED", "IN_TRANSIT"].includes(s)) return <FaTruck />;
    if (["CANCELLED", "FAILED", "REFUNDED"].includes(s)) return <FaTimesCircle />;
    return <FaClock />;
  }

  function getStatusColor(status) {
    const s = String(status || "").toUpperCase();
    if (["DELIVERED", "COMPLETED", "SUCCESS"].includes(s)) return "success";
    if (["PENDING", "PROCESSING"].includes(s)) return "warning";
    if (["SHIPPED", "IN_TRANSIT"].includes(s)) return "info";
    if (["CANCELLED", "FAILED", "REFUNDED"].includes(s)) return "danger";
    return "secondary";
  }

  function formatCurrency(amount) {
    if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return "—";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  function formatDate(date) {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "—";
    }
  }

  function getOrderStatusBadge(status) {
    const statusColor = getStatusColor(status);
    return (
      <span className={`badge bg-${statusColor} bg-opacity-10 text-${statusColor} border border-${statusColor} border-opacity-25 rounded-pill px-3 py-2 d-flex align-items-center gap-2`}>
        {getStatusIcon(status)}
        <span className="text-capitalize">{status || "Unknown"}</span>
      </span>
    );
  }

  const stats = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter(o => 
      ["DELIVERED", "COMPLETED", "SUCCESS"].includes(String(o.status || "").toUpperCase())
    ).length;
    const pending = orders.filter(o => 
      ["PENDING", "PROCESSING"].includes(String(o.status || "").toUpperCase())
    ).length;
    const totalAmount = orders.reduce((sum, o) => 
      sum + ((Number(o.price) || 0) * (Number(o.quantity) || 0)), 0
    );

    return { total, delivered, pending, totalAmount };
  }, [orders]);

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#FEF9F6" }}>
      {/* Header */}
      <div className="sticky-top bg-white border-bottom shadow-sm" style={{ zIndex: 1000 }}>
        <div className="container py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="btn btn-outline-secondary rounded-circle p-2"
                style={{ width: "40px", height: "40px" }}
              >
                <FaArrowLeft className="fs-5" />
              </button>
              <div>
                <h1 className="fs-5 fw-bold mb-0">Order History</h1>
                <small className="text-muted">{stats.total} total orders</small>
              </div>
            </div>
            <button 
              className="btn btn-outline-secondary rounded-circle p-2"
              style={{ width: "40px", height: "40px" }}
              onClick={loadOrders}
              disabled={loading}
            >
              <FaSync className={`fs-5 ${loading ? 'fa-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container py-4">
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100 rounded-3" style={{ background: "linear-gradient(135deg, rgba(255,123,84,0.1) 0%, rgba(255,165,89,0.1) 100%)" }}>
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                    <FaBoxOpen className="text-primary" style={{ fontSize: "1.5rem" }} />
                  </div>
                  <div>
                    <div className="fs-4 fw-bold">{stats.total}</div>
                    <small className="text-muted">Total Orders</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100 rounded-3" style={{ background: "linear-gradient(135deg, rgba(40,167,69,0.1) 0%, rgba(76,175,80,0.1) 100%)" }}>
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                    <FaCheckCircle className="text-success" style={{ fontSize: "1.5rem" }} />
                  </div>
                  <div>
                    <div className="fs-4 fw-bold">{stats.delivered}</div>
                    <small className="text-muted">Delivered</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100 rounded-3" style={{ background: "linear-gradient(135deg, rgba(255,193,7,0.1) 0%, rgba(255,202,40,0.1) 100%)" }}>
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                    <FaClock className="text-warning" style={{ fontSize: "1.5rem" }} />
                  </div>
                  <div>
                    <div className="fs-4 fw-bold">{stats.pending}</div>
                    <small className="text-muted">Pending</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100 rounded-3" style={{ background: "linear-gradient(135deg, rgba(13,110,253,0.1) 0%, rgba(41,121,255,0.1) 100%)" }}>
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                    <FaMoneyBillWave className="text-info" style={{ fontSize: "1.5rem" }} />
                  </div>
                  <div>
                    <div className="fs-4 fw-bold">{formatCurrency(stats.totalAmount)}</div>
                    <small className="text-muted">Total Spent</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-body p-4">
            <div className="row g-3 align-items-end">
              <div className="col-md-5">
                <label className="form-label fw-semibold">Search Orders</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaSearch className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search by product name or order ID..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Filter by Status</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaFilter className="text-muted" />
                  </span>
                  <select
                    className="form-select border-start-0"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Sort by</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaSortAmountDown className="text-muted" />
                  </span>
                  <select
                    className="form-select border-start-0"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    <option value="name">Product Name</option>
                  </select>
                  <button
                    className="btn btn-outline-secondary border-start-0"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  >
                    {sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />}
                  </button>
                </div>
              </div>
              <div className="col-md-1">
                <button
                  className="btn btn-primary w-100"
                  style={{ backgroundColor: "#FF7B54", borderColor: "#FF7B54" }}
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                    setSortBy("date");
                    setSortOrder("desc");
                    setCurrentPage(1);
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status" style={{ color: "#FF7B54" }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body text-center py-5">
              <div className="w-20 h-20 rounded-circle bg-gradient d-flex align-items-center justify-content-center mx-auto mb-4"
                style={{ background: "linear-gradient(135deg, rgba(220,53,69,0.1) 0%, rgba(220,76,100,0.1) 100%)" }}>
                <FaTimesCircle className="text-danger" style={{ fontSize: "2rem" }} />
              </div>
              <h5 className="fw-bold mb-2">Something went wrong</h5>
              <p className="text-muted mb-4">{error}</p>
              <button 
                className="btn btn-primary px-4 py-2"
                style={{ backgroundColor: "#FF7B54", borderColor: "#FF7B54" }}
                onClick={loadOrders}
              >
                Try again
              </button>
            </div>
          </div>
        ) : paginated.length === 0 ? (
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body text-center py-5">
              <div className="w-20 h-20 rounded-circle bg-gradient d-flex align-items-center justify-content-center mx-auto mb-4"
                style={{ background: "linear-gradient(135deg, rgba(255,123,84,0.1) 0%, rgba(255,165,89,0.1) 100%)" }}>
                <FaBoxOpen className="text-primary" style={{ fontSize: "2rem" }} />
              </div>
              <h5 className="fw-bold mb-2">No orders found</h5>
              <p className="text-muted mb-4">Try changing filters or search keywords.</p>
              <button 
                className="btn btn-primary px-4 py-2"
                style={{ backgroundColor: "#FF7B54", borderColor: "#FF7B54" }}
                onClick={() => navigate("/products")}
              >
                Browse Products
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="row g-3">
              {paginated.map((order) => (
                <div key={order.id} className="col-12">
                  <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                    <div className="row g-0">
                      {/* Product Image */}
                      <div className="col-md-3 col-lg-2">
                        <div className="position-relative" style={{ aspectRatio: "1/1" }}>
                          <img
                            src={order.productImageUrl || order.productImage || "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop"}
                            alt={order.productName || "Product"}
                            className="w-100 h-100 object-fit-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop";
                            }}
                          />
                          {order.quantity > 1 && (
                            <span className="position-absolute top-0 start-0 bg-primary text-white px-2 py-1 m-2 rounded-pill small">
                              ×{order.quantity}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="col-md-9 col-lg-10">
                        <div className="card-body p-3 p-md-4">
                          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-3">
                            <div className="mb-3 mb-md-0">
                              <h6 className="fw-bold mb-1">{order.productName || "Unnamed Product"}</h6>
                              <div className="d-flex flex-wrap gap-2 align-items-center text-muted small">
                                <span className="d-flex align-items-center gap-1">
                                  <FaTag />
                                  Order #{order.id}
                                </span>
                                <span className="d-none d-md-inline">•</span>
                                <span className="d-flex align-items-center gap-1">
                                  <FaCalendarAlt />
                                  {formatDate(order.createdAt)}
                                </span>
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                              {getOrderStatusBadge(order.status)}
                            </div>
                          </div>

                          <div className="row g-3 mb-3">
                            <div className="col-6 col-md-3">
                              <div className="bg-light rounded-2 p-2">
                                <div className="text-muted small">Quantity</div>
                                <div className="fw-bold">{order.quantity ?? "—"}</div>
                              </div>
                            </div>
                            <div className="col-6 col-md-3">
                              <div className="bg-light rounded-2 p-2">
                                <div className="text-muted small">Unit Price</div>
                                <div className="fw-bold">{formatCurrency(order.price)}</div>
                              </div>
                            </div>
                            <div className="col-6 col-md-3">
                              <div className="bg-light rounded-2 p-2">
                                <div className="text-muted small">Color</div>
                                <div className="fw-bold">{order.selectedColor || "—"}</div>
                              </div>
                            </div>
                            <div className="col-6 col-md-3">
                              <div className="bg-light rounded-2 p-2">
                                <div className="text-muted small">Total</div>
                                <div className="fw-bold text-primary">
                                  {formatCurrency((Number(order.price) || 0) * (Number(order.quantity) || 0))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="d-flex gap-2 justify-content-end">
                            <button
                              className="btn btn-outline-secondary px-3 py-2 rounded-pill d-flex align-items-center gap-2"
                              onClick={() => navigate(`/products/${order.productId || ""}`)}
                              disabled={!order.productId}
                            >
                              <FaShoppingBag />
                              <span className="d-none d-md-inline">View Product</span>
                            </button>
                            <button
                              className="btn btn-primary px-3 py-2 rounded-pill d-flex align-items-center gap-2"
                              style={{ backgroundColor: "#FF7B54", borderColor: "#FF7B54" }}
                              onClick={() => navigate(`/user-order-details/${order.id}`)}
                            >
                              <FaEye />
                              <span className="d-none d-md-inline">View Details</span>
                              <span className="d-inline d-md-none">Details</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <nav aria-label="Order pagination">
                  <ul className="pagination mb-0">
                    <li className={`page-item ${pageSafe === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={pageSafe === 1}
                      >
                        Previous
                      </button>
                    </li>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pageSafe <= 3) {
                        pageNum = i + 1;
                      } else if (pageSafe >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = pageSafe - 2 + i;
                      }

                      return (
                        <li key={pageNum} className={`page-item ${pageSafe === pageNum ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(pageNum)}
                            style={pageSafe === pageNum ? { backgroundColor: "#FF7B54", borderColor: "#FF7B54" } : {}}
                          >
                            {pageNum}
                          </button>
                        </li>
                      );
                    })}

                    <li className={`page-item ${pageSafe === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={pageSafe === totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}

            {/* Summary */}
            <div className="card border-0 shadow-sm rounded-3 mt-4">
              <div className="card-body p-3">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="text-muted small">Showing {paginated.length} of {sorted.length} orders</div>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <div className="fw-bold">
                      Page {pageSafe} of {totalPages}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Empty state illustration for no orders */}
      {!loading && !error && orders.length === 0 && (
        <div className="container text-center py-5">
          <div className="w-20 h-20 rounded-circle bg-gradient d-flex align-items-center justify-content-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, rgba(255,123,84,0.1) 0%, rgba(255,165,89,0.1) 100%)" }}>
            <FaBoxOpen className="text-primary" style={{ fontSize: "3rem" }} />
          </div>
          <h4 className="fw-bold mb-2">No orders yet</h4>
          <p className="text-muted mb-4">You haven't placed any orders yet.</p>
          <button 
            className="btn btn-primary px-4 py-2"
            style={{ backgroundColor: "#FF7B54", borderColor: "#FF7B54" }}
            onClick={() => navigate("/products")}
          >
            Start Shopping
          </button>
        </div>
      )}
    </div>
  );
}