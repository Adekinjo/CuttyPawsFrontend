

import { useState, useEffect } from "react";
import ApiService from "../../service/ApiService";
import { useNavigate } from "react-router-dom";
import "../../style/AddProduct.css";

const AddProduct = () => {
  const [images, setImages] = useState([]); 
  const [categories, setCategories] = useState([]); 
  const [subCategories, setSubCategories] = useState([]);
  const [name, setName] = useState(""); 
  const [stock, setStock] = useState(""); 
  const [description, setDescription] = useState(""); 
  const [oldPrice, setOldPrice] = useState("");
  const [newPrice, setNewPrice] = useState(""); 
  const [categoryId, setCategoryId] = useState(""); 
  const [subCategoryId, setSubCategoryId] = useState(""); 
  const [sizes, setSizes] = useState(""); 
  const [colors, setColors] = useState(""); 
  const [message, setMessage] = useState(""); 
  const navigate = useNavigate();

  // Fetch all categories on component mount
  useEffect(() => {
    ApiService.getAllCategories()
      .then((res) => setCategories(res.categoryList))
      .catch((error) => {
        console.error("Failed to fetch categories:", error);
        setMessage("Failed to fetch categories. Please try again.");
      });
  }, []);

  // Fetch subcategories when a category is selected
  useEffect(() => {
    if (categoryId) {
      ApiService.getCategoryById(categoryId)
        .then((res) => setSubCategories(res.category.subCategories || []))
        .catch((error) => {
          console.error("Failed to fetch subcategories:", error);
          setMessage("Failed to fetch subcategories. Please try again.");
        });
    } else {
      setSubCategories([]); // Clear subcategories if no category is selected
    }
  }, [categoryId]);

  // Handle image selection
  const handleImages = (e) => {
    const files = Array.from(e.target.files); // Convert FileList to an array
    const validFiles = files.filter((file) => file.type.startsWith("image/")); // Filter only image files
    if (validFiles.length !== files.length) {
      setMessage("Only image files are allowed.");
      return;
    }
    setImages(validFiles); // Set valid image files
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!name || !description ||!stock || !newPrice || !categoryId || images.length === 0) {
      setMessage("Please fill out all required fields and upload at least one image.");
      return;
    }

    try {
      const formData = new FormData();
      images.forEach((image) => formData.append("images", image)); // Append images
      formData.append("name", name);
      formData.append("categoryId", categoryId);
      formData.append("subCategoryId", subCategoryId); 
      formData.append("description", description);
      formData.append("stock", stock);
      formData.append("oldPrice", oldPrice || "0"); 
      formData.append("newPrice", newPrice);

      // Append sizes and colors if provided
      if (sizes) {
        formData.append("sizes", sizes);
      }
      if (colors) {
        formData.append("colors", colors);
      }

      // Call the API to add the product
      const response = await ApiService.addProduct(formData);
      if (response.status === 200) {
        setMessage("Product created successfully!");
        setTimeout(() => {
          setMessage("");
          navigate("/admin/products"); // Redirect to the product list page
        }, 3000);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setMessage(error.response?.data?.message || error.message || "Unable to add product.");
    }
  };

  return (
    <div className="add-product-container">
      <h2 className="add-product-title">Add Product</h2>
      {message && <div className="message">{message}</div>}
      <form onSubmit={handleSubmit} className="add-product-form">
        {/* Image Upload Section */}
        <div className="form-group">
          <label htmlFor="images" className="form-label">
            Upload Images (Multiple)
          </label>
          <input
            type="file"
            id="images"
            multiple
            onChange={handleImages}
            className="form-input"
            required
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
        {/* Product in stock */}
        <div className="form-group">
          <label htmlFor="stock" className="form-label">
            qty in stock
          </label>
          <input
            id="stock"
            placeholder="Enter product quantity in stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
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
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProduct;