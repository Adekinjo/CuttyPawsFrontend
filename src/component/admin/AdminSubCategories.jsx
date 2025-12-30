import { useState, useEffect } from "react";
import ApiService from "../../service/CategoryService";
import { useNavigate } from "react-router-dom";

const AdminSubCategories = () => {
    const [subCategories, setSubCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchSubCategories();
    }, []);

    const fetchSubCategories = async () => {
        try {
            setLoading(true);
            const response = await ApiService.getAllSubCategories();
            setSubCategories(response.subCategoryList || []);
        } catch (error) {
            console.error("Error fetching subcategories:", error);
            setMessage("Failed to load subcategories");
        } finally {
            setLoading(false);
        }
    };

    const handleEditSubCategory = (subCategoryId) => {
        navigate(`/admin/edit-subcategory/${subCategoryId}`);
    };

    const handleDeleteSubCategory = async (subCategoryId, subCategoryName) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete the subcategory "${subCategoryName}"? This action cannot be undone.`
        );
        
        if (confirmed) {
            try {
                await ApiService.deleteSubCategory(subCategoryId);
                setMessage("Subcategory deleted successfully!");
                // Refresh the list
                fetchSubCategories();
            } catch (error) {
                console.error("Error deleting subcategory:", error);
                setMessage("Failed to delete subcategory");
            }
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    // Filter subcategories based on search term
    const filteredSubCategories = subCategories.filter(subCategory =>
        subCategory.name.toLowerCase().includes(searchTerm)
    );

    if (loading) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-12 text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Loading subcategories...</p>
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
                    <h1 className="h2 mb-1">Subcategory Management</h1>
                    <p className="text-muted mb-0">
                        Manage all product subcategories
                    </p>
                </div>
                <button 
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/admin/categories")}
                >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Categories
                </button>
            </div>

            {/* Message Alert */}
            {message && (
                <div 
                    className={`alert ${
                        message.includes("successfully") 
                            ? "alert-success" 
                            : "alert-danger"
                    } mb-4`}
                    role="alert"
                >
                    {message}
                </div>
            )}

            {/* Search and Stats */}
            <div className="row mb-4">
                <div className="col-12 col-md-6">
                    <div className="input-group">
                        <span className="input-group-text">
                            <i className="bi bi-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search subcategories..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                </div>
                <div className="col-12 col-md-6 text-md-end">
                    <div className="d-flex align-items-center justify-content-md-end gap-3 mt-2 mt-md-0">
                        <span className="text-muted">
                            <i className="bi bi-grid-3x3-gap-fill me-2"></i>
                            {filteredSubCategories.length} of {subCategories.length} subcategories
                        </span>
                    </div>
                </div>
            </div>

            {/* Subcategories Table */}
            <div className="card shadow-sm">
                <div className="card-body p-0">
                    {filteredSubCategories.length === 0 ? (
                        <div className="text-center py-5">
                            {searchTerm ? (
                                <>
                                    <i className="bi bi-search display-1 text-muted mb-3"></i>
                                    <h3 className="h4 text-muted mb-3">No Subcategories Found</h3>
                                    <p className="text-muted mb-4">
                                        No subcategories match your search criteria.
                                    </p>
                                    <button 
                                        className="btn btn-outline-primary"
                                        onClick={() => setSearchTerm("")}
                                    >
                                        Clear Search
                                    </button>
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-inboxes display-1 text-muted mb-3"></i>
                                    <h3 className="h4 text-muted mb-3">No Subcategories Found</h3>
                                    <p className="text-muted mb-4">
                                        There are no subcategories available. Create some from the categories page.
                                    </p>
                                    <button 
                                        className="btn btn-primary"
                                        onClick={() => navigate("/admin/categories")}
                                    >
                                        <i className="bi bi-plus-circle me-2"></i>
                                        Go to Categories
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th scope="col" style={{width: '80px'}}>Image</th>
                                        <th scope="col">Subcategory Name</th>
                                        <th scope="col">Category</th>
                                        <th scope="col" style={{width: '150px'}}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSubCategories.map((subCategory) => (
                                        <tr key={subCategory.id}>
                                            <td>
                                                {subCategory.imageUrl ? (
                                                    <img 
                                                        src={subCategory.imageUrl} 
                                                        alt={subCategory.name}
                                                        className="rounded"
                                                        style={{
                                                            width: '50px',
                                                            height: '50px',
                                                            objectFit: 'cover'
                                                        }}
                                                        onError={(e) => {
                                                            e.target.src = '/default-subcategory-image.jpg';
                                                        }}
                                                    />
                                                ) : (
                                                    <div 
                                                        className="rounded d-flex align-items-center justify-content-center bg-light"
                                                        style={{
                                                            width: '50px',
                                                            height: '50px'
                                                        }}
                                                    >
                                                        <i className="bi bi-image text-muted"></i>
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div>
                                                    <h6 className="mb-1 fw-semibold">{subCategory.name}</h6>
                                                    <small className="text-muted">ID: {subCategory.id}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-muted">
                                                    {subCategory.categoryName || `Category ID: ${subCategory.categoryId}`}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <button 
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => handleEditSubCategory(subCategory.id)}
                                                        title="Edit Subcategory"
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button 
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() => handleDeleteSubCategory(subCategory.id, subCategory.name)}
                                                        title="Delete Subcategory"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Additional Info */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="alert alert-info" role="alert">
                        <div className="d-flex align-items-center">
                            <i className="bi bi-info-circle-fill me-2"></i>
                            <div>
                                <strong>Tip:</strong> You can also manage subcategories from the main categories page 
                                by expanding each category to see its subcategories.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSubCategories;