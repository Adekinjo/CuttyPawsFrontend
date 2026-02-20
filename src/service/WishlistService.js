import axios from 'axios';
import ApiService from './ApiService';
export default class WishlistService extends ApiService {
      static async addToWishlist(productId) {
    const userId = this.getUserId(); 
    const response = await axios.post(
      `${this.BASE_URL}/wishlist/add`,
      { userId, productId },
      { headers: this.getHeader() }
    );
    return response.data;
  }

  static async getWishlist() {
    if (!ApiService.isAuthenticated()) {
      return [];
    }
    const userId = this.getUserId();
    try {
      const response = await axios.get(
        `${this.BASE_URL}/wishlist/user/${userId}`,
        {
          headers: this.getHeader(),
        }
      );
      return response.data;
    } catch (error) {
      return [];
    }
  }

  // Remove a product from the wishlist
  static async removeFromWishlist(productId) {
    const userId = this.getUserId();
    const response = await axios.delete(
      `${this.BASE_URL}/wishlist/remove?userId=${userId}&productId=${productId}`,
      { headers: this.getHeader() }
    );
    return response.data;
  }
}