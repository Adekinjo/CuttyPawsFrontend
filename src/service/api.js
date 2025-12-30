import axios from "axios";
import { toast } from "react-toastify";
import { Navigate } from "react-router-dom";

export default class ApiService {
   static BASE_URL = "https://kinjomarket-backend.onrender.com";

  //static BASE_URL = "http://localhost:9393";


  static getHeader() {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

    // Security API methods
  static async getSecurityEvents() {
        const response = await axios.get(`${this.BASE_URL}/admin/security/events`, {
          headers: this.getHeader(),
      });
      return response.data;
  }

  static async resolveSecurityEvent(eventId) {
      await axios.post(`${this.BASE_URL}/admin/security/events/${eventId}/resolve`, {}, {
          headers: this.getHeader(),
      });
  }

  static async blockIp(ipAddress) {
      await axios.post(`${this.BASE_URL}/admin/security/block-ip/${ipAddress}`, {}, {
          headers: this.getHeader(),
      });
  }

  static async getMaliciousUsers() {
      try {
            const response = await axios.get(`${this.BASE_URL}/admin/security/malicious-users`, {
              headers: this.getHeader(),
          });
          return response.data;
      } catch (error) {
          console.error('Failed to get malicious users:', error);
          throw error;
      }
  }

  static async blockAllUserIps(email) {
      try {
            const response = await axios.post(
                  `${this.BASE_URL}/admin/security/block-user-ips/${email}`,
          {},
          { headers: this.getHeader() }
            );
          return response.data;
      } catch (error) {
          console.error('Failed to block user IPs:', error);
          throw error;
      }
  }
  static async getEventsByIp(ipAddress) {
        const response = await axios.get(`${this.BASE_URL}/admin/security/events/ip/${ipAddress}`, {
          headers: this.getHeader(),
      });
      return response.data;
  }

  /** AUTH && USER API */

  // Function to get all users
  static async getAllUsers() {
    try {
      const response = await axios.get(`${this.BASE_URL}/user/get-all-info`, {
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async registerUser(registration) {
    const response = await axios.post(
      `${this.BASE_URL}/auth/register`,
      registration
    );
    return response.data;
  }
  // Add to ApiService.js
  static async verifyCode(verifyData) {
      const response = await axios.post(
          `${this.BASE_URL}/auth/verify-code`,
          verifyData
      );
      return response.data;
  }

  static async loginUser(loginDetails) {
    const response = await axios.post(
      `${this.BASE_URL}/auth/login`,
      loginDetails
    );
    return response.data;
  }

  static async requestPasswordReset(email) {
    const response = await axios.post(
      `${this.BASE_URL}/auth/request-password-reset`,
      null,
      {
        params: { email },
      }
    );
    return response.data;
  }

  static async resetPassword(token, newPassword) {
    const response = await axios.post(
      `${this.BASE_URL}/auth/reset-password`,
      null,
      {
        params: { token, newPassword },
      }
    );
    return response.data;
  }

   // Enhanced refreshToken method
    static async refreshToken(refreshToken) {
        const response = await axios.post(`${this.BASE_URL}/auth/refresh-token`, null, {
            params: { refreshToken }
        });
        return response.data;
    }

  static async resendVerificationCode(loginDetails) {
    const response = await axios.post(
        `${this.BASE_URL}/auth/resend-verification`,
        loginDetails
    );
    return response.data;
  }

  static async updateUserProfile(userDto) {
    const response = await axios.put(`${this.BASE_URL}/user/update`, userDto, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getLoggedInInfo() {
    const response = await axios.get(`${this.BASE_URL}/user/my-info`, {
      headers: this.getHeader(),
    });
    return response.data;
  }


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

  /** CACHE ENDPOINT */
  static async getCacheDashboard() {
    return axios.get(`${this.BASE_URL}/api/v1/admin/cache/dashboard`, {
      headers: this.getHeader(),
    }).then(res => res.data);
  }

  static async clearCache(cacheName) {
    return axios.post(`${this.BASE_URL}/api/v1/admin/cache/clear/${cacheName}`, {}, {
      headers: this.getHeader(),
    }).then(res => res.data);
  }

  static async clearAllCaches() {
    return axios.post(`${this.BASE_URL}/api/v1/admin/cache/clear-all`, {}, {
      headers: this.getHeader(),
    }).then(res => res.data);
  }

  static async resetCacheStats() {
    return axios.post(`${this.BASE_URL}/api/v1/admin/cache/stats/reset`, {}, {
      headers: this.getHeader(),
    }).then(res => res.data);
  }

  static async getCacheHealth() {
    return axios.get(`${this.BASE_URL}/api/v1/admin/cache/health`, {
      headers: this.getHeader(),
    }).then(res => res.data);
  }

  // Generate test activity
  static async generateCacheActivity() {
    return axios.post(`${this.BASE_URL}/api/v1/admin/cache/generate-activity`, {}, {
      headers: this.getHeader(),
    }).then(res => res.data);
  } 
  
  
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

  /**    Order ENDPOINT */

  static async getAllOrders() {
    const response = await axios.get(`${this.BASE_URL}/order/filter`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getOrderItemById(itemId) {
    const response = await axios.get(`${this.BASE_URL}/order/filter`, {
      headers: this.getHeader(),
      params: { itemId },
    });
    return response.data;
  }

  static async getAllOrderItemsByStatus(status) {
    const response = await axios.get(`${this.BASE_URL}/order/filter`, {
      headers: this.getHeader(),
      params: { status },
    });
    return response.data;
  }

  static async updateOrderitemStatus(orderItemId, status) {
    const response = await axios.put(
      `${this.BASE_URL}/order/update-item-status/${orderItemId}`,
      {},
      {
        headers: this.getHeader(),
        params: { status },
      }
    );
    return response.data;
  }

  /** ADDRESS ENDPOINT */

  static async saveAddress(body) {
    const response = await axios.post(`${this.BASE_URL}/address/save`, body, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  /** CUSTOMER SUPPORT API */
  static async createInquiry(inquiryDto) {
    const response = await axios.post(
      `${this.BASE_URL}/support/create`,
      inquiryDto,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async getAllInquiries() {
    const response = await axios.get(`${this.BASE_URL}/support/get-all`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getInquiryById(id) {
    const response = await axios.get(
      `${this.BASE_URL}/support/get-support-by-id/${id}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async updateComplaintStatus(id, status) {
    const response = await axios.put(
      `${this.BASE_URL}/support/update-status/${id}`,
      null, // No request body
      {
        headers: this.getHeader(),
        params: { status },
      }
    );
    return response.data;
  }

  static async deleteInquiry(id) {
    const response = await axios.delete(
      `${this.BASE_URL}/support/delete/${id}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
   }
   
  // Initialize payment
  static async initializePayment(amount, currency, email, method, userId) {
    try {
      const payload = {
        amount: amount,
        currency: currency,
        email: email,
        method: method,
        userId: userId,
      };

      //console.log("📍 PRODUCTION: Initializing payment with payload:", payload);

      const response = await axios.post(
        `${this.BASE_URL}/payment/initialize`,
        payload,
        { headers: this.getHeader() }
      );

      //console.log("📍 PRODUCTION: Payment initialization response:", response.data);

      if (response.data.status !== 200) {
        throw new Error(response.data.message || "Payment initialization failed");
      }

      if (!response.data.authorizationUrl) {
        throw new Error("No authorization URL returned from server");
      }

      return response.data;
    } catch (error) {
      //console.error("📍 PRODUCTION: Error initializing payment:", error);
      if (error.response) {
        //console.error("Backend error response:", error.response.data);
        throw new Error(error.response.data.message || "Payment initialization failed");
      }
      throw error;
    }
  }

  // Verify payment
  static async verifyPayment(reference) {
    try {
      //console.log("📍 PRODUCTION: Verifying payment with reference:", reference);
      
      const response = await axios.get(`${this.BASE_URL}/payment/verify`, {
        params: { reference },
        headers: this.getHeader(),
      });
      
      //console.log("📍 PRODUCTION: Payment verification response:", response.data);
      return response.data;
    } catch (error) {
      //console.error("📍 PRODUCTION: Error verifying payment:", error);
      if (error.response) {
        //console.error("Backend error response:", error.response.data);
        throw new Error(error.response.data.message || "Payment verification failed");
      }
      throw error;
    }
  }

  // Create order after successful payment
  static async createOrderAfterPayment(paymentId, cartItems, totalPrice) {
    try {
      const orderPayload = {
        paymentId: paymentId,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          size: item.size || null,
          color: item.color || null,
        })),
        totalPrice: totalPrice,
      };

      //console.log("📍 PRODUCTION: Creating order after payment:", orderPayload);

      const response = await axios.post(
        `${this.BASE_URL}/payment/create-order`,
        orderPayload,
        { headers: this.getHeader() }
      );
      
      //console.log("📍 PRODUCTION: Order creation response:", response.data);
      return response.data;
    } catch (error) {
      //console.error("📍 PRODUCTION: Error creating order after payment:", error);
      if (error.response) {
        //console.error("Backend error response:", error.response.data);
        throw new Error(error.response.data.message || "Order creation failed");
      }
      throw error;
    }
  }

  // Get payment details by reference
  static async getPaymentByReference(reference) {
    try {
      const response = await axios.get(`${this.BASE_URL}/payment/${reference}`, {
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error) {
      //console.error("📍 PRODUCTION: Error getting payment by reference:", error);
      throw error;
    }
  }


  //       /** WISHLIST API */

  static async addToWishlist(productId) {
    const userId = this.getUserId(); 
    const response = await axios.post(
      `${this.BASE_URL}/wishlist/add`,
      { userId, productId },
      { headers: this.getHeader() }
    );
    return response.data;
  }

  static async getWishlist() {
    if (!this.isAuthenticated()) {
      return [];
    }
    const userId = this.getUserId();
    try {
      const response = await axios.get(
        `${this.BASE_URL}/wishlist/user/${userId}`,
        {
          headers: this.getHeader(),
        }
      );
      return response.data;
    } catch (error) {
      return [];
    }
  }

  // Remove a product from the wishlist
  static async removeFromWishlist(productId) {
    const userId = this.getUserId();
    const response = await axios.delete(
      `${this.BASE_URL}/wishlist/remove?userId=${userId}&productId=${productId}`,
      { headers: this.getHeader() }
    );
    return response.data;
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

  //        DEALS API

  // Create new deal
  static async createDeal(dealDto) {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/deals/create`,
        dealDto,
        { headers: this.getHeader() }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update existing deal
  static async updateDeal(dealId, dealDto) {
    try {
      const response = await axios.put(
        `${this.BASE_URL}/deals/update/${dealId}`,
        dealDto,
        { headers: this.getHeader() }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Delete deal
  static async deleteDeal(dealId) {
    try {
      const response = await axios.delete(
        `${this.BASE_URL}/deals/delete/${dealId}`,
        { headers: this.getHeader() }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // In your API service
  static async getActiveDeals() {
    try {
      const response = await axios.get(`${this.BASE_URL}/deals/all/active`);
      console.log("Full API response:", response);
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response);
      throw error;
    }
  }

  // Get deal by product ID
  static async getDealByProductId(productId) {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/deals/product/${productId}`,
        { headers: this.getHeader() }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Toggle deal status
  static async toggleDealStatus(dealId, active) {
    try {
      const response = await axios.patch(
        `${this.BASE_URL}/deals/${dealId}/status?active=${active}`,
        {},
        { headers: this.getHeader() }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /** NEWSLETTER API */

  static async subscribeToNewsletter(email) {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/newsletter/subscribe`,
        null,
        {
          params: { email },
        }
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "An unexpected error occurred." }
      );
    }
  }

  static async unsubscribeFromNewsletter(email) {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/newsletter/unsubscribe`,
        null,
        {
          params: { email },
        }
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "An unexpected error occurred." }
      );
    }
  }

  // Function to get trending products
  static async getTrendingProducts() {
    try {
      const response = await axios.get(`${this.BASE_URL}/product/trending`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Function to track product view
  static async trackProductView(productId) {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/product/${productId}/view`,
        {}
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /** COMPANY API */

  static async registerCompany(registrationData) {
    const response = await axios.post(
      `${this.BASE_URL}/auth/register-company`,
      registrationData
    );
    return response.data;
  }

  static async companyAddProduct(formData) {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/product/company/create`,
        formData,
        {
          headers: {
            ...this.getHeader(),
            "Content-Type": "multipart/form-data", // Required for file uploads
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding product:", error);
      if (error.response) {
        console.error("Server Response:", error.response.data);
      }
      throw error;
    }
  }
  // In ApiService.js
  static async companyUpdateProduct(productId, formData) {
    try {
      const response = await axios.put(
        `${this.BASE_URL}/product/company/update/${productId}`,
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
      // Handle error
    }
  }

  static async deleteProductForCompany(id) {
    const response = await axios.delete(
      `${this.BASE_URL}/product/company/delete/${id}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async getAllProductsByUser() {
    const response = await axios.get(
      `${this.BASE_URL}/product/get-all-by-user`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async getCompanyProductOrders(companyId, page = 0, size = 10) {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/order/company/${companyId}/orders`,
        {
          params: { page, size },
          headers: this.getHeader(),
        }
      );
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return [];
      }
      if (error.response) {
        throw new Error(
          error.response.data.message ||
            "An error occurred while fetching orders."
        );
      } else if (error.request) {
        throw new Error(
          "No response received from the server. Please check your connection."
        );
      } else {
        throw new Error("An unexpected error occurred.");
      }
    }
  }
  static async getProductsByCompany(companyName) {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/product/company/${companyName}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  //             /**AUTHENTICATION */

  static initInterceptor(showSessionExpiredModal) {
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          ApiService.handleSessionExpired(showSessionExpiredModal);
        }
        return Promise.reject(error);
      }
    );
  }


  // Enhanced setupAxiosInterceptors with automatic refresh
    static setupAxiosInterceptors() {
        let isRefreshing = false;
        let failedQueue = [];

        const processQueue = (error, token = null) => {
            failedQueue.forEach(prom => {
                if (error) {
                    prom.reject(error);
                } else {
                    prom.resolve(token);
                }
            });
            failedQueue = [];
        };

        // Request interceptor to add token
        axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor to handle token refresh
        axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                
                // If 401 and not already retrying
                if (error.response?.status === 401 && !originalRequest._retry) {
                    
                    if (isRefreshing) {
                        // If already refreshing, add to queue
                        return new Promise((resolve, reject) => {
                            failedQueue.push({ resolve, reject });
                        }).then(token => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return axios(originalRequest);
                        }).catch(err => Promise.reject(err));
                    }

                    originalRequest._retry = true;
                    isRefreshing = true;

                    const refreshToken = localStorage.getItem('refreshToken');
                    if (!refreshToken) {
                        // No refresh token, logout user
                        this.logout();
                        window.location.href = '/login';
                        return Promise.reject(error);
                    }

                    try {
                        // Try to refresh the token
                        const refreshResponse = await this.refreshToken(refreshToken);
                        const newToken = refreshResponse.token;
                        const newRefreshToken = refreshResponse.refreshToken;

                        // Update tokens in localStorage
                        localStorage.setItem('token', newToken);
                        if (newRefreshToken) {
                            localStorage.setItem('refreshToken', newRefreshToken);
                        }

                        // Update the failed requests
                        processQueue(null, newToken);
                        isRefreshing = false;

                        // Retry the original request
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return axios(originalRequest);
                        
                    } catch (refreshError) {
                        // Refresh failed, logout user
                        processQueue(refreshError, null);
                        isRefreshing = false;
                        this.logout();
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

  // ADD INACTIVITY LOGOUT FUNCTIONALITY
  static setupInactivityLogout() {
    let inactivityTimer;
    
    const resetTimer = () => {
        clearTimeout(inactivityTimer);
        
        // ✅ FIX: Check rememberMe preference EVERY TIME the timer resets
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        
        // Set timeout based on remember me
        const TIMEOUT = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000; // 30 days or 1 hour
        
        // ✅ FIX: Only set inactivity logout if user didn't choose "remember me"
        if (!rememberMe) {
            inactivityTimer = setTimeout(() => {
                //console.log('Inactivity logout triggered - rememberMe was:', rememberMe);
                this.logout();
                window.location.href = '/login?reason=inactivity';
            }, TIMEOUT);
        } else {
            //console.log('Remember me is enabled - no inactivity logout');
        }
    };

    // Events that reset the timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
        document.addEventListener(event, resetTimer, true);
    });

    resetTimer(); // Start the timer
  }

  static handleSessionExpired(showSessionExpiredModal) {
    this.logout(); 
    toast.error("Your session has expired. Please log in again.", {
      autoClose: 3000,
    });
    showSessionExpiredModal(); 
  }
  

  static getUserId() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
      throw new Error("User ID not found. Please log in.");
    }
    return user.id;
  }

  static logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
  }

  static isAuthenticated() {
    const token = localStorage.getItem("token");
    return !!token;
  }

  static isAdmin() {
    const role = localStorage.getItem("role");
    return role === "ROLE_ADMIN";
  }

  static isSupport() {
    const role = localStorage.getItem("role");
    return role === "ROLE_CUSTOMER_SUPPORT";
  }

  static isCompany() {
    const role = localStorage.getItem("role");
    return role === "ROLE_COMPANY";
  }
}
