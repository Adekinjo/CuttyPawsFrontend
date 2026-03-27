
import { useState, useEffect } from "react";
import ApiService from "../../service/ApiService";
import { useNavigate } from "react-router-dom";
import Pagination from "../common/Pagination";
import '../../style/AdminProduct.css';

const SellerProduct = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]); 
  const [currentPage, setCurrentPage] = useState(1); 
  const [totalPages, setTotalPages] = useState(0); 
  const [error, setError] = useState(null); 
  const [sellerName, setSellerName] = useState("");
  const [sellerId, setSellerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10; 

  // Fetch logged-in user information
  const fetchUserInfo = async () => {
    try {
      const response = await ApiService.getLoggedInInfo();
      const userInfo = response.user;
      if (userInfo && userInfo.role === "ROLE_SELLER") {
        setSellerName(userInfo.companyName || "Seller");
        setSellerId(userInfo.id);
      }
      return userInfo;
    } catch (error) {
      setError(
        error.response?.data?.message || error.message || "Unable to fetch user info"
      );
      setLoading(false);
    }
  };

  // Fetch products for the logged-in seller
  const fetchSellerProducts = async (sellerId) => {
    try {
      const response = await ApiService.getAllProductsByUser(sellerId);
      const productList = response.productList || [];
      setTotalPages(Math.ceil(productList.length / itemsPerPage));
      setProducts(productList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage));
    } catch (error) {
      setError(
        error.response?.data?.message || error.message || "Unable to fetch products"
      );
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const initialize = async () => {
      const userInfo = await fetchUserInfo();
      if (userInfo && userInfo.role === "ROLE_SELLER") {
        fetchSellerProducts(userInfo.id);
      } else {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  // Fetch products when the current page changes
  useEffect(() => {
    const fetchProductsForCurrentPage = async () => {
      const userInfo = await fetchUserInfo();
      if (userInfo && userInfo.role === "ROLE_SELLER") {
        fetchSellerProducts(userInfo.id);
        console.log(userInfo.id);
      }
    };
    fetchProductsForCurrentPage();
  }, [currentPage]);

  // Handle product edit action
  const handleEdit = (id) => {
    navigate(`/seller/seller-edit-product/${id}`);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (confirmed) {
      try {
        await ApiService.deleteProductForSeller(id);
        if (sellerId) {
          fetchSellerProducts(sellerId);
        }
      } catch (error) {
        setError(error.response?.data?.message || error.message || "Unable to delete product");
      }
    }
  };

  return (
    <div className="admin-product">
      {/* Display error message if any */}
      {error && <p className="error-message">{error}</p>}

      {/* Show loading spinner while fetching data */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {/* Display company name */}
          <h1>{sellerName} Products</h1>

          {/* Add Product Button */}
          <button className="add-product" onClick={() => navigate('/seller/seller-add-product')}>
            Add Product
          </button>

          {/* Display product list */}
          <ul>
            {products.map((product) => (
              <li key={product.id}>
                <span>{product.name}</span>
                <span>${product.newPrice}</span>
                <button className="edit" onClick={() => handleEdit(product.id)}>
                  Edit
                </button>
                <button className="delete" onClick={() => handleDelete(product.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>

          {/* Display message if no products are found */}
          {products.length === 0 && <p>No products found.</p>}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
};

export default SellerProduct;
