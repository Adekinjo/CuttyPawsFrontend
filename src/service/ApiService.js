
export default class ApiService {
  //static BASE_URL = "http://localhost:9393";
  static BASE_URL = "https://cuttypawsbackend.onrender.com";


  static getHeader() {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
    };
    
    // Only add Authorization header if token exists
    if (token && token.trim().length > 10) {
      headers.Authorization = `Bearer ${token}`;
      console.log("Auth header set:", { tokenLength: token.length });
    } else {
      console.warn("No valid token found for auth header:", {
        tokenPresent: Boolean(token),
        tokenLength: token ? token.length : 0
      });
    }
    
    return headers;
  }

  // Add this method to validate token in frontend
  static validateToken() {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("❌ No token found in localStorage");
      return false;
    }
    
    // Basic JWT validation - check for structure
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log("❌ Invalid token structure - expected 3 parts, got", parts.length);
      localStorage.removeItem("token"); // Remove invalid token
      localStorage.removeItem("user");
      return false;
    }
    
    console.log("✅ Token structure is valid");
    return true;
  }

  // Get current user from token
  static getCurrentUser() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.userId || payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role
      };
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  static getUserId() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId || payload.sub || null;
    } catch (error) {
      console.error("Error getting user ID from token:", error);
      return null;
    }
  }

  static isAuthenticated() {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (!payload.exp) {
        return true;
      }
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  }

}
