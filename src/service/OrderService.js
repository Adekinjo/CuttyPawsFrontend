import ApiService from "./ApiService"
import axios from "axios";

export default class OrderService extends ApiService {

  // Create order after successful payment
  static async createOrderAfterPayment(paymentId, cartItems, totalPrice) {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      throw new Error("Cart items are required to create an order.");
    }

    try {
      const orderPayload = {
        paymentId: paymentId,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          size: item.size || null,
          color: item.color || null,
        })),
        totalPrice: totalPrice,
      };

      //console.log("📍 PRODUCTION: Creating order after payment:", orderPayload);

      const response = await axios.post(
        `${this.BASE_URL}/payment/create-order`,
        orderPayload,
        { headers: this.getHeader() }
      );
      
      //console.log("📍 PRODUCTION: Order creation response:", response.data);
      return response.data;
    } catch (error) {
      //console.error("📍 PRODUCTION: Error creating order after payment:", error);
      if (error.response) {
        //console.error("Backend error response:", error.response.data);
        throw new Error(error.response.data.message || "Order creation failed");
      }
      throw error;
    }
  }

  static async getAllOrders() {
    const response = await axios.get(`${this.BASE_URL}/order/filter`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getAdminOrderItemById(itemId) {
    const response = await axios.get(`${this.BASE_URL}/order/admin-item/${itemId}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getOrderItemById(itemId) {
    const response = await axios.get(`${this.BASE_URL}/order/my-order-item/${itemId}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getAllOrderItemsByStatus(status) {
    const response = await axios.get(`${this.BASE_URL}/order/filter`, {
      headers: this.getHeader(),
      params: { status },
    });
    return response.data;
  }

  static async getMyOrderHistory(page = 0, size = 6) {
    const response = await axios.get(`${this.BASE_URL}/order/my-orders`, {
      headers: this.getHeader(),
      params: { page, size },
    });
    return response.data;
  }

  static async updateOrderitemStatus(orderItemId, status) {
    const response = await axios.put(
      `${this.BASE_URL}/order/update-item-status/${orderItemId}`,
      {},
      {
        headers: this.getHeader(),
        params: { status },
      }
    );
    return response.data;
  }

  /** ADDRESS ENDPOINT */

  static async saveAddress(body) {
    const response = await axios.post(`${this.BASE_URL}/address/save`, body, {
      headers: this.getHeader(),
    });
    return response.data;
  }

 
}