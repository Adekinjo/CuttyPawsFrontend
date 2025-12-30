
import { useState, useEffect } from "react";
import ApiService from "../../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";
import "../../style/EditProduct.css";

const CompanyEditProduct = () => {
  const { productId } = useParams();
  const [images, setImages] = useState([]); 
  const [existingImages, setExistingImages] = useState([]); 
  const [categories, setCategories] = useState([]); 
  const [subCategories, setSubCategories] = useState([]); 
  const [name, setName] = useState(""); 
  const [description, setDescription] = useState(""); 
  const [oldPrice, setOldPrice] = useState(""); 
  const [stock, setStock] = useState("");
  const [newPrice, setNewPrice] = useState(""); 
  const [categoryId, setCategoryId] = useState(""); 
  const [subCategoryId, setSubCategoryId] = useState(""); 
  const [sizes, setSizes] = useState(""); 
  const [colors, setColors] = useState(""); 
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Fetch all categories and product details on component mount
  useEffect(() => {
    // Fetch all categories
    ApiService.getAllCategories()
      .then((res) => setCategories(res.categoryList))
      .catch((error) => {
        console.error("Failed to fetch categories:", error);
        setMessage("Failed to fetch categories. Please try again.");
      });

    // Fetch product details if productId exists
    if (productId) {
      ApiService.getProductById(productId)
        .then((response) => {
          const product = response.product;
          setName(product.name);
          setDescription(product.description);
          setStock(product.stock);
          setOldPrice(product.oldPrice);
          setNewPrice(product.newPrice);
          setCategoryId(product.categoryId);
          setSubCategoryId(product.subCategoryId);
          setExistingImages(product.imageUrls || []);

          // Set sizes and colors if they exist
          if (product.sizes) {
            setSizes(product.sizes.join(","));
          }
          if (product.colors) {
            setColors(product.colors.join(",")); 
          }

          // Fetch subcategories for the selected category
          if (product.categoryId) {
            ApiService.getCategoryById(product.categoryId)
              .then((res) => setSubCategories(res.category.subCategories || []))
              .catch((error) => {
                console.error("Failed to fetch subcategories:", error);
                setMessage("Failed to fetch subcategories. Please try again.");
              });
          }
        })
        .catch((error) => {
          console.error("Failed to fetch product details:", error);
          setMessage("Failed to fetch product details. Please try again.");
        });
    }
  }, [productId]);

  useEffect(() => {
    if (categoryId) {
      ApiService.getCategoryById(categoryId)
        .then((res) => setSubCategories(res.category.subCategories || []))
        .catch((error) => {
          console.error("Failed to fetch subcategories:", error);
          setMessage("Failed to fetch subcategories. Please try again.");
        });
    } else {
      setSubCategories([]); 
    }
  }, [categoryId]);

  // Handle image selection
  const handleImages = (e) => {
    const files = Array.from(e.target.files); 
    const validFiles = files.filter((file) => file.type.startsWith("image/")); 
    if (validFiles.length !== files.length) {
      setMessage("Only image files are allowed.");
      return;
    }
    setImages(validFiles); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !description || !newPrice || !categoryId) {
      setMessage("Please fill out all required fields.");
      return;
    }

    try {
      const formData = new FormData();
      images.forEach((image) => formData.append("images", image)); 
      formData.append("name", name);
      formData.append("stock", stock);
      formData.append("categoryId", categoryId);
      formData.append("subCategoryId", subCategoryId); 
      formData.append("description", description);
      formData.append("oldPrice", oldPrice || "0"); 
      formData.append("newPrice", newPrice);

      if (sizes) {
        formData.append("sizes", sizes);
      }
      if (colors) {
        formData.append("colors", colors);
      }

      const response = await ApiService.companyUpdateProduct(productId, formData);
      if (response.status === 200) {
        setMessage("Product updated successfully!");
        setTimeout(() => {
          setMessage("");
          navigate("/company/company-products");
        }, 3000);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      setMessage(error.response?.data?.message || error.message || "Unable to update product.");
    }
  };

  return (
    <div className="edit-product-container">
      <h2 className="edit-product-title">Edit Product</h2>
      {message && <div className="message">{message}</div>}
      <form onSubmit={handleSubmit} className="edit-product-form">
        {/* Image Upload Section */}
        <div className="form-group">
          <label htmlFor="images" className="form-label">
            Upload New Images (Multiple)
          </label>
          <input
            type="file"
            id="images"
            multiple
            onChange={handleImages}
            className="form-input"
          />
          {images.length > 0 && (
            <div className="image-preview">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index}`}
                  className="preview-image"
                />
              ))}
            </div>
          )}
        </div>

        {/* Existing Images Section */}
        {existingImages.length > 0 && (
          <div className="form-group">
            <label className="form-label">Existing Images</label>
            <div className="existing-images">
              {existingImages.map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`Existing ${index}`}
                  className="existing-image"
                />
              ))}
            </div>
          </div>
        )}

        {/* Category Selection */}
        <div className="form-group">
          <label htmlFor="category" className="form-label">
            Category
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="form-input"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option value={cat.id} key={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory Selection */}
        {categoryId && (
          <div className="form-group">
            <label htmlFor="subCategory" className="form-label">
              Subcategory
            </label>
            <select
              id="subCategory"
              value={subCategoryId}
              onChange={(e) => setSubCategoryId(e.target.value)}
              className="form-input"
              required
            >
              <option value="">Select Subcategory</option>
              {subCategories.map((subCat) => (
                <option value={subCat.id} key={subCat.id}>
                  {subCat.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Product Name */}
        <div className="form-group">
          <label htmlFor="stock" className="form-label">
            qty in stock
          </label>
          <input
            type="number"
            id="stock"
            placeholder="Enter qty in stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="form-input"
            required
          />
        </div>

        {/* Product Name */}
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Product Name
          </label>
          <input
            type="text"
            id="name"
            placeholder="Enter product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            required
          />
        </div>

        {/* Product Description */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            placeholder="Enter product description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
            required
          />
        </div>

        {/* Old Price */}
        <div className="form-group">
          <label htmlFor="oldPrice" className="form-label">
            Old Price (Optional)
          </label>
          <input
            type="number"
            id="oldPrice"
            placeholder="Enter old price"
            value={oldPrice}
            onChange={(e) => setOldPrice(e.target.value)}
            className="form-input"
          />
        </div>

        {/* New Price */}
        <div className="form-group">
          <label htmlFor="newPrice" className="form-label">
            New Price
          </label>
          <input
            type="number"
            id="newPrice"
            placeholder="Enter new price"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            className="form-input"
            required
          />
        </div>

        {/* Sizes (Optional) */}
        <div className="form-group">
          <label htmlFor="sizes" className="form-label">
            Sizes (Optional, comma-separated)
          </label>
          <input
            type="text"
            id="sizes"
            placeholder="Enter sizes (e.g., S,M,L)"
            value={sizes}
            onChange={(e) => setSizes(e.target.value)}
            className="form-input"
          />
        </div>

        {/* Colors (Optional) */}
        <div className="form-group">
          <label htmlFor="colors" className="form-label">
            Colors (Optional, comma-separated)
          </label>
          <input
            type="text"
            id="colors"
            placeholder="Enter colors (e.g., Red,Blue,Green)"
            value={colors}
            onChange={(e) => setColors(e.target.value)}
            className="form-input"
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-button">
          Update Product
        </button>
      </form>
    </div>
  );
};

export default CompanyEditProduct;