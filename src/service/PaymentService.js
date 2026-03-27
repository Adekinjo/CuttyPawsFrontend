import axios from "axios";
import ApiService from "./ApiService";

class PaymentService extends ApiService {
  // Initialize payment
  static async initializePayment(amount, currency, email, userId) {
    try {
      const payload = {
        amount,
        currency,
        email,
        userId,
      };

      const response = await axios.post(
        `${this.BASE_URL}/payment/initialize`,
        payload,
        { headers: this.getHeader() }
      );

      if (response.data.status !== 200) {
        throw new Error(response.data.message || "Payment initialization failed");
      }

      if (!response.data.authorizationUrl) {
        throw new Error("No authorization URL returned from server");
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

  // Verify payment
  static async verifyPayment(reference) {
    try {
      const response = await axios.get(`${this.BASE_URL}/payment/verify`, {
        params: { reference },
        headers: this.getHeader(),
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Payment verification failed"
        );
      }
      throw error;
    }
  }

  // Create order after successful payment
  static async createOrderAfterPayment(paymentId, cartItems, totalPrice) {
    try {
      const orderPayload = {
        paymentId,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          size: item.size || null,
          color: item.color || null,
        })),
        totalPrice,
      };

      const response = await axios.post(
        `${this.BASE_URL}/payment/create-order`,
        orderPayload,
        { headers: this.getHeader() }
      );

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || "Order creation failed");
      }
      throw error;
    }
  }

  // Get payment details by reference
  static async getPaymentByReference(reference) {
    try {
      const response = await axios.get(`${this.BASE_URL}/payment/${reference}`, {
        headers: this.getHeader(),
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to get payment details"
        );
      }
      throw error;
    }
  }
}

export default PaymentService;