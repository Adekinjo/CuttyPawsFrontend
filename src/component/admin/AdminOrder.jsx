import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaSearch, 
  FaFilter, 
  FaInfoCircle, 
  FaShoppingCart,
  FaWallet,
  FaChartLine,
  FaBoxOpen,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaBox,
  FaTimesCircle,
  FaExchangeAlt
} from "react-icons/fa";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Pagination from "../common/Pagination";
import ApiService from "../../service/ApiService";
import "../../style/AdminOrder.css";

const OrderStatus = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];
const statusColors = {
  PENDING: "#f6ad55",
  CONFIRMED: "#4299e1",
  SHIPPED: "#9f7aea",
  DELIVERED: "#48bb78",
  CANCELLED: "#f56565",
  RETURNED: "#667eea"
};

const statusIcons = {
  PENDING: <FaClock className="status-icon" />,
  CONFIRMED: <FaCheckCircle className="status-icon" />,
  SHIPPED: <FaTruck className="status-icon" />,
  DELIVERED: <FaBox className="status-icon" />,
  CANCELLED: <FaTimesCircle className="status-icon" />,
  RETURNED: <FaExchangeAlt className="status-icon" />
};

const AdminOrder = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchStatus, setSearchStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0 });
    const itemsPerPage = 10;

    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, [searchStatus, currentPage]);

    const fetchOrders = async () => {
        try {
            let response;
            if (searchStatus) {
                response = await ApiService.getAllOrderItemsByStatus(searchStatus);
            } else {
                response = await ApiService.getAllOrders();
            }
            const orderList = response.orderItemList || [];
            
            // Calculate statistics
            const totalRevenue = orderList.reduce((sum, order) => sum + order.price, 0);
            setStats({
                totalOrders: orderList.length,
                totalRevenue
            });

            setTotalPages(Math.ceil(orderList.length / itemsPerPage));
            setOrders(orderList);
            setFilteredOrders(orderList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage));
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Unable to fetch orders');
            setTimeout(() => setError(''), 3000);
        }
    };

    const getStatusData = () => {
        const statusCounts = OrderStatus.reduce((acc, status) => {
            acc[status] = orders.filter(order => order.status === status).length;
            return acc;
        }, {});
        return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    };

    const handleFilterChange = (e) => {
        const filterValue = e.target.value;
        setStatusFilter(filterValue);
        setCurrentPage(1);
        // Filter logic remains same
    };

    const handleOrderDetails = (id) => navigate(`/admin/order-details/${id}`);

    return (
        <div className="admin-orders-container">
            <h1 className="page-title"><FaShoppingCart /> Order Management</h1>
            
            {error && <div className="error-banner"><FaInfoCircle /> {error}</div>}

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon total-orders"><FaShoppingCart /></div>
                    <div className="stat-content">
                        <h3>Total Orders</h3>
                        <p>{stats.totalOrders}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon revenue"><FaWallet /></div>
                    <div className="stat-content">
                        <h3>Total Revenue</h3>
                        <p>&#8358; {stats.totalRevenue.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                <div className="chart-card">
                    <h3><FaChartLine /> Order Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={getStatusData()}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                            >
                                {OrderStatus.map((status) => (
                                    <Cell key={status} fill={statusColors[status]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3><FaBoxOpen /> Orders Timeline</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={orders}>
                            <XAxis dataKey="createdAt" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="price" fill="#4299e1" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-container">
                <div className="filter-group">
                    <label><FaFilter /> Filter by Status:</label>
                    <select value={statusFilter} onChange={handleFilterChange}>
                        <option value="">All</option>
                        {OrderStatus.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label><FaSearch /> Search by Status:</label>
                    <select value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)}>
                        <option value="">All</option>
                        {OrderStatus.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="orders-table-container">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Status</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <tr key={order.id}>
                                <td>#{order.id}</td>
                                <td>{order.user.name}</td>
                                <td>
                                    <div className="status-indicator" style={{ backgroundColor: statusColors[order.status] }}>
                                        {statusIcons[order.status]}
                                        {order.status}
                                    </div>
                                </td>
                                <td>₦{order.price.toFixed(2)}</td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button 
                                        className="details-btn"
                                        onClick={() => handleOrderDetails(order.id)}
                                    >
                                        <FaInfoCircle /> Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

export default AdminOrder;