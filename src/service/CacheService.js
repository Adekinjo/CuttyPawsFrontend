import ApiService from "./ApiService";
import axios from "axios";

export default class CacheService extends ApiService {

  // ✅ DASHBOARD (you must create this endpoint in backend OR remove from UI)
  static async getCacheDashboard() {
    return axios.get(`${this.BASE_URL}/admin/cache/dashboard`, {
      headers: this.getHeader(),
    }).then(res => res.data);
  }

  // ✅ CLEAR ONE
  static async clearCache(cacheName) {
    return axios.post(`${this.BASE_URL}/admin/cache/clear/${cacheName}`, {}, {
      headers: this.getHeader(),
    }).then(res => res.data);
  }

  // ✅ CLEAR ALL
  static async clearAllCaches() {
    return axios.post(`${this.BASE_URL}/admin/cache/clear-all`, {}, {
      headers: this.getHeader(),
    }).then(res => res.data);
  }

  // ✅ RESET STATS (only if backend exists)
  static async resetCacheStats() {
    return axios.post(`${this.BASE_URL}/admin/cache/stats/reset`, {}, {
      headers: this.getHeader(),
    }).then(res => res.data);
  }

  // ✅ GENERATE ACTIVITY (only if backend exists)
  static async generateCacheActivity() {
    return axios.post(`${this.BASE_URL}/admin/cache/generate-activity`, {}, {
      headers: this.getHeader(),
    }).then(res => res.data);
  }

  // ✅ TOGGLE
  static async disableCaching() {
    return axios.post(`${this.BASE_URL}/admin/cache/toggle/disable`, {}, {
      headers: this.getHeader(),
    }).then(res => res.data);
  }

  static async enableCaching() {
    return axios.post(`${this.BASE_URL}/admin/cache/toggle/enable`, {}, {
      headers: this.getHeader(),
    }).then(res => res.data);
  }

  static async cacheToggleStatus() {
    return axios.get(`${this.BASE_URL}/admin/cache/toggle/status`, {
      headers: this.getHeader(),
    }).then(res => res.data);
  }
}

