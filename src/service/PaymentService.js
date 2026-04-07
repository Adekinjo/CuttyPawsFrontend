import axios from "axios";
import ApiService from "./ApiService";

class PaymentService extends ApiService {
  static async initializeOrderPayment(amount, currency, email, userId) {
    try {
      const payload = {
        amount,
        currency,
        email,
        userId,
        paymentPurpose: "ORDER",
        platform: "WEB",
      };

      const response = await axios.post(
        `${this.BASE_URL}/payment/payment-sheet/initialize`,
        payload,
        { headers: this.getHeader() }
      );

      if (response.data.status !== 200) {
        throw new Error(response.data.message || "Payment initialization failed");
      }

      if (!response.data.paymentIntentClientSecret) {
        throw new Error("No paymentIntentClientSecret returned from server");
      }

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Payment initialization failed"
        );
      }
      throw error;
    }
  }

  static async initializeBookingPayment(amount, currency, email, userId, serviceBookingId) {
    try {
      const payload = {
        amount,
        currency,
        email,
        userId,
        paymentPurpose: "SERVICE_BOOKING",
        serviceBookingId,
        platform: "WEB",
      };

      const response = await axios.post(
        `${this.BASE_URL}/payment/payment-sheet/initialize`,
        payload,
        { headers: this.getHeader() }
      );

      if (response.data.status !== 200) {
        throw new Error(response.data.message || "Booking payment initialization failed");
      }

      if (!response.data.paymentIntentClientSecret) {
        throw new Error("No paymentIntentClientSecret returned from server");
      }

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Booking payment initialization failed"
        );
      }
      throw error;
    }
  }

  static async initializeAdPayment(amount, currency, email, userId, serviceAdSubscriptionId) {
    const payload = {
      amount,
      currency,
      email,
      userId,
      paymentPurpose: "SERVICE_AD",
      serviceAdSubscriptionId,
      platform: "WEB",
    };

    const response = await axios.post(
      `${this.BASE_URL}/payment/payment-sheet/initialize`,
      payload,
      { headers: this.getHeader() }
    );

    return response.data;
  }


  static async getPaymentStatus(reference) {
    try {
      const response = await axios.get(`${this.BASE_URL}/payment/status`, {
        params: { reference },
        headers: this.getHeader(),
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to get payment status"
        );
      }
      throw error;
    }
  }
}

export default PaymentService;