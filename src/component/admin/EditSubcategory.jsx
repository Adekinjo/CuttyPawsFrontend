import { useState, useEffect } from "react";
import ApiService from "../../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";

const EditSubCategory = () => {
    const { subCategoryId } = useParams();
    const [name, setName] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImageUrl, setExistingImageUrl] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSubCategory();
    }, [subCategoryId]);

    const fetchSubCategory = async () => {
        try {
            const response = await ApiService.getSubCategoryById(subCategoryId);
            const subCategory = response.subCategory;
            
            setName(subCategory.name);
            setExistingImageUrl(subCategory.imageUrl || "");
            
        } catch (error) {
            setMessage(error.response?.data?.message || error.message || "Failed to fetch subcategory");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setMessage("Please select a valid image file.");
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setMessage("Image size should be less than 5MB.");
                return;
            }

            setImageFile(file);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            
            setMessage("");
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setExistingImageUrl("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!name) {
            setMessage("Subcategory name is required.");
            setLoading(false);
            return;
        }

        try {
            const body = { name: name };
            const response = await ApiService.updateSubCategory(subCategoryId, body, imageFile);
            
            if (response.status === 200) {
                setMessage("Subcategory updated successfully!");
                
                // Refresh the data to get the updated image
                await fetchSubCategory();
                
                setTimeout(() => {
                    navigate("/admin/subcategories");
                }, 2000);
            }
        } catch (error) {
            console.error("Update error:", error);
            setMessage(error.response?.data?.message || error.message || "Failed to update subcategory.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/admin/subcategories");
    };

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="h3 mb-0">Edit Subcategory</h2>
                        <button 
                            className="btn btn-outline-secondary"
                            onClick={handleCancel}
                        >
                            <i className="bi bi-arrow-left me-2"></i>
                            Back to Subcategories
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

                    {/* Current Image Preview */}
                    {existingImageUrl && !imagePreview && (
                        <div className="alert alert-info mb-4">
                            <div className="d-flex align-items-center">
                                <i className="bi bi-info-circle me-2"></i>
                                <div>
                                    <strong>Current Image:</strong> The image below is the current subcategory image.
                                    Upload a new one to replace it.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <div className="card shadow-sm">
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                {/* Subcategory Name */}
                                <div className="mb-4">
                                    <label htmlFor="subcategoryName" className="form-label fw-semibold">
                                        Subcategory Name *
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        id="subcategoryName"
                                        placeholder="Enter subcategory name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Image Upload */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">
                                        Subcategory Image
                                    </label>
                                    
                                    {(imagePreview || existingImageUrl) ? (
                                        <div className="text-center">
                                            <div className="mb-3">
                                                <img 
                                                    src={imagePreview || existingImageUrl} 
                                                    alt="Subcategory preview" 
                                                    className="img-fluid rounded shadow-sm"
                                                    style={{ 
                                                        maxHeight: '200px',
                                                        objectFit: 'cover'
                                                    }}
                                                    onError={(e) => {
                                                        e.target.src = '/default-subcategory-image.jpg';
                                                    }}
                                                />
                                            </div>
                                            <div className="d-flex gap-2 justify-content-center">
                                                <label 
                                                    htmlFor="subcategoryImage" 
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
                                            <input
                                                type="file"
                                                id="subcategoryImage"
                                                className="d-none"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed rounded p-4 text-center bg-light">
                                            <input
                                                type="file"
                                                id="subcategoryImage"
                                                className="d-none"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                            <label 
                                                htmlFor="subcategoryImage" 
                                                className="cursor-pointer"
                                            >
                                                <i className="bi bi-cloud-arrow-up display-4 text-muted mb-3"></i>
                                                <p className="text-muted mb-2">
                                                    Click to upload subcategory image
                                                </p>
                                                <small className="text-muted">
                                                    Maximum file size: 5MB
                                                </small>
                                            </label>
                                        </div>
                                    )}
                                    <div className="form-text text-muted mt-2">
                                        {existingImageUrl ? 
                                            "Upload a new image to replace the current one, or leave empty to keep it." :
                                            "Add an image to this subcategory."
                                        }
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-secondary me-md-2"
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
                                                Update Subcategory
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

export default EditSubCategory;