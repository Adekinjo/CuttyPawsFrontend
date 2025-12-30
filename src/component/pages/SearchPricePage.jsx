
import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FaBookmark, FaHeart } from "react-icons/fa";
import ApiService from "../../service/ApiService";
import { Container, Row, Col, Card, Button, ButtonGroup, Spinner, Alert } from "react-bootstrap";
import { Snackbar, Alert as MuiAlert, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const SearchPricePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [likes, setLikes] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const { cart, dispatch, isError, setIsError } = useCart();

  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query") || "";
  const minPrice = parseFloat(queryParams.get("minPrice")) || null;
  const maxPrice = parseFloat(queryParams.get("maxPrice")) || null;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await ApiService.searchProductsWithPrice(query, null, minPrice, maxPrice);
        if (response?.productList) {
          const filteredProducts = response.productList.filter(
            (product) =>
              product.name.toLowerCase().includes(query.toLowerCase()) ||
              product.description.toLowerCase().includes(query.toLowerCase())
          );
          setProducts(filteredProducts);
        } else {
          setProducts([]);
        }
      } catch (error) {
        setError("Failed to fetch products. Please try again later.");
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchProducts();
    }
  }, [query, minPrice, maxPrice]);

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
    <Container className="my-5">
      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MuiAlert
          severity={isError ? "error" : "success"}
          action={
            <IconButton size="small" onClick={() => setShowAlert(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {alertMessage}
        </MuiAlert>
      </Snackbar>

      <Row className="mb-4">
        <Col>
          <h1 className="text-center">Search Results for "{query}"</h1>
          {(minPrice || maxPrice) && (
            <div className="text-center mb-3">
              {minPrice && <span className="me-3">Minimum Price: ₦{minPrice}</span>}
              {maxPrice && <span>Maximum Price: ₦{maxPrice}</span>}
            </div>
          )}
        </Col>
      </Row>

      {products.length > 0 ? (
        <Row className="g-3 row-cols-2 row-cols-md-3 row-cols-lg-4">
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

                  <Link
                    to={`/product/${
                      product.category?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'uncategorized'
                    }/${
                      product.subCategory?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'uncategorized'
                    }/${
                      product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    }/dp/${product.id}`}
                    className="text-decoration-none"
                  >
                    <div className="ratio ratio-1x1">
                      <Card.Img
                        variant="top"
                        src={imageUrl}
                        className="object-fit-contain p-3"
                        onError={(e) => e.target.src = "https://via.placeholder.com/300"}
                      />
                    </div>
                    <Card.Body>
                      <Card.Title className="text-truncate">{product.name}</Card.Title>
                      <Card.Text className="text-muted small text-truncate">
                        {product.description}
                      </Card.Text>
                      <div className="d-flex flex-column align-items-start gap-1">
                        {product.oldPrice > 0 && (
                          <span className="text-decoration-line-through text-danger">
                            ₦{product.oldPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                        <span className="h5 text-primary mb-0">
                          ₦{product.newPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </Card.Body>
                  </Link>

                  <Card.Footer className="bg-white border-0">
                    {cartItem ? (
                      <ButtonGroup aria-label="Quantity controls" className="w-100">
                        <Button
                          variant="outline-primary"
                          onClick={() => cartActions.decrementItem(product)}
                        >
                          -
                        </Button>
                        <Button variant="light" disabled>
                          {cartItem.quantity}
                        </Button>
                        <Button
                          variant="outline-primary"
                          onClick={() => cartActions.incrementItem(product)}
                        >
                          +
                        </Button>
                      </ButtonGroup>
                    ) : (
                      <Button
                        variant="primary"
                        className="w-100"
                        onClick={() => cartActions.addToCart(product)}
                      >
                        Add To Cart
                      </Button>
                    )}

                    <div className="d-flex align-items-center justify-content-center gap-1 mt-2">
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
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Alert variant="info" className="text-center">
          No products found matching your search criteria.
        </Alert>
      )}
    </Container>
  );
};

export default SearchPricePage;