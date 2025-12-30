import { useState, useEffect } from "react";
import ApiService from "../../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";

const EditCategory = () => {
    const { categoryId } = useParams();
    const [name, setName] = useState("");
    const [subCategories, setSubCategories] = useState([]);
    const [newSubCategory, setNewSubCategory] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImageUrl, setExistingImageUrl] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // success or danger
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Fetch the category and its subcategories when the component mounts
    useEffect(() => {
        fetchCategory();
    }, [categoryId]);

    // Fetch the category and its subcategories
    const fetchCategory = async () => {
        try {
            const response = await ApiService.getCategoryById(categoryId);
            const category = response.category;
            
            setName(category.name);
            setSubCategories(category.subCategories || []);
            setExistingImageUrl(category.imageUrl || "");
            
        } catch (error) {
            showMessage(error.response?.data?.message || error.message || "Failed to fetch category", "danger");
        }
    };

    // Helper function to show messages
    const showMessage = (msg, type = "danger") => {
        setMessage(msg);
        setMessageType(type);
    };

    // Handle image file selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showMessage("Please select a valid image file.");
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showMessage("Image size should be less than 5MB.");
                return;
            }

            setImageFile(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            
            // Clear any existing message
            setMessage("");
            setMessageType("");
        }
    };

    // Remove selected image
    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setExistingImageUrl(""); // Also clear existing image URL
    };

    // Handle adding a new subcategory
    const addSubCategory = async () => {
        if (newSubCategory.trim() !== "") {
            try {
                // Call the API to create a new subcategory
                const response = await ApiService.createSubCategory({
                    name: newSubCategory,
                    categoryId: categoryId,
                });

                if (response.status === 200) {
                    // Manually construct the new subcategory object
                    const newSubCategoryObj = {
                        id: Date.now(), // Temporary ID
                        name: newSubCategory,
                        categoryId: categoryId,
                    };

                    // Add the new subcategory to the local state
                    setSubCategories([...subCategories, newSubCategoryObj]);
                    setNewSubCategory(""); // Clear the input field
                    showMessage("Subcategory added successfully", "success");
                    
                    // Refresh the category to get actual IDs from backend
                    setTimeout(() => {
                        fetchCategory();
                    }, 500);
                } else {
                    showMessage("Failed to add subcategory.");
                }
            } catch (error) {
                showMessage(error.response?.data?.message || error.message || "Failed to add subcategory");
            }
        }
    };

    // Handle updating a subcategory
    const updateSubCategory = async (index, subCategoryId, updatedName) => {
        if (!updatedName.trim()) {
            showMessage("Subcategory name cannot be empty");
            return;
        }

        try {
            // Call the API to update the subcategory
            const response = await ApiService.updateSubCategory(subCategoryId, {
                name: updatedName,
            });
            if (response.status === 200) {
                // Update the subcategory in the local state
                const updatedSubCategories = subCategories.map((subCat, i) =>
                    i === index ? { ...subCat, name: updatedName } : subCat
                );
                setSubCategories(updatedSubCategories);
                showMessage("Subcategory updated successfully", "success");
            }
        } catch (error) {
            showMessage(error.response?.data?.message || error.message || "Failed to update subcategory");
        }
    };

    // Handle removing a subcategory
    const removeSubCategory = async (index, subCategoryId) => {
        const confirmed = window.confirm("Are you sure you want to delete this subcategory?");
        if (!confirmed) return;

        try {
            // Call the API to delete the subcategory
            await ApiService.deleteSubCategory(subCategoryId);
            // Remove the subcategory from the local state
            const updatedSubCategories = subCategories.filter((_, i) => i !== index);
            setSubCategories(updatedSubCategories);
            showMessage("Subcategory deleted successfully", "success");
        } catch (error) {
            showMessage(error.response?.data?.message || error.message || "Failed to delete subcategory");
        }
    };

    // Handle form submission (updating the main category)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validate required fields
        if (!name) {
            showMessage("Category name is required.");
            setLoading(false);
            return;
        }

        try {
            // Prepare the request body
            const body = {
                name: name,
                subCategories: subCategories.map(subCat => ({
                    id: subCat.id,
                    name: subCat.name
                })),
            };

            // Call the API to update the category with optional image
            const response = await ApiService.updateCategory(categoryId, body, imageFile);
            
            if (response.status === 200) {
                showMessage("Category updated successfully!", "success");
                setTimeout(() => {
                    setMessage("");
                    setMessageType("");
                    navigate("/admin/categories");
                }, 2000);
            }
        } catch (error) {
            showMessage(error.response?.data?.message || error.message || "Failed to update category.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/admin/categories");
    };

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-8 col-xl-6">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="h3 mb-0">Edit Category</h2>
                        <button 
                            className="btn btn-outline-secondary"
                            onClick={handleCancel}
                        >
                            <i className="bi bi-arrow-left me-2"></i>
                            Back to Categories
                        </button>
                    </div>

                    {/* Message Alert */}
                    {message && (
                        <div className={`alert alert-${messageType} alert-dismissible fade show`} role="alert">
                            {message}
                            <button 
                                type="button" 
                                className="btn-close" 
                                onClick={() => {
                                    setMessage("");
                                    setMessageType("");
                                }}
                            ></button>
                        </div>
                    )}

                    {/* Main Form */}
                    <div className="card shadow-sm">
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                {/* Category Name */}
                                <div className="mb-4">
                                    <label htmlFor="categoryName" className="form-label fw-semibold">
                                        Category Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        id="categoryName"
                                        placeholder="Enter category name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Image Upload Section */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Category Image</label>
                                    
                                    {(imagePreview || existingImageUrl) ? (
                                        <div className="border rounded p-3 bg-light">
                                            <div className="text-center mb-3">
                                                <img 
                                                    src={imagePreview || existingImageUrl} 
                                                    alt="Category preview" 
                                                    className="img-fluid rounded"
                                                    style={{ maxHeight: '200px', objectFit: 'contain' }}
                                                    onError={(e) => {
                                                        e.target.src = '/default-category-image.jpg';
                                                    }}
                                                />
                                            </div>
                                            <div className="d-flex gap-2 justify-content-center">
                                                <label htmlFor="categoryImage" className="btn btn-outline-primary btn-sm">
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
                                            <input
                                                type="file"
                                                id="categoryImage"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="border rounded p-4 text-center bg-light">
                                            <input
                                                type="file"
                                                id="categoryImage"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="d-none"
                                            />
                                            <label htmlFor="categoryImage" className="btn btn-outline-primary mb-2">
                                                <i className="bi bi-cloud-upload me-2"></i>
                                                Upload Category Image
                                            </label>
                                            <p className="text-muted small mb-1">Click to upload category image</p>
                                            <p className="text-muted small">Max file size: 5MB • Leave empty to keep current image</p>
                                        </div>
                                    )}
                                </div>

                                {/* Subcategories Section */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Subcategories</label>
                                    
                                    {/* Existing Subcategories */}
                                    {subCategories.length > 0 ? (
                                        <div className="mb-3">
                                            {subCategories.map((subCat, index) => (
                                                <div key={subCat.id || index} className="input-group mb-2">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder={`Subcategory ${index + 1}`}
                                                        value={subCat.name}
                                                        onChange={(e) => {
                                                            const updatedSubCategories = [...subCategories];
                                                            updatedSubCategories[index] = {
                                                                ...updatedSubCategories[index],
                                                                name: e.target.value
                                                            };
                                                            setSubCategories(updatedSubCategories);
                                                        }}
                                                        onBlur={() => {
                                                            if (subCat.id && subCat.id !== Date.now()) {
                                                                updateSubCategory(index, subCat.id, subCat.name);
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger"
                                                        onClick={() => removeSubCategory(index, subCat.id)}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-3 text-muted bg-light rounded mb-3">
                                            <i className="bi bi-inboxes display-6 d-block mb-2"></i>
                                            No subcategories yet
                                        </div>
                                    )}

                                    {/* Add New Subcategory */}
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter new subcategory name"
                                            value={newSubCategory}
                                            onChange={(e) => setNewSubCategory(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addSubCategory();
                                                }
                                            }}
                                        />
                                        <button 
                                            type="button" 
                                            className="btn btn-success"
                                            onClick={addSubCategory}
                                            disabled={!newSubCategory.trim()}
                                        >
                                            <i className="bi bi-plus-circle me-2"></i>
                                            Add
                                        </button>
                                    </div>
                                    <div className="form-text">
                                        Press Enter or click Add to create a new subcategory
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="d-flex gap-2 justify-content-end pt-3 border-top">
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-secondary"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-circle me-2"></i>
                                                Update Category
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

export default EditCategory;