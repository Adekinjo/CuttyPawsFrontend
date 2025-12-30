import axios from "axios";
import ApiService from "./ApiService";

export default class ProductService extends ApiService{

      /**    PRODUCT ENDPOINT */
  static async addProduct(formData) {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/product/create`,
        formData,
        {
          headers: {
            ...this.getHeader(),
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  }

  static async searchProductBySubCategory(subCategoryId) {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/product/search-by-subcategory`,
        {
          params: { subCategoryId },
        }
      );

      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error searching products by subcategory:", error);
      if (error.response) {
        throw new Error(
          `Server error: ${
            error.response.data.message || error.response.statusText
          }`
        );
      } else if (error.request) {
        throw new Error(
          "No response received from the server. Please check your network connection."
        );
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    }
  }

  static async updateProduct(productId, formData) {
    const response = await axios.put(
      `${this.BASE_URL}/product/update/${productId}`,
      formData,
      {
        headers: {
          ...this.getHeader(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  static async getAllProduct() {
    const response = await axios.get(`${this.BASE_URL}/product/get-all`);
    return response.data;
  }

  static async getAllProductsBySubCategory(subCategoryId) {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/product/subcategory/${subCategoryId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching products by subcategory:", error);
      throw error;
    }
  }

  static async searchProduct(searchValue) {
    const response = await axios.get(`${this.BASE_URL}/search/products`, {
      params: { query: searchValue },
    });
    return response.data;
  }

  static async getSearchSuggestions(query) {
    try {
      const response = await axios.get(`${this.BASE_URL}/product/suggestions`, {
        params: { query },
      });
      return response.data.suggestions;
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      return [];
    }
  }

  static async searchProductsWithPrice(name, categoryId, minPrice, maxPrice) {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/product/search-with-price`,
        {
          params: {
            name: name || null,
            categoryId: categoryId || null,
            minPrice: minPrice || null,
            maxPrice: maxPrice || null,
          },
          headers: this.getHeader(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error searching products with price:", error);
      throw error;
    }
  }

  static async getRelatedProducts(searchTerm) {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/search/related-products/${searchTerm}`,
        {
          headers: this.getHeader(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching related products:", error);
      throw error;
    }
  }

  static async getProductsByNameAndCategory(name, categoryId) {
    try {
      const headers = {};
      const token = localStorage.getItem("token");
      if (token) {
        headers.Authorization = `Bearer ${token}`; // Include token only if it exists
      }

      const response = await axios.get(
        `${this.BASE_URL}/product/filter-by-name-and-category`,
        {
          params: { name, categoryId },
          headers: headers,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error); // Debugging
      throw error;
    }
  }

  static async getAllProductByCategoryId(categoryId) {
    const response = await axios.get(
      `${this.BASE_URL}/product/get-by-category-id/${categoryId}`
    );
    return response.data;
  }

  static async getProductById(productId) {
    const response = await axios.get(
      `${this.BASE_URL}/product/get-product-by/${productId}`
    );
    return response.data;
  }

  static async deleteProduct(productId) {
    const response = await axios.delete(
      `${this.BASE_URL}/product/delete/${productId}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async getTrendingProducts() {
    try {
      const response = await axios.get(`${this.BASE_URL}/product/trending`);
      return response.data.trendingProducts || [];
    } catch (error) {
      console.error("API Error:", error);
      return [];
    }
  }

  static async getFeaturedProducts() {
    try {
      const response = await axios.get(`${this.BASE_URL}/product/featured`);
      // Changed from productList to featuredProducts
      return { featuredProducts: response.data?.featuredProducts || [] };
    } catch (error) {
      console.error("Error fetching featured products:", error);
      return { featuredProducts: [] };
    }
  }

  static async trackProductView(productId) {
    try {
      await axios.post(
        `${this.BASE_URL}/product/${productId}/view`,
        {},
        {
          headers: this.getHeader(),
        }
      );
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  }
    // Function to like a product
  static async likeProduct(productId) {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/product/${productId}/like`
      );
      return response.data;
    } catch (error) {
      toast.error("Failed to like the product. Please try again.");
      throw error;
    }
  }

  // Function to get all products with their likes
  static async getAllLikes() {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/product/all-with-likes`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching likes:", error);
      toast.error("Failed to fetch likes. Please try again.");
      throw error;
    }
  }
}