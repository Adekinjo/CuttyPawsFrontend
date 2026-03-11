// import axios from "axios";
// import ApiService from "./ApiService";

// export default class PetService extends ApiService {

//     static async createPet(petData) {
//         try {
//             const formData = new FormData();

//             // Append all fields
//             Object.keys(petData).forEach((key) => {
//                 if (key === "images") {
//                     // Images (multiple)
//                     petData.images.forEach((img) => {
//                         formData.append("images", img);
//                     });
//                 } else {
//                     formData.append(key, petData[key]);
//                 }
//             });

//             const response = await axios.post(
//                 `${this.BASE_URL}/pet/create`,
//                 formData,
//                 {
//                     headers: {
//                         ...this.getHeader(),
//                         "Content-Type": "multipart/form-data",
//                     },
//                 }
//             );

//             return response.data;

//         } catch (error) {
//             console.log("Error creating pet:", error);
//             throw error;
//         }
//     }

//     static async updatePet(petId, petData) {
//         try {
//             const formData = new FormData();

//             Object.keys(petData).forEach((key) => {
//                 if (key === "images" && petData.images) {
//                     petData.images.forEach((img) => {
//                         formData.append("images", img);
//                     });
//                 } else {
//                     formData.append(key, petData[key]);
//                 }
//             });

//             const response = await axios.put(
//                 `${this.BASE_URL}/pet/${petId}`,
//                 formData,
//                 {
//                     headers: {
//                         ...this.getHeader(),
//                         "Content-Type": "multipart/form-data",
//                     },
//                 }
//             );

//             return response.data;

//         } catch (error) {
//             console.log("Error updating pet:", error);
//             throw error;
//         }
//     }

//     static async deletePet(petId) {
//         try {
//             const response = await axios.delete(
//                 `${this.BASE_URL}/pet/${petId}`,
//                 { headers: this.getHeader() }
//             );

//             return response.data;

//         } catch (error) {
//             console.log("Error deleting pet:", error);
//             throw error;
//         }
//     }

//     static async getPet(petId) {
//         try {
//             const response = await axios.get(
//                 `${this.BASE_URL}/pet/${petId}`,
//                 { headers: this.getHeader() }
//             );

//             return response.data;

//         } catch (error) {
//             console.log("Error fetching pet:", error);
//             throw error;
//         }
//     }

//     static async getMyPets() {
//         try {
//             const response = await axios.get(
//                 `${this.BASE_URL}/pet/my-pets`,
//                 { headers: this.getHeader() }
//             );

//             return response.data;

//         } catch (error) {
//             console.log("Error fetching user's pets:", error);
//             throw error;
//         }
//     }

//     static async getAllPets() {
//         try {
//             const response = await axios.get(
//                 `${this.BASE_URL}/pet/all`,
//                 { headers: this.getHeader() }
//             );

//             return response.data;

//         } catch (error) {
//             console.log("Error fetching all pets:", error);
//             throw error;
//         }
//     }
// }







import axios from "axios";
import ApiService from "./ApiService";

export default class PetService extends ApiService {
  static unwrapResponse(response, fallbackMessage) {
    const data = response?.data;
    if (!data) {
      throw new Error(fallbackMessage || "Empty response from server");
    }
    if (typeof data.status === "number" && data.status !== 200) {
      throw new Error(data.message || fallbackMessage || "Request failed");
    }
    return data;
  }

  static buildFormData(petData) {
    const formData = new FormData();

    Object.keys(petData).forEach((key) => {
      const value = petData[key];

      if (value === null || value === undefined) return;

      if (key === "images" && Array.isArray(value)) {
        value.forEach((img) => {
          formData.append("images", img);
        });
      } else if (key === "tags" && Array.isArray(value)) {
        value.forEach((tag) => formData.append("tags", tag));
      } else {
        formData.append(key, value);
      }
    });

    return formData;
  }

  static async createPet(petData) {
    const response = await axios.post(
      `${this.BASE_URL}/pet/create`,
      this.buildFormData(petData),
      {
        headers: {
          ...this.getHeader(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return this.unwrapResponse(response, "Failed to create pet");
  }

  static async updatePet(petId, petData) {
    const response = await axios.put(
      `${this.BASE_URL}/pet/${petId}`,
      this.buildFormData(petData),
      {
        headers: {
          ...this.getHeader(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return this.unwrapResponse(response, "Failed to update pet");
  }

  static async deletePet(petId) {
    const response = await axios.delete(`${this.BASE_URL}/pet/${petId}`, {
      headers: this.getHeader(),
    });
    return this.unwrapResponse(response, "Failed to delete pet");
  }

  static async getPet(petId) {
    const response = await axios.get(`${this.BASE_URL}/pet/${petId}`, {
      headers: this.getHeader(),
    });
    return this.unwrapResponse(response, "Failed to fetch pet");
  }

  static async getMyPets() {
    const response = await axios.get(`${this.BASE_URL}/pet/my-pets`, {
      headers: this.getHeader(),
    });
    return this.unwrapResponse(response, "Failed to fetch your pets");
  }

  static async getAllPets() {
    const response = await axios.get(`${this.BASE_URL}/pet/all`, {
      headers: this.getHeader(),
    });
    return this.unwrapResponse(response, "Failed to fetch pets");
  }
}
