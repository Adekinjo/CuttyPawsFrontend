import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/CategoryService";
import RecentlyViewed from "./RecentView";
import Categories from "../common/Categories";

const CategoryListPage = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Function to fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getAllCategories();
      setCategories(response.categoryList || []);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Unable to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  // Handle click on a category
  const handleCategoryClick = (categoryId) => {
    navigate(`/categories/${categoryId}/subcategories`);
  };

  // Handle image error - fallback to default image
  const handleImageError = (e) => {
    e.target.src = '/default-category-image.jpg';
    e.target.classList.add('object-fit-cover');
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 text-center">
            <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 className="text-muted">Loading categories...</h4>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 text-center">
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
            <button className="btn btn-primary mt-3" onClick={fetchCategories}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div><Categories/></div>
      {/* Header Section */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-dark mb-3">Shop by Category</h1>
        <p className="lead text-muted">Explore our wide range of products organized by categories</p>
      </div>

      {categories.length === 0 ? (
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 text-center py-5">
            <div className="text-muted mb-4">
              <i className="bi bi-folder-x display-1"></i>
            </div>
            <h3 className="h4 text-muted mb-3">No Categories Found</h3>
            <p className="text-muted">There are no categories available at the moment.</p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="col-6 col-md-4 col-lg-3"
            >
              <div 
                className="card h-100 border-0 shadow-sm hover-shadow transition-all cursor-pointer"
                onClick={() => handleCategoryClick(category.id)}
                style={{ 
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Image Container */}
                <div 
                  className="position-relative overflow-hidden bg-light"
                  style={{ height: '200px' }}
                >
                  {category.imageUrl ? (
                    <img 
                      src={category.imageUrl} 
                      alt={category.name}
                      className="img-fluid w-100 h-100 object-fit-contain transition-all"
                      style={{ transition: 'transform 0.3s ease' }}
                      onError={handleImageError}
                      loading="lazy"
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center w-100 h-100 text-muted">
                      <div className="text-center">
                        <i className="bi bi-image display-4"></i>
                        <p className="small mt-2">No Image</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div 
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-0 transition-all"
                    style={{ 
                      transition: 'all 0.3s ease',
                      opacity: 0
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.classList.add('bg-opacity-50');
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0';
                      e.currentTarget.classList.remove('bg-opacity-50');
                    }}
                  >
                    <span className="text-white fw-bold">
                      <i className="bi bi-arrow-right-circle me-2"></i>
                      View Products
                    </span>
                  </div>
                </div>
                
                {/* Category Info */}
                <div className="card-body text-center">
                  <h5 className="card-title fw-semibold text-dark mb-2">
                    {category.name}
                  </h5>
                  {category.subCategories && category.subCategories.length > 0 && (
                    <p className="text-muted small mb-0">
                      <i className="bi bi-collection me-1"></i>
                      {category.subCategories.length} subcategories
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div><RecentlyViewed /></div>
    </div>
  );
};

export default CategoryListPage;