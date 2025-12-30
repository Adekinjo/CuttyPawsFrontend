import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRecentlyViewed } from "../../service/LocalStorage";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "../../style/RecentView.css"; // Custom CSS for additional styling

const RecentView = () => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    const viewedProducts = getRecentlyViewed();
    setRecentlyViewed(viewedProducts);
  }, []);

  // Function to generate SEO-friendly URL slug
  const generateSlug = (str) => {
    if (!str) return "uncategorized";
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace special characters with hyphens
      .replace(/(^-|-$)+/g, ""); // Remove leading/trailing hyphens
  };

  // Function to format price with Nigerian Naira symbol and commas
  const formatPrice = (price) => {
    if (!price) return "Price not available";
    return `₦${price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
  };

  // If no recently viewed products, don't render anything
  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <Container className="recently-viewed py-4">
      <h2 className="mb-4 text-center" style={{ color: "black" }}>
        Recently Viewed Products
      </h2>
      <div className="recently-viewed-scroller">
        <Row className="flex-nowrap pb-3">
          {recentlyViewed.map((product) => {
            const categorySlug = generateSlug(product.category?.name);
            const subCategorySlug = generateSlug(product.subCategory?.name);
            const productSlug = generateSlug(product.name);
            return (
              <Col
                key={product.id}
                xs={8}
                sm={6}
                md={4}
                lg={3}
                xl={2}
                className="flex-shrink-0"
              >
                <div className="recently-viewed-item text-center">
                  <Link
                    to={`/product/${categorySlug}/${subCategorySlug}/${productSlug}/dp/${product.id}`}
                    state={{ productId: product.id }}
                    className="text-decoration-none text-dark"
                  >
                    <div className="image-container">
                      <img
                        src={product.imageUrls?.[0] || "/images/placeholder-product.jpg"}
                        alt={product.name}
                        className="img-fluid rounded mb-2"
                        onError={(e) => {
                          e.target.src = "/images/placeholder-product.jpg";
                        }}
                      />
                    </div>
                    <h6 className="mb-1 text-truncate">{product.name}</h6>
                    <p className="mb-0">
                      {product.newPrice
                        ? formatPrice(product.newPrice)
                        : "Price not available"}
                    </p>
                  </Link>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>
    </Container>
  );
};

export default RecentView;