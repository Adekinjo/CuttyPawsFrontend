import axios from "axios";
import ApiService from "./ApiService";

class AiService extends ApiService {
  static async sendSupportMessage(prompt, city = null, state = null, radiusMiles = null) {
    try {
      const payload = {
        prompt,
        feature: "AI_SUPPORT",
        city,
        state,
        radiusMiles,
      };

      const response = await axios.post(
        `${this.BASE_URL}/ai/support`,
        payload,
        {
          headers: this.getHeader(),
        }
      );

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to get AI support response"
        );
      }
      throw error;
    }
  }

  static async sendSupportMessageWithImage({
    prompt,
    image,
    city = null,
    state = null,
  }) {
    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("image", image);

      if (city) {
        formData.append("city", city);
      }

      if (state) {
        formData.append("state", state);
      }

      const response = await axios.post(
        `${this.BASE_URL}/ai/support/image`,
        formData,
        {
          headers: {
            ...this.getHeader(),
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to get AI image support response"
        );
      }
      throw error;
    }
  }
}

export default AiService;