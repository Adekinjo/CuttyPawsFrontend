// import axios from "axios";
// import { toast } from "react-toastify";
// import { Navigate } from "react-router-dom";

// export default class ApiService {
//    //static BASE_URL = "https://kinjomarket-backend.onrender.com";

//    static BASE_URL = "http://localhost:9393";


//   static getHeader() {
//     const token = localStorage.getItem("token");
//     return {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     };
//   }
//   // In ApiService.js - Add this method
// static getCurrentUser() {
//     try {
//         const token = localStorage.getItem("token");
//         if (!token) return null;
        
//         // Decode JWT token to get user info
//         const payload = JSON.parse(atob(token.split('.')[1]));
//         return {
//             id: payload.userId || payload.sub,
//             email: payload.email,
//             name: payload.name
//             // Add other user fields as needed
//         };
//     } catch (error) {
//         console.error("Error getting current user:", error);
//         return null;
//     }
// }

// static isAuthenticated() {
//     const token = localStorage.getItem("token");
//     if (!token) return false;
    
//     try {
//         const payload = JSON.parse(atob(token.split('.')[1]));
//         return payload.exp * 1000 > Date.now();
//     } catch {
//         return false;
//     }
//   }
// }





export default class ApiService {
  static BASE_URL = "http://localhost:9393";

  static getHeader() {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
    };
    
    // Only add Authorization header if token exists
    if (token && token.trim().length > 10) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ No valid token found, request will be unauthenticated");
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
}