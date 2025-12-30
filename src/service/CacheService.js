import ApiService from "./ApiService";
import axios from "axios";


export default class CacheService extends ApiService {

    
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

}    