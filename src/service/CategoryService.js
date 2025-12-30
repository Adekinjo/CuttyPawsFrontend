import axios from "axios";
import ApiService from "./ApiService";
export default class CategoryService extends ApiService {
      
  /** REVIEW ENDPOINT */

  static async getReviewsByProductId(productId) {
    const response = await axios.get(
      `${this.BASE_URL}/reviews/product/${productId}`
    );
    return response.data;
  }

  static async getAllReviews() {
    const response = await axios.get(`${this.BASE_URL}/reviews/getAll`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async deleteReview(reviewId) {
    const response = await axios.delete(
      `${this.BASE_URL}/reviews/delete/${reviewId}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async addReview(reviewData) {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/reviews`,
        reviewData,
        {
          headers: this.getHeader(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error;
    }
  }

  /**  CATEGORY */

  static async createCategory(body, imageFile = null) {
    const formData = new FormData();
    
    // Append category data as JSON string
    formData.append('category', new Blob([JSON.stringify(body)], {
        type: 'application/json'
    }));
    
    // Append image file if provided
    if (imageFile) {
        formData.append('image', imageFile);
    }

    const response = await axios.post(
        `${this.BASE_URL}/category/create`,
        formData,
        {
            headers: {
                ...this.getHeader(),
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response.data;
  }

  static async updateCategory(categoryId, body, imageFile = null) {
    const formData = new FormData();
    
    // Append category data as JSON string
    formData.append('category', new Blob([JSON.stringify(body)], {
        type: 'application/json'
    }));
    
    // Append image file if provided
    if (imageFile) {
        formData.append('image', imageFile);
    }

    const response = await axios.put(
        `${this.BASE_URL}/category/update/${categoryId}`,
        formData,
        {
            headers: {
                ...this.getHeader(),
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response.data;
  }

  static async getAllCategories() {
    const response = await axios.get(`${this.BASE_URL}/category/get-all`);
    return response.data;
  }

  static async getCategoryById(categoryId) {
    const response = await axios.get(
      `${this.BASE_URL}/category/get-category-by-id/${categoryId}`
    );
    return response.data;
  }
  
  static async deleteCategory(categoryId) {
    const response = await axios.delete(
      `${this.BASE_URL}/category/delete/${categoryId}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async getCategoryWithSubCategories(categoryId) {
    const response = await axios.get(
      `${this.BASE_URL}/category/get-with-subcategories/${categoryId}`
    );
    return response.data;
  }
  // ApiService.js
  static async searchCategories(query) {
    try {
      const response = await axios.get(`${this.BASE_URL}/category/search`, {
        params: { query },
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // SubCategory APIs


  static async createSubCategory(body, imageFile = null) {
    const formData = new FormData();
    
    // Append subcategory data as JSON string
    formData.append('subCategory', new Blob([JSON.stringify(body)], {
        type: 'application/json'
    }));
    
    // Append image file if provided
    if (imageFile) {
        formData.append('image', imageFile);
    }

    const response = await axios.post(
        `${this.BASE_URL}/sub-category/create`,
        formData,
        {
            headers: {
                ...this.getHeader(),
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response.data;
  }

  static async updateSubCategory(subCategoryId, body, imageFile = null) {
    const formData = new FormData();
    
    // Append subcategory data as JSON string
    formData.append('subCategory', new Blob([JSON.stringify(body)], {
        type: 'application/json'
    }));
    
    // Append image file if provided
    if (imageFile) {
        formData.append('image', imageFile);
    }

    const response = await axios.put(
        `${this.BASE_URL}/sub-category/update/${subCategoryId}`,
        formData,
        {
            headers: {
                ...this.getHeader(),
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response.data;
  }

  static async getAllSubCategories() {
    try {
        const response = await axios.get(
            `${this.BASE_URL}/sub-category/get-all-sub-categories`,
            {
                headers: this.getHeader(),
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching all subcategories:', error);
        throw error;
    }
  }

  static async getSubCategoriesByCategory(categoryId) {
    const response = await axios.get(
        `${this.BASE_URL}/sub-category/get-by-category/${categoryId}`
    );
    return response.data;
  }

  static async deleteSubCategory(subCategoryId) {
    const response = await axios.delete(
      `${this.BASE_URL}/sub-category/delete/${subCategoryId}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async getSubCategoryById(subCategoryId) {
    const response = await axios.get(
      `${this.BASE_URL}/sub-category/get/${subCategoryId}`
    );
    return response.data;
  }

  static async searchSubCategories(query) {
    try {
      const response = await axios.get(`${this.BASE_URL}/sub-category/search`, {
        params: { query },
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}