import ApiService from "./ApiService";
import axios from "axios";
import { toast } from "react-toastify";
import ServiceProviderService from "./ServiceProviderService";

export default class AuthService extends ApiService {
  /** AUTH && USER API */

  static logAuthState(context, extra = {}) {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const storedUser = localStorage.getItem("user");

    console.log(`[AuthService] ${context}`, {
      hasToken: Boolean(token),
      tokenLength: token?.length || 0,
      token,
      hasRefreshToken: Boolean(refreshToken),
      refreshTokenLength: refreshToken?.length || 0,
      refreshToken,
      hasStoredUser: Boolean(storedUser),
      ...extra,
    });
  }

  static getRoleFromToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role || null;
    } catch (error) {
      console.error("[AuthService] getRoleFromToken:error", error);
      return null;
    }
  }

  static getEffectiveRole() {
    const storedUser = this.getStoredUser();
    return (
      this.getRoleFromToken() ||
      storedUser?.role ||
      storedUser?.userRole ||
      localStorage.getItem("role") ||
      null
    );
  }

  static hasRole(...roles) {
    const effectiveRole = this.getEffectiveRole();
    const matched = roles.includes(effectiveRole);
    console.log("[AuthService] hasRole", {
      effectiveRole,
      expectedRoles: roles,
      matched,
    });
    return matched;
  }

  static getStoredUser() {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error("Error parsing stored user:", error);
      return null;
    }
  }

  static setStoredUser(user) {
    if (!user) {
      localStorage.removeItem("user");
      return;
    }

    localStorage.setItem("user", JSON.stringify(user));
  }

  static async getAllUsers() {
    try {
      // Some backend versions expose this as /user/get-all-info.
      const response = await axios.get(`${this.BASE_URL}/user/get-all-info`, {
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
      // Backward compatibility for older backend route naming.
      if (error?.response?.status === 404) {
        try {
          const fallbackResponse = await axios.get(`${this.BASE_URL}/users/get-all`, {
            headers: this.getHeader(),
          });
          const fallbackData = fallbackResponse.data;

          if (fallbackData?.userList) return fallbackData.userList;
          if (fallbackData?.data) return fallbackData.data;
          if (Array.isArray(fallbackData)) return fallbackData;
          return [];
        } catch (fallbackError) {
          console.error("Error fetching users (fallback route):", fallbackError);
          throw fallbackError;
        }
      }

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
    this.logAuthState("loginUser:request", {
      email: loginDetails?.email,
      rememberMe: loginDetails?.rememberMe,
    });
    const response = await axios.post(
      `${this.BASE_URL}/auth/login`,
      loginDetails
    );
    console.log("[AuthService] loginUser:response", {
      status: response?.data?.status,
      hasToken: Boolean(response?.data?.token),
      token: response?.data?.token,
      hasRefreshToken: Boolean(response?.data?.refreshToken),
      refreshToken: response?.data?.refreshToken,
      requiresVerification: Boolean(response?.data?.requiresVerification),
      role: response?.data?.role,
    });
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
      this.logAuthState("refreshToken:request", {
        providedRefreshToken: Boolean(refreshToken),
      });
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
      
      console.log("[AuthService] refreshToken:response", {
        status: response?.data?.status,
        hasToken: Boolean(response?.data?.token),
        token: response?.data?.token,
        hasRefreshToken: Boolean(response?.data?.refreshToken),
        refreshToken: response?.data?.refreshToken,
      });
      return response.data;
    } catch (error) {
      console.error("[AuthService] refreshToken:error", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
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
      this.logAuthState("getLoggedInInfo:request");
      const response = await axios.get(
        `${this.BASE_URL}/user/my-info`,  // ✅ Correct endpoint
        {
          headers: this.getHeader(),
        }
      );
      console.log("[AuthService] getLoggedInInfo:response", {
        status: response?.data?.status,
        userId: response?.data?.user?.id,
        role:
          response?.data?.user?.role ||
          response?.data?.user?.userRole ||
          response?.data?.role,
      });
      return response.data;
    } catch (error) {
      console.error("[AuthService] getLoggedInInfo:error", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
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

  static isTokenExpired(bufferSeconds = 60) {
    const token = localStorage.getItem("token");
    if (!token) {
      this.logAuthState("isTokenExpired:no-token");
      return true;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiryMs = payload.exp * 1000;
      const expired = Date.now() >= (expiryMs - bufferSeconds * 1000);
      console.log("[AuthService] isTokenExpired:result", {
        expired,
        exp: payload.exp,
        now: Date.now(),
        bufferSeconds,
      });
      return expired;
    } catch (e) {
      console.error("[AuthService] isTokenExpired:error", e);
      return true;
    }
  }

  // ✅ Preemptive token refresh
  static async refreshTokenIfNeeded() {
    const token = localStorage.getItem("token");
    if (!token) {
      this.logAuthState("refreshTokenIfNeeded:no-token");
      return false;
    }

    if (!this.isTokenExpired()) {
      this.logAuthState("refreshTokenIfNeeded:token-still-valid");
      return true;
    }

    this.logAuthState("refreshTokenIfNeeded:refreshing");
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const response = await this.refreshToken(refreshToken);
        localStorage.setItem('token', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        this.logAuthState("refreshTokenIfNeeded:refresh-success");
        return true;
      } catch (error) {
        console.error("[AuthService] refreshTokenIfNeeded:refresh-failed", error);
        return false;
      }
    }

    this.logAuthState("refreshTokenIfNeeded:no-refresh-token");
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
        console.log("[AuthService] axios:request", {
          url: config?.url,
          method: config?.method,
          hasAuthorizationHeader: Boolean(config?.headers?.Authorization),
        });
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
          console.warn("[AuthService] axios:401-detected", {
            url: originalRequest?.url,
            method: originalRequest?.method,
          });
          
          if (isRefreshing) {
            console.log("[AuthService] axios:queue-request-during-refresh", {
              url: originalRequest?.url,
            });
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
            this.logAuthState("axios:no-refresh-token-logout", {
              url: originalRequest?.url,
            });
            this.logout();
            window.location.href = '/login';
            return Promise.reject(error);
          }

          try {
            this.logAuthState("axios:attempt-refresh", {
              url: originalRequest?.url,
            });
            // Try to refresh the token
            const refreshResponse = await this.refreshToken(refreshToken);
            const newToken = refreshResponse.token;
            const newRefreshToken = refreshResponse.refreshToken;

            // Update tokens in localStorage
            localStorage.setItem('token', newToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }

            this.logAuthState("axios:refresh-success", {
              url: originalRequest?.url,
            });
            
            // Update the failed requests
            processQueue(null, newToken);
            isRefreshing = false;

            // Retry the original request
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
            
          } catch (refreshError) {
            console.error("[AuthService] axios:refresh-failed", {
              url: originalRequest?.url,
              message: refreshError.message,
              response: refreshError.response?.data,
            });
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
    this.logAuthState("logout:before-clear");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    ServiceProviderService.clearStoredDashboard();
    this.logAuthState("logout:after-clear");
  }

  static isAuthenticated() {
    const refreshToken = localStorage.getItem("refreshToken");
    const authenticated = !!refreshToken;
    console.log("[AuthService] isAuthenticated", {
      authenticated,
      hasRefreshToken: Boolean(refreshToken),
    });
    return authenticated;
  }

  static isAdmin() {
    return this.hasRole("ROLE_ADMIN");
  }

  static isSupport() {
    return this.hasRole("ROLE_CUSTOMER_SUPPORT", "ROLE_CUSTOMER_SERVICE");
  }

  static isSeller() {
    return this.hasRole("ROLE_SELLER", "ROLE_COMPANY");
  }

  static isServiceProvider() {
    const storedUser = this.getStoredUser();
    const matchedRole = this.hasRole("ROLE_SERVICE", "ROLE_SERVICE_PROVIDER");
    const matchedFlag = Boolean(storedUser?.isServiceProvider);
    console.log("[AuthService] isServiceProvider", {
      matchedRole,
      matchedFlag,
      effectiveRole: this.getEffectiveRole(),
    });
    return matchedRole || matchedFlag;
  }

  static async initializeApp() {
    this.setupAxiosInterceptors();
    this.setupInactivityLogout();

    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    if (token && refreshToken) {
      this.logAuthState("initializeApp:check-token-status");
      await this.refreshTokenIfNeeded();
    }

    const storedUser = this.getStoredUser();
    if (storedUser?.isServiceProvider && this.isAuthenticated()) {
      try {
        await ServiceProviderService.refreshDashboard();
      } catch (error) {
        console.error("Failed to refresh service dashboard on startup:", error);
      }
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
