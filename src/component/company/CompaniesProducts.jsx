import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FaBookmark, FaHeart } from "react-icons/fa";
import ApiService from "../../service/ApiService";
import { Container, Row, Col, Button, Spinner, Card } from "react-bootstrap";
import { Snackbar, Alert, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const CompaniesProducts = () => {
  const { companyName } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [likes, setLikes] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const { cart, dispatch, isError, setIsError } = useCart();

  // Fetch company products
  useEffect(() => {
    const fetchCompanyProducts = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getAllProduct();
        const allProducts = response.productList || [];
        const filteredProducts = allProducts.filter(product => 
          product.companyName?.trim().toLowerCase() === companyName?.trim().toLowerCase()
        );
        setProducts(filteredProducts);
        if (filteredProducts.length === 0) setError(`No products found for ${companyName}`);
      } catch (error) {
        setError(error.message || "Failed to load products");
        setAlertMessage("Failed to load products");
        setIsError(true);
        setShowAlert(true);
      } finally {
        setLoading(false);
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
      }
    };
    fetchLikes();
  }, []);

  // Handle product like
  const handleLike = async (productId) => {
    try {
      await ApiService.likeProduct(productId);
      setLikes(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
    } catch (error) {
      setAlertMessage("Failed to like product");
      setIsError(true);
      setShowAlert(true);
    }
  };

  // Cart actions
  const cartActions = {
    addToCart: (product) => dispatch({ type: "ADD_ITEM", payload: product }),
    incrementItem: (product) => dispatch({ type: "INCREMENT_ITEM", payload: product }),
    decrementItem: (product) => {
      const cartItem = cart.find(item => item.id === product.id);
      dispatch({
        type: cartItem?.quantity > 1 ? "DECREMENT_ITEM" : "REMOVE_ITEM",
        payload: product,
      });
    },
  };

  // Toggle wishlist
  const toggleWishlist = async (productId) => {
    if (!ApiService.isAuthenticated()) {
      setAlertMessage("Please login to manage wishlist");
      setIsError(true);
      setShowAlert(true);
      return;
    }

    try {
      const isInWishlist = wishlist.some(item => item.productId === productId);
      if (isInWishlist) {
        await ApiService.removeFromWishlist(productId);
        setWishlist(wishlist.filter(item => item.productId !== productId));
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

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-5">
        <h3>{error}</h3>
        <Button variant="primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <Container fluid className="p-3">
      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={isError ? "error" : "success"}
          action={
            <IconButton size="small" onClick={() => setShowAlert(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {alertMessage}
        </Alert>
      </Snackbar>

      <div className="text-center mb-4">
        <h1 className="mb-3">{companyName} Products</h1>
        <Button variant="outline-primary" onClick={() => navigate(-1)}>
          Back to Home
        </Button>
      </div>

      <Row className="g-3 row-cols-2 row-cols-sm-3 row-cols-lg-5">
        {products.map((product) => {
          const cartItem = cart.find(item => item.id === product.id);
          const isInWishlist = wishlist.some(item => item.productId === product.id);
          const discount = calculateDiscount(product.oldPrice, product.newPrice);
          const imageUrl = product.imageUrls?.[0] || "https://via.placeholder.com/300";

          return (
            <Col key={product.id}>
              <Card className="h-100 shadow-sm position-relative">
                {discount > 0 && (
                  <div className="position-absolute top-0 start-0 bg-danger text-white m-2 px-2 rounded">
                    -{discount}%
                  </div>
                )}

                <FaBookmark
                  className="position-absolute top-0 end-0 m-2 fs-5"
                  style={{ color: isInWishlist ? "orange" : "#ddd", cursor: "pointer" }}
                  onClick={() => toggleWishlist(product.id)}
                />

                <Link to={`/product/${product.category?.toLowerCase()}/${product.subCategory?.toLowerCase()}/${product.name.toLowerCase()}/dp/${product.id}`}>
                  <div className="ratio ratio-1x1">
                    <Card.Img
                      variant="top"
                      src={imageUrl}
                      className="object-fit-contain p-3"
                      onError={(e) => e.target.src = "https://via.placeholder.com/300"}
                    />
                  </div>
                </Link>

                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fs-6 text-truncate mb-2">{product.name}</Card.Title>
                  
                  {product.oldPrice > 0 && (
                    <div className="text-muted text-decoration-line-through small">
                      ₦{product.oldPrice.toLocaleString()}
                    </div>
                  )}

                  <div className="mt-auto">
                    <div className="h5 text-primary mb-3">₦{product.newPrice.toLocaleString()}</div>

                    {cartItem ? (
                      <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => cartActions.decrementItem(product)}
                        >
                          -
                        </Button>
                        <span className="mx-2">{cartItem.quantity}</span>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => cartActions.incrementItem(product)}
                        >
                          +
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-100 mb-3"
                        onClick={() => cartActions.addToCart(product)}
                      >
                        Add to Cart
                      </Button>
                    )}

                    <div className="d-flex align-items-center justify-content-center gap-1">
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0"
                        onClick={() => handleLike(product.id)}
                      >
                        <FaHeart color={likes[product.id] ? "red" : "#ccc"} />
                      </Button>
                      <small className="text-muted">{likes[product.id] || 0} Likes</small>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default CompaniesProducts;