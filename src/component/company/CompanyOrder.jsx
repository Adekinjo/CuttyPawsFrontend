import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "../common/Pagination";
import ApiService from "../../service/ApiService";
import "./CompanyOrders.css";

const OrderStatus = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];

const CompanyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);
    const itemsPerPage = 10;
    const navigate = useNavigate();

    // Fetch all orders for the company's products
    useEffect(() => {
        fetchOrders();
    }, [currentPage, statusFilter]);

    const fetchOrders = async () => {
        try {
            const companyId = localStorage.getItem("companyId"); // Assuming companyId is stored during login
            const response = await ApiService.getCompanyProductOrders(companyId, currentPage - 1, itemsPerPage);

            const orderList = response.orderItemList || [];
            setTotalPages(response.totalPage);
            setOrders(orderList);

            // Apply status filter if selected
            if (statusFilter) {
                const filtered = orderList.filter((order) => order.status === statusFilter);
                setFilteredOrders(filtered);
            } else {
                setFilteredOrders(orderList);
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || "Unable to fetch orders");
            setTimeout(() => {
                setError("");
            }, 3000);
        }
    };

    // Handle status filter change
    const handleFilterChange = (e) => {
        const filterValue = e.target.value;
        setStatusFilter(filterValue);
        setCurrentPage(1);
    };

    // Handle navigation to order details
    const handleOrderDetails = (id) => {
        navigate(`/company/order-details/${id}`);
    };

    return (
        <div className="company-product-orders">
            {error && <p className="error">{error}</p>}
            <h2>Company Product Orders</h2>

            {/* Filter by Status */}
            <div className="filter-container">
                <label>Filter By Status:</label>
                <select value={statusFilter} onChange={handleFilterChange}>
                    <option value="">All</option>
                    {OrderStatus.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
            </div>

            {/* Table to display orders */}
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Product Name</th>
                        <th>Quantity</th>
                        <th>Total Price</th>
                        <th>Status</th>
                        <th>Date Ordered</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{order.productName}</td>
                                <td>{order.quantity}</td>
                                <td>${order.price.toFixed(2)}</td>
                                <td>{order.status}</td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        className="details-button"
                                        onClick={() => handleOrderDetails(order.id)}
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7">No orders found.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
            />
        </div>
    );
};

export default CompanyOrders;