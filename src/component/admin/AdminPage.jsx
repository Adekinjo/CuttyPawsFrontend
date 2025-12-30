import { useNavigate } from "react-router-dom";
import { 
  FaListUl, 
  FaBox, 
  FaClipboardList, 
  FaHeadset, 
  FaStar,
  FaUsers,
  FaTags,
  FaHome,
  FaShieldAlt,
  FaEye,
  FaDatabase,
  FaLayerGroup
} from "react-icons/fa";

const AdminPage = () => {
    const navigate = useNavigate();

    const adminCards = [
        { 
            title: "Security Dashboard",
            path: "/admin/security-dashboard",
            icon: <FaShieldAlt className="card-icon" />,
            color: "#dc3545",
            description: "View security events and block malicious users"
        },
        { 
            title: "Security Monitoring",
            path: "/admin/security-monitoring",
            icon: <FaEye className="card-icon" />,
            color: "#28a745",
            description: "Live security monitoring and statistics"
        },
        { 
            title: "Manage Categories",
            path: "/admin/categories",
            icon: <FaListUl className="card-icon" />,
            color: "#4CAF50",
            description: "Add, edit, and delete product categories"
        },
        { 
            title: "Manage Subcategories",
            path: "/admin/subcategories",
            icon: <FaLayerGroup className="card-icon" />,
            color: "#2196F3",
            description: "View and manage all subcategories"
        },
        { 
            title: "Manage Products",
            path: "/admin/products",
            icon: <FaBox className="card-icon" />,
            color: "#2196F3",
            description: "Manage all products in the store"
        },
        { 
            title: "Manage Orders",
            path: "/admin/orders",
            icon: <FaClipboardList className="card-icon" />,
            color: "#FF9800",
            description: "View and manage customer orders"
        },
        { 
            title: "Customer Support",
            path: "/admin/support",
            icon: <FaHeadset className="card-icon" />,
            color: "#9C27B0",
            description: "Handle customer inquiries and support tickets"
        },
        { 
            title: "Customer Reviews",
            path: "/admin/reviews",
            icon: <FaStar className="card-icon" />,
            color: "#FFEB3B",
            description: "Manage product reviews and ratings"
        },
        { 
            title: "All Users",
            path: "/admin/all-users",
            icon: <FaUsers className="card-icon" />,
            color: "#E91E63",
            description: "View and manage all user accounts"
        },
        { 
            title: "Deals Management",
            path: "/admin/deals-management",
            icon: <FaTags className="card-icon" />,
            color: "#00BCD4",
            description: "Create and manage special deals"
        },
        {
            title: "Redis Cache Management",
            path: "/admin/cache-management",
            icon: <FaDatabase className="card-icon" />,
            color: "#A52A2A",
            description: "Manage Redis cache settings and performance"
        }
    ];

    return(
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h2 mb-1">Admin Dashboard</h1>
                    <p className="text-muted mb-0">
                        Manage your e-commerce platform
                    </p>
                </div>
                <button 
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/")}
                >
                    <i className="bi bi-house me-2"></i>
                    Home
                </button>
            </div>
            
            <div className="row g-4">
                {adminCards.map((card, index) => (
                    <div key={index} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                        <div 
                            className="card h-100 border-0 shadow-sm hover-shadow transition-all cursor-pointer"
                            onClick={() => navigate(card.path)}
                            style={{ 
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.borderColor = card.color;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = '';
                            }}
                        >
                            <div className="card-body text-center p-4">
                                <div 
                                    className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        backgroundColor: `${card.color}20`,
                                        color: card.color
                                    }}
                                >
                                    {card.icon}
                                </div>
                                <h5 className="card-title fw-semibold mb-2">{card.title}</h5>
                                <p className="card-text text-muted small">{card.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminPage;