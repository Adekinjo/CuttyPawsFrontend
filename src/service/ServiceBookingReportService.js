import axios from "axios";
import ApiService from "./ApiService";

class ServiceBookingReportService extends ApiService {
  static async createReport(payload) {
    const response = await axios.post(
      `${this.BASE_URL}/service-booking-reports`,
      payload,
      { headers: this.getHeader() }
    );
    return response.data;
  }

  static async getMyReports() {
    const response = await axios.get(
      `${this.BASE_URL}/service-booking-reports/my-reports`,
      { headers: this.getHeader() }
    );
    return response.data;
  }

  static async getAdminReports() {
    const response = await axios.get(
      `${this.BASE_URL}/service-booking-reports/admin`,
      { headers: this.getHeader() }
    );
    return response.data;
  }

  static async getAdminReportById(reportId) {
    const response = await axios.get(
      `${this.BASE_URL}/service-booking-reports/admin/${reportId}`,
      { headers: this.getHeader() }
    );
    return response.data;
  }

  static async updateAdminReport(reportId, payload) {
    const response = await axios.put(
      `${this.BASE_URL}/service-booking-reports/admin/${reportId}`,
      payload,
      { headers: this.getHeader() }
    );
    return response.data;
  }
}

export default ServiceBookingReportService;