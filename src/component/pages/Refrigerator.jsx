import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ApiService from "../../service/ApiService";
import "../../style/Ref.css";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import BackToTop from "./BackToTop";

const Refrigerator = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { cart, dispatch } = useCart();

  useEffect(() => {
    const fetchRefrigeratorProducts = async () => {
      try {
        setLoading(true);

        const response = await ApiService.getAllProductsBySubCategory(8);

        if (response.status === 200 && response.productList) {
          setProducts(response.productList);
        } else {
          setError("No products found for the Refrigerator subcategory.");
        }
      } catch (error) {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Unable to fetch Refrigerator products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRefrigeratorProducts();
  }, []);

  const addToCart = (product) => {
    dispatch({ type: "ADD_ITEM", payload: product });
  };

  const incrementItem = (product) => {
    dispatch({ type: "INCREMENT_ITEM", payload: product });
  };

  const decrementItem = (product) => {
    const cartItem = cart.find((item) => item.id === product.id);
    if (cartItem && cartItem.quantity > 1) {
      dispatch({ type: "DECREMENT_ITEM", payload: product });
    } else {
      dispatch({ type: "REMOVE_ITEM", payload: product });
    }
  };

  const calculateDiscountPercentage = (oldPrice, newPrice) => {
    if (oldPrice > 0 && oldPrice > newPrice) {
      return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
    }
    return 0;
  };

  return (
    <div className="container-fluid p-0">
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger text-center">{error}</div>
      ) : (
        <>
          <h1 className="text-center mb-4" style={{ color: "white" }}>
            Men Fashion
          </h1>

          <div className="row flex-nowrap overflow-x-auto g-3 mx-2">
            {products.length > 0 ? (
              products.map((product) => {
                const cartItem = cart.find((item) => item.id === product.id);

                const imageUrl =
                  product.imageUrls && product.imageUrls.length > 0
                    ? product.imageUrls[0]
                    : "https://via.placeholder.com/200";

                const discountPercentage = calculateDiscountPercentage(
                  product.oldPrice,
                  product.newPrice
                );

                return (
                  <div
                    className="col-6 col-sm-4 col-md-3 col-lg-2 flex-shrink-0 p-1"
                    key={product.id}
                  >
                    <div className="card h-100 product-card">
                      <Link
                        to={`/product/${
                          product.category
                            ?.toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-") || "uncategorized"
                        }/${
                          product.subCategory
                            ?.toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-") || "uncategorized"
                        }/${
                          product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                        }/dp/${product.id}`}
                        className="text-decoration-none text-dark"
                      >
                        <div className="position-relative">
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="card-img-top product-image"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/200";
                            }}
                          />
                          {discountPercentage > 0 && (
                            <div className="discount-percent position-absolute top-0 start-0 m-2">
                              -{discountPercentage}%
                            </div>
                          )}
                        </div>

                        <div className="card-body p-2">
                          <h5 className="card-title mb-1">{product.name}</h5>
                          <div className="d-flex flex-column">
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
                          </div>
                        </div>
                      </Link>

                      <div className="card-footer bg-transparent border-0 p-2">
                        {cartItem ? (
                          <div className="d-flex justify-content-between align-items-center">
                            <button
                              onClick={() => decrementItem(product)}
                              className="btn btn-outline-secondary btn-sm"
                            >
                              -
                            </button>
                            <span className="mx-2">{cartItem.quantity}</span>
                            <button
                              onClick={() => incrementItem(product)}
                              className="btn btn-outline-secondary btn-sm"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            className="btn btn-primary w-100 btn-sm"
                          >
                            Add to Cart
                          </button>
                        )}
                      </div>

                      <div className="star-rating d-flex justify-content-center mb-2">
                        {[...Array(3)].map((_, index) => (
                          <AiFillStar
                            key={`filled-${index}`}
                            className="star-icon filled text-warning"
                          />
                        ))}
                        <AiOutlineStar className="star-icon text-warning" />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-12 text-center">
                <p>No products found in the Refrigerator subcategory.</p>
              </div>
            )}
          </div>
        </>
      )}
      <BackToTop />
    </div>
  );
};

export default Refrigerator;