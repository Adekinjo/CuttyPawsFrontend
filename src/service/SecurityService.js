import ApiService from "./ApiService";
import axios from "axios";

export default class SecurityService extends ApiService {
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

}