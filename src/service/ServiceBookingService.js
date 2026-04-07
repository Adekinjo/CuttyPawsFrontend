import axios from "axios";
import ApiService from "./ApiService";

class ServiceBookingService extends ApiService {
  static async createBooking(payload) {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/service-bookings/my-bookings`,
        payload,
        { headers: this.getHeader() }
      );

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || "Booking creation failed");
      }
      throw error;
    }
  }

  static async getMyBookingStatus(bookingId) {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/service-bookings/my-bookings/${bookingId}/status`,
        { headers: this.getHeader() }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to get booking status");
      }
      throw error;
    }
  }

  static async confirmBookingPayment(paymentReference) {
    try {
      if (!paymentReference) {
        throw new Error("Booking payment reference is missing.");
      }

      const response = await axios.post(
        `${this.BASE_URL}/service-bookings/my-bookings/confirm-payment`,
        {
          paymentReference,
        },
        { headers: this.getHeader() }
      );

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Booking payment confirmation failed"
        );
      }
      throw error;
    }
  }

  static async getMyBookings() {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/service-bookings/my-bookings`,
        { headers: this.getHeader() }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to get bookings");
      }
      throw error;
    }
  }

  static async getMyProviderBookings() {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/service-bookings/provider/bookings`,
        { headers: this.getHeader() }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to get provider bookings");
      }
      throw error;
    }
  }
}

export default ServiceBookingService;
