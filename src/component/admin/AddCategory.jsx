import { useState } from "react";
import ApiService from "../../service/ApiService";
import { useNavigate } from "react-router-dom";

const AddCategory = () => {
    const [categoryName, setCategoryName] = useState("");
    const [subCategories, setSubCategories] = useState([{ name: "" }]);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState("");
    const navigate = useNavigate();

    const addSubCategory = () => {
        setSubCategories([...subCategories, { name: "" }]);
    };

    const removeSubCategory = (index) => {
        const updatedSubCategories = subCategories.filter((_, i) => i !== index);
        setSubCategories(updatedSubCategories);
    };

    const handleSubCategoryChange = (index, value) => {
        const updatedSubCategories = subCategories.map((subCat, i) =>
            i === index ? { ...subCat, name: value } : subCat
        );
        setSubCategories(updatedSubCategories);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageError(""); // Clear any previous errors
        
        if (file) {
            if (!file.type.startsWith('image/')) {
                setImageError("Please select a valid image file.");
                setImageFile(null);
                setImagePreview(null);
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setImageError("Image size should be less than 5MB.");
                setImageFile(null);
                setImagePreview(null);
                return;
            }

            setImageFile(file);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setImageError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setImageError("");

        // Manual validation instead of relying on HTML5 validation
        if (!categoryName.trim()) {
            setMessage("Category name is required.");
            setLoading(false);
            return;
        }

        if (!imageFile) {
            setImageError("Category image is required.");
            setLoading(false);
            return;
        }

        const body = {
            name: categoryName.trim(),
            subCategories: subCategories
                .filter((subCat) => subCat.name.trim() !== "")
                .map((subCat) => ({ name: subCat.name.trim() })),
        };

        try {
            const response = await ApiService.createCategory(body, imageFile);
            if (response.status === 200) {
                setMessage("Category created successfully!");
                setTimeout(() => {
                    setMessage("");
                    navigate("/admin/categories");
                }, 2000);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || error.message || "Failed to create category.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="h3 mb-0">Add New Category</h2>
                        <button 
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => navigate('/admin/categories')}
                        >
                            <i className="bi bi-arrow-left me-2"></i>
                            Back
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

                    {/* Form */}
                    <div className="card shadow-sm">
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit} noValidate> {/* Add noValidate to disable browser validation */}
                                {/* Category Name */}
                                <div className="mb-4">
                                    <label htmlFor="categoryName" className="form-label fw-semibold">
                                        Category Name *
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        id="categoryName"
                                        placeholder="Enter category name"
                                        value={categoryName}
                                        onChange={(e) => setCategoryName(e.target.value)}
                                    />
                                </div>

                                {/* Image Upload */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">
                                        Category Image *
                                    </label>
                                    
                                    {/* Image Error */}
                                    {imageError && (
                                        <div className="alert alert-danger" role="alert">
                                            <i className="bi bi-exclamation-triangle me-2"></i>
                                            {imageError}
                                        </div>
                                    )}
                                    
                                    {imagePreview ? (
                                        <div className="text-center">
                                            <div className="mb-3">
                                                <img 
                                                    src={imagePreview} 
                                                    alt="Category preview" 
                                                    className="img-fluid rounded shadow-sm"
                                                    style={{ 
                                                        maxHeight: '200px',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            </div>
                                            <div className="d-flex gap-2 justify-content-center">
                                                <label 
                                                    htmlFor="categoryImage" 
                                                    className="btn btn-outline-primary btn-sm"
                                                >
                                                    <i className="bi bi-arrow-repeat me-2"></i>
                                                    Change Image
                                                </label>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={removeImage}
                                                >
                                                    <i className="bi bi-trash me-2"></i>
                                                    Remove Image
                                                </button>
                                            </div>
                                            {/* Remove required attribute from hidden input */}
                                            <input
                                                type="file"
                                                id="categoryImage"
                                                className="d-none"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed rounded p-4 text-center bg-light">
                                            {/* Remove required attribute from hidden input */}
                                            <input
                                                type="file"
                                                id="categoryImage"
                                                className="d-none"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                            <label 
                                                htmlFor="categoryImage" 
                                                className="cursor-pointer d-block"
                                            >
                                                <i className="bi bi-cloud-arrow-up display-4 text-muted mb-3"></i>
                                                <p className="text-muted mb-2">
                                                    Click to upload category image
                                                </p>
                                                <small className="text-muted">
                                                    Maximum file size: 5MB
                                                </small>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                {/* Subcategories */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">
                                        Subcategories (Optional)
                                    </label>
                                    {subCategories.map((subCat, index) => (
                                        <div key={index} className="d-flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder={`Subcategory ${index + 1}`}
                                                value={subCat.name}
                                                onChange={(e) => handleSubCategoryChange(index, e.target.value)}
                                            />
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger"
                                                    onClick={() => removeSubCategory(index)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={addSubCategory}
                                    >
                                        <i className="bi bi-plus-circle me-2"></i>
                                        Add Subcategory
                                    </button>
                                </div>

                                {/* Submit Button */}
                                <div className="d-grid">
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary btn-lg"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-circle me-2"></i>
                                                Create Category
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddCategory;