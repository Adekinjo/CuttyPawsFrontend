export default class DealService extends ApiService {
    
      // Create new deal
      static async createDeal(dealDto) {
        try {
          const response = await axios.post(
            `${this.BASE_URL}/deals/create`,
            dealDto,
            { headers: this.getHeader() }
          );
          return response.data;
        } catch (error) {
          throw error;
        }
      }
    
      // Update existing deal
      static async updateDeal(dealId, dealDto) {
        try {
          const response = await axios.put(
            `${this.BASE_URL}/deals/update/${dealId}`,
            dealDto,
            { headers: this.getHeader() }
          );
          return response.data;
        } catch (error) {
          throw error;
        }
      }
    
      // Delete deal
      static async deleteDeal(dealId) {
        try {
          const response = await axios.delete(
            `${this.BASE_URL}/deals/delete/${dealId}`,
            { headers: this.getHeader() }
          );
          return response.data;
        } catch (error) {
          throw error;
        }
      }
    
      // In your API service
      static async getActiveDeals() {
        try {
          const response = await axios.get(`${this.BASE_URL}/deals/all/active`);
          console.log("Full API response:", response);
          return response.data;
        } catch (error) {
          console.error("API Error:", error.response);
          throw error;
        }
      }
    
      // Get deal by product ID
      static async getDealByProductId(productId) {
        try {
          const response = await axios.get(
            `${this.BASE_URL}/deals/product/${productId}`,
            { headers: this.getHeader() }
          );
          return response.data;
        } catch (error) {
          throw error;
        }
      }
    
      // Toggle deal status
      static async toggleDealStatus(dealId, active) {
        try {
          const response = await axios.patch(
            `${this.BASE_URL}/deals/${dealId}/status?active=${active}`,
            {},
            { headers: this.getHeader() }
          );
          return response.data;
        } catch (error) {
          throw error;
        }
      }
    
    
}