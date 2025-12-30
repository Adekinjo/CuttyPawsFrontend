import ApiService from "./ApiService";

export default class ReviewService extends ApiService {

      
  /** REVIEW ENDPOINT */

  static async getReviewsByProductId(productId) {
    const response = await axios.get(
      `${this.BASE_URL}/reviews/product/${productId}`
    );
    return response.data;
  }

  static async getAllReviews() {
    const response = await axios.get(`${this.BASE_URL}/reviews/getAll`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async deleteReview(reviewId) {
    const response = await axios.delete(
      `${this.BASE_URL}/reviews/delete/${reviewId}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async addReview(reviewData) {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/reviews`,
        reviewData,
        {
          headers: this.getHeader(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error;
    }
  }

}    