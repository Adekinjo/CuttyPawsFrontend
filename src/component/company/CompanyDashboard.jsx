import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUserTie, FaBox, FaShoppingCart, FaChartLine,
  FaDollarSign, FaClipboardList, FaTruck, FaCube,
  FaRegChartBar, FaInfoCircle
} from 'react-icons/fa';
import { Line, Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import ApiService from '../../service/ApiService';
import './CompanyDashboard.css';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState({
    businessName: "N/A",
    email: "N/A",
    regDate: "N/A"
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });
  const [salesData, setSalesData] = useState(null);
  const [orderStatusData, setOrderStatusData] = useState(null);

  useEffect(() => {
    // const fetchData = async () => {
    //   try {
    //     if (!localStorage.getItem('token')) {
    //       navigate('/login');
    //       return;
    //     }

    //     const userInfoRes = await ApiService.getLoggedInInfo();
    //     const userInfo = userInfoRes.user;

    //     if (!userInfo || userInfo.role !== "ROLE_COMPANY") {
    //       throw new Error("Unauthorized access");
    //     }

    //     setCompanyData({
    //       businessName: userInfo.companyName || "N/A",
    //       email: userInfo.email || "N/A",
    //       regDate: userInfo.regDate || "N/A"
    //     });

    //     const companyId = userInfo.id;

    //     // Fetch products
    //     const productsRes = await ApiService.getAllProductsByUser(companyId);
    //     const productList = productsRes.productList || [];
    //     setProducts(productList);

    //     // Fetch orders
    //     const ordersRes = await ApiService.getCompanyProductOrders(companyId);
    //     const orderItems = ordersRes.orderItemList || [];
    //     setOrders(orderItems);

    //     // Calculate statistics
    //     const totalProducts = productList.length;
    //     const totalOrders = ordersRes.totalElement || 0;
    //     const pendingOrders = orderItems.filter(item => item.status === 'PENDING').length;
    //     const totalRevenue = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    //     setStats({
    //       totalProducts,
    //       totalOrders,
    //       pendingOrders,
    //       totalRevenue
    //     });

    //     // Prepare chart data
    //     prepareChartData(orderItems);
    //   } catch (error) {
    //     console.error("Error fetching data:", error);
    //     navigate('/login');
    //   }
    // };
    const fetchData = async () => {
      try {
        // Check for authentication
        if (!localStorage.getItem('token')) {
          navigate('/login');
          return;
        }
    
        // Fetch logged-in user info
        const userInfoRes = await ApiService.getLoggedInInfo();
        const userInfo = userInfoRes.user;
        if (!userInfo || userInfo.role !== "ROLE_COMPANY") {
          throw new Error("Unauthorized access");
        }
    
        // Set company data
        setCompanyData({
          businessName: userInfo.companyName || "N/A",
          email: userInfo.email || "N/A",
          regDate: userInfo.regDate || "N/A"
        });
    
        const companyId = userInfo.id;
    
        // Fetch products
        let productList = [];
        try {
          const productsRes = await ApiService.getAllProductsByUser(companyId);
          productList = productsRes.productList || [];
        } catch (error) {
          console.error("Error fetching products:", error);
        }
        setProducts(productList);
    
        // Fetch orders
        let orderItems = [];
        try {
          const ordersRes = await ApiService.getCompanyProductOrders(companyId);
          orderItems = ordersRes.orderItemList || [];
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
        setOrders(orderItems);
    
        // Calculate statistics
        const totalProducts = productList.length;
        const totalOrders = orderItems.length;
        const pendingOrders = orderItems.filter(item => item.status === 'PENDING').length;
        const totalRevenue = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
        setStats({
          totalProducts,
          totalOrders,
          pendingOrders,
          totalRevenue
        });
    
        // Prepare chart data
        prepareChartData(orderItems);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.message === "Unauthorized access") {
          navigate('/login');
        }
      }
    };

    fetchData();
  }, [navigate]);

  const prepareChartData = (orders) => {
    // Sales Data Preparation
    const monthlySales = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const month = date.toLocaleString('default', { month: 'short' });
      const amount = order.price * order.quantity;
      
      if (monthlySales[month]) {
        monthlySales[month] += amount;
      } else {
        monthlySales[month] = amount;
      }
    });

    const salesChartData = {
      labels: Object.keys(monthlySales),
      datasets: [{
        label: 'Sales Amount',
        data: Object.values(monthlySales),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.4,
        fill: true
      }]
    };

    // Order Status Data Preparation
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const statusChartData = {
      labels: Object.keys(statusCounts),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: ['#6366f1', '#f59e0b', '#10b981', '#ef4444'],
        hoverOffset: 4
      }]
    };

    setSalesData(salesChartData);
    setOrderStatusData(statusChartData);
  };

  
  const handleOrderDetails = (id) => {
    navigate(`/company/company-order-details/${id}`);
};


  return (
    <div className="seller-dashboard">
      <header className="dashboard-header">
        <h1><FaUserTie /> {companyData.businessName} Dashboard</h1>
        <button
          className="logout-btn"
          onClick={() => navigate('/company/company-products')}
        >
          Manage Products
        </button>
      </header>

      <div className="stats-grid">
        <StatCard icon={<FaCube />} title="Total Products" value={stats.totalProducts} />
        <StatCard icon={<FaClipboardList />} title="Total Orders" value={stats.totalOrders} />
        <StatCard icon={<FaTruck />} title="Pending Orders" value={stats.pendingOrders} />
        <StatCard 
          icon={<FaDollarSign />} 
          title="Total Revenue" 
          value={`$${stats.totalRevenue.toFixed(2)}`} 
        />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3><FaChartLine /> Sales Analytics</h3>
          {salesData ? (
            <Line 
              data={salesData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Monthly Sales Performance' }
                }
              }}
            />
          ) : <p>No sales data available</p>}
        </div>
        <div className="chart-card">
          <h3><FaRegChartBar /> Order Status</h3>
          {orderStatusData ? (
            <Pie 
              data={orderStatusData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' },
                  tooltip: { enabled: true }
                }
              }}
            />
          ) : <p>No order status data available</p>}
        </div>
      </div>

      <div className="products-section">
        <h2><FaBox /> Recent Products</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>{product.name || "N/A"}</td>
                  <td>${product.newPrice?.toFixed(2) || "N/A"}</td>
                  <td>{product.stock || 0}</td>
                  <td>
                    <span className={`status-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="orders-section">
        <h2><FaShoppingCart /> Recent Orders</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>{order.id || "N/A"}</td>
                  <td>{order.user?.name || "N/A"}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>${((order.price || 0) * (order.quantity || 0)).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status || "N/A"}
                    </span>
                  </td>
                  <td>
                      <button onClick={() => handleOrderDetails(order.id)}>Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="seller-info">
        <h2><FaInfoCircle /> Seller Information</h2>
        <div className="info-card">
          <div className="info-item">
            <strong>Business Name:</strong> {companyData.businessName}
          </div>
          <div className="info-item">
            <strong>Email:</strong> {companyData.email}
          </div>
          <div className="info-item">
            <strong>Registration Date:</strong> {formatDate(companyData.regDate)}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  </div>
);

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export default CompanyDashboard;