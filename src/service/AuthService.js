import ApiService from "./ApiService";
import axios from "axios";
import { toast } from "react-toastify";

export default class AuthService extends ApiService {
  /** AUTH && USER API */

  static async getAllUsers() {
    try {
      const response = await axios.get(`${this.BASE_URL}/users/get-all`, {
        headers: this.getHeader(),
      });
      
      const responseData = response.data;
      
      // Handle different possible response structures
      if (responseData.userList) {
        return responseData.userList;
      } else if (responseData.data) {
        return responseData.data;
      } else if (Array.isArray(responseData)) {
        return responseData;
      } else {
        console.warn("Unexpected response structure:", responseData);
        return [];
      }
    } catch (error) {
      console.error("Error fetching users:", error);
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
    try {
      console.log("🔄 Sending refresh token to backend...");
      const response = await axios.post(
        `${this.BASE_URL}/auth/refresh-token`, 
        null, 
        {
          params: { refreshToken },
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      
      console.log("✅ Refresh response received:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Refresh token error:", error.response?.data || error.message);
      throw error;
    }
  }

  static async resendVerificationCode(loginDetails) {
    const response = await axios.post(
      `${this.BASE_URL}/auth/resend-verification`,
      loginDetails
    );
    return response.data;
  }

  static async updateUserProfile(userDto) {
    const response = await axios.put(
      `${this.BASE_URL}/user/update`, 
      userDto, 
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  // ✅ FIXED: Changed from /users/my-info to /user/my-info
  static async getLoggedInInfo() {
    try {
      console.log("🔍 Fetching user info from /user/my-info...");
      const response = await axios.get(
        `${this.BASE_URL}/user/my-info`,  // ✅ Correct endpoint
        {
          headers: this.getHeader(),
        }
      );
      console.log("✅ User info response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error getting user info:", error);
      throw error;
    }
  }

  // ✅ Also fix the old method name if you have it
  static async getUserInfoAndOrderHistory() {
    return this.getLoggedInInfo(); // Alias for consistency
  }

  static async updateUserProfilePicture(formData) {
    const response = await axios.put(
      `${this.BASE_URL}/user/update-profile-image`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  }

  static async updateCoverPicture(formData) {
    const response = await axios.put(
      `${this.BASE_URL}/user/update-cover-image`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  }

  /** ADDRESS ENDPOINT */
  static async saveAddress(body) {
    const response = await axios.post(
      `${this.BASE_URL}/address/save`, 
      body, 
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  /** AUTHENTICATION & TOKEN MANAGEMENT */

  // ✅ Check if token is expired
  // static isTokenExpired() {
  //   const token = localStorage.getItem('token');
  //   if (!token) return true;
    
  //   try {
  //     // Decode JWT to check expiration
  //     const payload = JSON.parse(atob(token.split('.')[1]));
  //     const expiry = payload.exp * 1000; // Convert to milliseconds
  //     return Date.now() >= expiry;
  //   } catch (error) {
  //     console.error("Error checking token expiration:", error);
  //     return true;
  //   }
  // }

  static isTokenExpired(bufferSeconds = 60) {
    const token = localStorage.getItem("token");
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiryMs = payload.exp * 1000;
      return Date.now() >= (expiryMs - bufferSeconds * 1000);
    } catch (e) {
      return true;
    }
  }

  // ✅ Preemptive token refresh
  static async refreshTokenIfNeeded() {
    if (this.isTokenExpired()) {
      console.log("⚠️ Token expired or about to expire, refreshing...");
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await this.refreshToken(refreshToken);
          localStorage.setItem('token', response.token);
          if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }
          console.log("✅ Token refreshed preemptively");
          return true;
        } catch (error) {
          console.error("Failed to refresh token:", error);
          return false;
        }
      }
    }
    return false;
  }

  // ✅ Enhanced setupAxiosInterceptors with automatic refresh
  static interceptorsInitialized = false;
  static setupAxiosInterceptors() {

    if (this.interceptorsInitialized) return;
    this.interceptorsInitialized = true;

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
            console.log("❌ No refresh token available, logging out...");
            this.logout();
            window.location.href = '/login';
            return Promise.reject(error);
          }

          try {
            console.log("🔄 Token expired, attempting automatic refresh...");
            // Try to refresh the token
            const refreshResponse = await this.refreshToken(refreshToken);
            const newToken = refreshResponse.token;
            const newRefreshToken = refreshResponse.refreshToken;

            // Update tokens in localStorage
            localStorage.setItem('token', newToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }

            console.log("✅ Token refreshed successfully!");
            
            // Update the failed requests
            processQueue(null, newToken);
            isRefreshing = false;

            // Retry the original request
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
            
          } catch (refreshError) {
            console.error("❌ Token refresh failed:", refreshError);
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
      
      // Check rememberMe preference
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      
      // Set timeout based on remember me
      const TIMEOUT = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000; // 30 days or 1 hour
      
      // Only set inactivity logout if user didn't choose "remember me"
      if (!rememberMe) {
        inactivityTimer = setTimeout(() => {
          console.log('Inactivity logout triggered');
          this.logout();
          window.location.href = '/login?reason=inactivity';
        }, TIMEOUT);
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
    if (showSessionExpiredModal) {
      showSessionExpiredModal();
    }
  }
  
  static getUserId() {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    
    try {
      // Decode JWT to get user ID
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.sub;
    } catch (error) {
      console.error("Error getting user ID from token:", error);
      return null;
    }
  }

  static logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    console.log("👋 User logged out");
  }

  static isAuthenticated() {
    const refreshToken = localStorage.getItem("refreshToken");
    return !!refreshToken;
  }

  static isAdmin() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === "ROLE_ADMIN";
    } catch (error) {
      console.error("Error checking admin role:", error);
      return false;
    }
  }

  static isSupport() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === "ROLE_CUSTOMER_SUPPORT";
    } catch (error) {
      console.error("Error checking support role:", error);
      return false;
    }
  }

  static isCompany() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === "ROLE_COMPANY";
    } catch (error) {
      console.error("Error checking company role:", error);
      return false;
    }
  }

  // ✅ Initialize app - call this in your main App.jsx
  // static initializeApp() {
  //   // Setup axios interceptors for automatic token refresh
  //   this.setupAxiosInterceptors();
    
  //   // Setup inactivity logout
  //   this.setupInactivityLogout();
    
  //   // Check token on app startup
  //   const token = localStorage.getItem('token');
  //   const refreshToken = localStorage.getItem('refreshToken');
    
  //   if (token && refreshToken) {
  //     console.log("🔍 Checking token status on app startup...");
  //     this.refreshTokenIfNeeded().catch(error => {
  //       console.log("Token refresh failed on startup:", error);
  //     });
  //   }
  // }

  static async initializeApp() {
    this.setupAxiosInterceptors();
    this.setupInactivityLogout();

    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    if (token && refreshToken) {
      console.log("🔍 Checking token status on app startup...");
      await this.refreshTokenIfNeeded();
    }
  }

  // ✅ User Profile Endpoints for public profiles
  static async getUserProfile(userId) {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/users/${userId}/profile`,
        { headers: this.getHeader() }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  }

  static async getUserPosts(userId) {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/users/${userId}/posts`,
        { headers: this.getHeader() }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user posts:", error);
      throw error;
    }
  }

  static async getUserStats(userId) {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/users/${userId}/stats`,
        { headers: this.getHeader() }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    }
  }
}
