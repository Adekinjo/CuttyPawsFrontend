
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ApiService from "../../service/CategoryService";
import WishlistService from "../../service/WishlistService"
import ProductService from "../../service/ProductService";
import { useCart } from "../context/CartContext";
import { FaBookmark, FaHeart } from "react-icons/fa";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { Snackbar, Alert, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import '../../style/ProductList.css';

const ProductSubCategory = () => {
  const { subCategoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [subCategoryName, setSubCategoryName] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [likes, setLikes] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const { cart, dispatch } = useCart();

  useEffect(() => {
    fetchSubCategoryAndProducts();
    fetchWishlist();
    fetchLikes();
  }, [subCategoryId]);

  const fetchSubCategoryAndProducts = async () => {
    try {
      const subCategoryResponse = await ApiService.getSubCategoryById(subCategoryId);
      
      if (subCategoryResponse.status === 200 && subCategoryResponse.subCategory) {
        setSubCategoryName(subCategoryResponse.subCategory.name);
      } else {
        setAlertMessage("Subcategory not found.");
        setIsError(true);
        setShowAlert(true);
        return;
      }

      const productsResponse = await ProductService.getAllProductsBySubCategory(subCategoryId);
      if (productsResponse.status === 200 && productsResponse.productList) {
        setProducts(productsResponse.productList);
      } else {
        setAlertMessage("No products found for this subcategory.");
        setIsError(true);
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage(error.response?.data?.message || error.message || "Unable to fetch data");
      setIsError(true);
      setShowAlert(true);
    }
  };

  const fetchWishlist = async () => {
    try {
      const data = await WishlistService.getWishlist();
      setWishlist(data);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    }
  };

  const fetchLikes = async () => {
    try {
      const data = await ProductService.getAllLikes();
      const likesMap = data.productList.reduce((acc, product) => ({
        ...acc,
        [product.id]: product.likes || 0
      }), {});
      setLikes(likesMap);
    } catch (error) {
      console.error("Failed to fetch likes:", error);
    }
  };

  const handleLike = async (productId) => {
    try {
      await ProductService.likeProduct(productId);
      setLikes(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
    } catch (error) {
      setAlertMessage("Failed to like the product");
      setIsError(true);
      setShowAlert(true);
    }
  };

  const cartActions = {
    addToCart: (product) => dispatch({ type: "ADD_ITEM", payload: product }),
    incrementItem: (product) => dispatch({ type: "INCREMENT_ITEM", payload: product }),
    decrementItem: (product) => {
      const cartItem = cart.find(item => item.id === product.id);
      dispatch({ type: cartItem?.quantity > 1 ? "DECREMENT_ITEM" : "REMOVE_ITEM", payload: product });
    }
  };

  const toggleWishlist = async (productId) => {
    if (!ApiService.isAuthenticated()) {
      setAlertMessage("Please login to manage your wishlist.");
      setIsError(true);
      setShowAlert(true);
      return;
    }

    try {
      const isInWishlist = wishlist.some(item => item.productId === productId);
      if (isInWishlist) {
        await WishlistService.removeFromWishlist(productId);
        setWishlist(wishlist.filter(item => item.productId !== productId));
      } else {
        await WishlistService.addToWishlist(productId);
        setWishlist(await WishlistService.getWishlist());
      }
    } catch (error) {
      setAlertMessage("Wishlist update failed");
      setIsError(true);
      setShowAlert(true);
    }
  };

  const calculateDiscount = (oldPrice, newPrice) => 
    oldPrice > newPrice ? Math.round(((oldPrice - newPrice) / oldPrice) * 100) : 0;

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  return (
    <Container className="py-4">
      {/* Alert for Messages */}
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

      <h2 className="mb-4 text-center">{subCategoryName}</h2>
      
      <Row className="g-3">
        {products.map((product) => {
          const cartItem = cart.find(item => item.id === product.id);
          const isInWishlist = wishlist.some(item => item.productId === product.id);
          const discount = calculateDiscount(product.oldPrice, product.newPrice);
          const imageUrl = product.imageUrls?.[0] || "https://via.placeholder.com/300";

          return (
            <Col key={product.id} xs={6} sm={4} md={4} lg={3}>
              <div className="card h-100 shadow-sm position-relative product-card">
                {/* Discount Percentage (Top-Left) */}
                {discount > 0 && (
                  <span className="position-absolute top-0 start-0 m-2 text-danger fw-bold">
                    -{discount}%
                  </span>
                )}

                {/* Wishlist Icon (Top-Right) */}
                <FaBookmark
                  onClick={() => toggleWishlist(product.id)}
                  className="position-absolute top-0 end-0 m-2 fs-5 wishlist-icon"
                  style={{ color: isInWishlist ? 'orange' : '#ddd', cursor: 'pointer' }}
                />

                {/* Product Image */}
                <Link to={`/product/${product.category?.toLowerCase()}/${product.subCategory?.toLowerCase()}/${product.name.toLowerCase()}/dp/${product.id}`}>
                  <div className="ratio ratio-1x1">
                    <img 
                      src={imageUrl} 
                      alt={product.name} 
                      className="card-img-top p-2 object-fit-contain"
                      onError={(e) => e.target.src = "https://via.placeholder.com/300"}
                    />
                  </div>
                </Link>

                {/* Product Details */}
                <div className="card-body d-flex flex-column p-2">
                  <p className="card-title mb-1 text-truncate fs-6">{product.name}</p>
                  
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
                    <div className="d-flex align-items-center justify-content-center mt-1">
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
                      className="w-100 mt-1 btn-sm"
                      onClick={() => cartActions.addToCart(product)}
                    >
                      Add to Cart
                    </Button>
                  )}

                  {/* Likes */}
                  <div className="d-flex align-items-center mt-1">
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={() => handleLike(product.id)}
                      className="p-0 me-1"
                    >
                      <FaHeart color={likes[product.id] ? "red" : "#ccc"} />
                    </Button>
                    <p className="mb-0 h6">{likes[product.id] || 0} Likes</p>
                  </div>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default ProductSubCategory;