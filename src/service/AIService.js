import axios from "axios";
import ApiService from "./ApiService";

export default class AIService extends ApiService{
  static search(query) {
    return axios.get(
      `${ApiService.BASE_URL}/search/query`,
      {
        params: { query },
        headers: ApiService.getHeader(), // ✅ reuse your existing logic
      }
    );
  }
}
