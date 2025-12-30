import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import RecentlyViewed from "./RecentView";

const SubCategoryListPage = () => {
  const { categoryId } = useParams();
  const [subCategories, setSubCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch subcategories for the selected category
  useEffect(() => {
    fetchSubCategories();
  }, [categoryId]);

  // Function to fetch subcategories and category info
  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch category details first
      const categoryResponse = await ApiService.getCategoryById(categoryId);
      setCategory(categoryResponse.category);
      
      // Then fetch subcategories using the new endpoint
      const subCategoryResponse = await ApiService.getSubCategoriesByCategory(categoryId);
      
      // Ensure we have the data in the correct format
      const subCategoriesData = subCategoryResponse.subCategoryList || [];
      
      // Log for debugging
      //console.log('Fetched subcategories:', subCategoriesData);
      
      setSubCategories(subCategoriesData);
      
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setError(error.response?.data?.message || error.message || "Unable to fetch subcategories");
    } finally {
      setLoading(false);
    }
  };

  // Handle click on a subcategory
  const handleSubCategoryClick = (subCategoryId) => {
    navigate(`/products-sub-category/${subCategoryId}`); 
  };

  // Handle image error - fallback to default image
  const handleImageError = (e) => {
    console.log('Image failed to load, using fallback');
    e.target.src = '/default-subcategory-image.jpg';
    e.target.style.objectFit = 'contain';
  };

  // Handle image load success
  const handleImageLoad = (e, subCategory) => {
    console.log(`Image loaded successfully for ${subCategory.name}:`, e.target.src);
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 text-center">
            <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 className="text-muted">Loading subcategories...</h4>
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
            <button className="btn btn-primary mt-3" onClick={fetchSubCategories}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      {/* Category Header with Banner */}
      {category && (
        <div className="position-relative overflow-hidden bg-light mb-5">
          <div className="container py-5">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <a 
                        href="/categories" 
                        className="text-decoration-none text-muted"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/categories');
                        }}
                      >
                        Categories
                      </a>
                    </li>
                    <li className="breadcrumb-item active text-dark" aria-current="page">
                      {category.name}
                    </li>
                  </ol>
                </nav>
                
                <h1 className="display-5 fw-bold text-dark mb-3">{category.name}</h1>
                <p className="lead text-muted mb-4">
                  Explore our wide range of {category.name.toLowerCase()} subcategories
                </p>
                
                <div className="d-flex align-items-center text-muted">
                  <i className="bi bi-grid-3x3-gap-fill me-2"></i>
                  <span>{subCategories.length} subcategories available</span>
                </div>
              </div>
              
              <div className="col-lg-4 text-lg-end">
                {category.imageUrl && (
                  <img 
                    src={category.imageUrl} 
                    alt={category.name}
                    className="img-fluid rounded-3 shadow-sm"
                    style={{ maxHeight: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subcategories Section */}
      <div className="container pb-5">
        <div className="row mb-4">
          <div className="col-12">
            <h2 className="h3 fw-bold text-dark">
              <i className="bi bi-diagram-3 me-2 text-primary"></i>
              Subcategories
            </h2>
            <p className="text-muted">Choose a subcategory to explore products</p>
          </div>
        </div>

        {subCategories.length === 0 ? (
          <div className="row justify-content-center">
            <div className="col-12 col-md-6 text-center py-5">
              <div className="text-muted mb-4">
                <i className="bi bi-inboxes display-1"></i>
              </div>
              <h3 className="h4 text-muted mb-3">No Subcategories Found</h3>
              <p className="text-muted mb-4">
                There are no subcategories available for this category yet.
              </p>
              <button 
                className="btn btn-outline-primary"
                onClick={() => navigate('/categories')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Categories
              </button>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {subCategories.map((subCategory) => (
              <div 
                key={subCategory.id} 
                className="col-6 col-md-4 col-lg-3"
              >
                <div 
                  className="card h-100 border-0 shadow-sm hover-shadow transition-all cursor-pointer"
                  onClick={() => handleSubCategoryClick(subCategory.id)}
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
                    {subCategory.imageUrl ? (
                      <img 
                        src={subCategory.imageUrl} 
                        alt={subCategory.name}
                        className="img-fluid w-100 h-100 object-fit-cover transition-all"
                        style={{ transition: 'transform 0.3s ease' }}
                        onError={handleImageError}
                        onLoad={(e) => handleImageLoad(e, subCategory)}
                        loading="lazy"
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                        }}
                      />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center w-100 h-100 text-muted bg-secondary bg-opacity-10">
                        <div className="text-center">
                          <i className="bi bi-image display-4 opacity-50"></i>
                          <p className="small mt-2 text-muted">No Image Available</p>
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
                  
                  {/* Subcategory Info */}
                  <div className="card-body text-center">
                    <h5 className="card-title fw-semibold text-dark mb-2">
                      {subCategory.name}
                    </h5>
                    {/* Debug info - remove in production */}
                    <small className="text-muted d-block">
                      ID: {subCategory.id}
                    </small>
                    {subCategory.imageUrl && (
                      <small className="text-info d-block mt-1">
                        Has image
                      </small>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to Categories Button */}
        <div className="row mt-5">
          <div className="col-12 text-center">
            <button 
              className="btn btn-outline-secondary"
              onClick={() => navigate('/categories')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to All Categories
            </button>
          </div>
        </div>
      </div>
      <div><RecentlyViewed /></div>
    </div>
  );
};

export default SubCategoryListPage;