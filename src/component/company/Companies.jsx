import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FaBookmark, FaHeart } from "react-icons/fa";
import ApiService from "../../service/ApiService";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import styles from "../../style/HomeAppliance.module.css";
import { Snackbar, Alert, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const Companies = ({ companyName }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [likes, setLikes] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const { cart, dispatch } = useCart();

  // Fetch products for the specified company
  useEffect(() => {
    const fetchCompanyProducts = async () => {
      try {
        const response = await ApiService.getAllProduct();
        const allProducts = response.productList || [];

        // Filter products by company name
        const companyProducts = allProducts.filter(
          (product) => product.companyName === companyName
        );

        // Set the filtered products in state
        setProducts(companyProducts);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Unable to fetch products"
        );
        setAlertMessage("Unable to fetch products");
        setIsError(true);
        setShowAlert(true);
      }
    };

    fetchCompanyProducts();
  }, [companyName]);

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const data = await ApiService.getWishlist();
        setWishlist(data);
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
        setAlertMessage("Failed to fetch wishlist");
        setIsError(true);
        setShowAlert(true);
      }
    };

    fetchWishlist();
  }, []);

  // Fetch likes
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const data = await ApiService.getAllLikes();
        const likesMap = data.productList.reduce((acc, product) => ({
          ...acc,
          [product.id]: product.likes || 0,
        }), {});
        setLikes(likesMap);
      } catch (error) {
        console.error("Failed to fetch likes:", error);
        setAlertMessage("Failed to fetch likes");
        setIsError(true);
        setShowAlert(true);
      }
    };

    fetchLikes();
  }, []);

  // Handle like
  const handleLike = async (productId) => {
    try {
      await ApiService.likeProduct(productId);
      setLikes((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
    } catch (error) {
      setAlertMessage("Failed to like the product");
      setIsError(true);
      setShowAlert(true);
    }
  };

  // Cart actions
  const cartActions = {
    addToCart: (product) => dispatch({ type: "ADD_ITEM", payload: product }),
    incrementItem: (product) => dispatch({ type: "INCREMENT_ITEM", payload: product }),
    decrementItem: (product) => {
      const cartItem = cart.find((item) => item.id === product.id);
      dispatch({
        type: cartItem?.quantity > 1 ? "DECREMENT_ITEM" : "REMOVE_ITEM",
        payload: product,
      });
    },
  };

  // Toggle wishlist
  const toggleWishlist = async (productId) => {
    if (!ApiService.isAuthenticated()) {
      setAlertMessage("Please login to manage your wishlist.");
      setIsError(true);
      setShowAlert(true);
      return;
    }

    try {
      const isInWishlist = wishlist.some((item) => item.productId === productId);
      if (isInWishlist) {
        await ApiService.removeFromWishlist(productId);
        setWishlist(wishlist.filter((item) => item.productId !== productId));
      } else {
        await ApiService.addToWishlist(productId);
        setWishlist(await ApiService.getWishlist());
      }
    } catch (error) {
      setAlertMessage("Wishlist update failed");
      setIsError(true);
      setShowAlert(true);
    }
  };

  // Calculate discount
  const calculateDiscount = (oldPrice, newPrice) =>
    oldPrice > newPrice ? Math.round(((oldPrice - newPrice) / oldPrice) * 100) : 0;

  // Close alert
  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  // Navigate to all products page
  const handleViewAllProducts = () => {
    navigate(`/companies/${companyName.toLowerCase()}`);
  };

  // Do not render anything if no products are available
  if (products.length === 0) {
    return null;
  }

  return (
    <Container fluid className={`p-0 ${styles.homeApplianceContainer} bg-light-blue`}>
      {/* Alert for messages */}
      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={isError ? "error" : "success"}
          sx={{ width: '100%' }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseAlert}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {alertMessage}
        </Alert>
      </Snackbar>

      <div className={styles.homeApplianceHeader}>
        <h1 className="text-center mb-0 py-2">{companyName} Products</h1>
        <Button
          variant="primary"
          style={{
            fontSize: '14px', // Smaller text
            color: 'black', // Black text
            backgroundColor: 'transparent', // No background color
            border: 'none', // Remove border if needed
            padding: '0', // Adjust padding as needed
          }}
          onClick={handleViewAllProducts}
        >
          View All
        </Button>
      </div>
      <div className={styles.homeApplianceList}>
        <Row className={`flex-nowrap ${styles.homeApplianceRow}`}>
          {products.map((product) => {
            const cartItem = cart.find((item) => item.id === product.id);
            const isInWishlist = wishlist.some(
              (item) => item.productId === product.id
            );
            const discount = calculateDiscount(product.oldPrice, product.newPrice);
            const imageUrl =
              product.imageUrls?.[0] || "https://via.placeholder.com/300";

            return (
              <Col
                key={product.id}
                xs={5} // 2.5 products per row on mobile
                sm={3} // 4 products per row on tablets
                md={2} // 6 products per row on large screens
                className={`p-1 ${styles.productCol}`}
              >
                <div className={`card h-100 shadow-sm position-relative ${styles.productCard}`}>
                  {/* Discount Percentage */}
                  {discount > 0 && (
                    <span className={`position-absolute top-0 start-0 m-2 text-danger fw-bold ${styles.discountBadge}`}>
                      -{discount}%
                    </span>
                  )}

                  {/* Wishlist Icon */}
                  <FaBookmark
                    onClick={() => toggleWishlist(product.id)}
                    className={`position-absolute top-0 end-0 m-2 fs-5 ${styles.wishlistIcon}`}
                    style={{ color: isInWishlist ? "orange" : "#ddd", cursor: "pointer" }}
                  />

                  {/* Product Image */}
                  <Link
                    to={`/product/${product.category?.toLowerCase()}/${product.subCategory?.toLowerCase()}/${product.name.toLowerCase()}/dp/${product.id}`}
                  >
                    <div className={`ratio ratio-1x1 ${styles.productImageContainer}`}>
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className={`card-img-top p-2 object-fit-contain ${styles.productImage}`}
                        onError={(e) => (e.target.src = "https://via.placeholder.com/300")}
                      />
                    </div>
                  </Link>

                  {/* Product Details */}
                  <div className={`card-body d-flex flex-column p-2 ${styles.productDetails}`}>
                    <p className={`card-title mb-1 text-truncate fs-6 ${styles.productName}`}>
                      {product.name}
                    </p>

                    {/* Old Price (Red) */}
                    {product.oldPrice > 0 && (
                      <p className="text-danger text-decoration-line-through mb-1 small">
                        ₦{product.oldPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    )}

                    {/* New Price */}
                    <p className="h6 mb-1 text-primary">
                      ₦{product.newPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>

                    {/* Add to Cart / Quantity Controls */}
                    {cartItem ? (
                      <div className={`d-flex align-items-center justify-content-center mt-1 ${styles.quantityControls}`}>
                        <Button
                          variant="outline-secondary bg-primary"
                          size="sm"
                          onClick={() => cartActions.decrementItem(product)}
                        >
                          -
                        </Button>
                        <span className="mx-2">{cartItem.quantity}</span>
                        <Button
                          variant="outline-secondary bg-primary"
                          size="sm"
                          onClick={() => cartActions.incrementItem(product)}
                        >
                          +
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        className={`w-100 mt-1 btn-sm ${styles.addToCartButton}`}
                        onClick={() => cartActions.addToCart(product)}
                      >
                        Add to Cart
                      </Button>
                    )}

                    {/* Likes */}
                    <div className={`d-flex align-items-center mt-1 ${styles.likesContainer}`}>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleLike(product.id)}
                        className={`p-0 me-1 ${styles.likeButton}`}
                      >
                        <FaHeart color={likes[product.id] ? "red" : "#ccc"} />
                      </Button>
                      <p className={`mb-0 h6 ${styles.likesCount}`}>
                        {likes[product.id] || 0} Likes
                      </p>
                    </div>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>
    </Container>
  );
};

export default Companies;