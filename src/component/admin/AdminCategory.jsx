import { useState, useEffect } from "react";
import ApiService from "../../service/CategoryService";
import { useNavigate } from "react-router-dom";

const AdminCategory = () => {
    const [categories, setCategories] = useState([]);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategory();
    }, []);

    const fetchCategory = async () => {
        try {
            setLoading(true);
            const response = await ApiService.getAllCategories();
            setCategories(response.categoryList || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditCategory = (id) => {
        navigate(`/admin/edit-category/${id}`);
    };

    const handleEditSubCategory = (subCategoryId) => {
        navigate(`/admin/edit-subcategory/${subCategoryId}`);
    };

    const handleDeleteCategory = async (id, categoryName) => {
        const confirmed = window.confirm(`Are you sure you want to delete the category "${categoryName}"? This will also delete all its subcategories.`);
        if (confirmed) {
            try {
                await ApiService.deleteCategory(id);
                fetchCategory();
            } catch (error) {
                console.error("Unable to delete this category", error);
                alert("Failed to delete category. Please try again.");
            }
        }
    };

    const handleDeleteSubCategory = async (subCategoryId, subCategoryName) => {
        const confirmed = window.confirm(`Are you sure you want to delete the subcategory "${subCategoryName}"?`);
        if (confirmed) {
            try {
                await ApiService.deleteSubCategory(subCategoryId);
                fetchCategory();
            } catch (error) {
                console.error("Unable to delete this subcategory", error);
                alert("Failed to delete subcategory. Please try again.");
            }
        }
    };

    const toggleCategory = (categoryId) => {
        setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    };

    if (loading) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-12 text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Loading categories...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h2 mb-1">Category Management</h1>
                    <p className="text-muted mb-0">
                        Manage your product categories and subcategories
                    </p>
                </div>
                <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/admin/add-category')}
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Category
                </button>
            </div>

            {/* Categories List */}
            <div className="row">
                <div className="col-12">
                    {categories.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-inboxes display-1 text-muted mb-3"></i>
                            <h3 className="h4 text-muted mb-3">No Categories Found</h3>
                            <p className="text-muted mb-4">
                                Get started by creating your first category.
                            </p>
                            <button 
                                className="btn btn-primary"
                                onClick={() => navigate('/admin/add-category')}
                            >
                                <i className="bi bi-plus-circle me-2"></i>
                                Create Category
                            </button>
                        </div>
                    ) : (
                        <div className="list-group">
                            {categories.map((category) => (
                                <div key={category.id} className="list-group-item p-0 border mb-3 rounded shadow-sm">
                                    {/* Category Header */}
                                    <div 
                                        className="p-3 bg-light cursor-pointer"
                                        onClick={() => toggleCategory(category.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center gap-3">
                                                {category.imageUrl && (
                                                    <img 
                                                        src={category.imageUrl} 
                                                        alt={category.name}
                                                        className="rounded"
                                                        style={{ 
                                                            width: '50px', 
                                                            height: '50px', 
                                                            objectFit: 'cover' 
                                                        }}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                )}
                                                <div>
                                                    <h5 className="mb-1 fw-semibold">{category.name}</h5>
                                                    <small className="text-muted">
                                                        {category.subCategories?.length || 0} subcategories
                                                    </small>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <button 
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditCategory(category.id);
                                                    }}
                                                >
                                                    <i className="bi bi-pencil me-1"></i>
                                                    Edit
                                                </button>
                                                <button 
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteCategory(category.id, category.name);
                                                    }}
                                                >
                                                    <i className="bi bi-trash me-1"></i>
                                                    Delete
                                                </button>
                                                <i 
                                                    className={`bi ${
                                                        expandedCategory === category.id 
                                                            ? 'bi-chevron-down' 
                                                            : 'bi-chevron-right'
                                                    } text-muted ms-2`}
                                                ></i>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subcategories */}
                                    {expandedCategory === category.id && category.subCategories && category.subCategories.length > 0 && (
                                        <div className="p-3 bg-white">
                                            <h6 className="fw-semibold mb-3 text-muted">
                                                <i className="bi bi-diagram-3 me-2"></i>
                                                Subcategories
                                            </h6>
                                            <div className="row g-2">
                                                {category.subCategories.map((subCategory) => (
                                                    <div key={subCategory.id} className="col-12 col-md-6 col-lg-4">
                                                        <div className="card border-0 bg-light">
                                                            <div className="card-body py-2">
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        {subCategory.imageUrl && (
                                                                            <img 
                                                                                src={subCategory.imageUrl} 
                                                                                alt={subCategory.name}
                                                                                className="rounded"
                                                                                style={{ 
                                                                                    width: '30px', 
                                                                                    height: '30px', 
                                                                                    objectFit: 'cover' 
                                                                                }}
                                                                                onError={(e) => {
                                                                                    e.target.style.display = 'none';
                                                                                }}
                                                                            />
                                                                        )}
                                                                        <span className="fw-medium">{subCategory.name}</span>
                                                                    </div>
                                                                    <div className="d-flex gap-1">
                                                                        <button 
                                                                            className="btn btn-outline-primary btn-sm"
                                                                            onClick={() => handleEditSubCategory(subCategory.id)}
                                                                        >
                                                                            <i className="bi bi-pencil"></i>
                                                                        </button>
                                                                        <button 
                                                                            className="btn btn-outline-danger btn-sm"
                                                                            onClick={() => handleDeleteSubCategory(subCategory.id, subCategory.name)}
                                                                        >
                                                                            <i className="bi bi-trash"></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminCategory;