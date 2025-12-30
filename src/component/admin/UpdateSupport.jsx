import React, { useState } from "react";
import ApiService from "../service/ApiService";

const UpdateSpport = ({ inquiryId }) => {
  const [formData, setFormData] = useState({
    resolved: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await ApiService.updateInquiry(inquiryId, formData);
      alert("Inquiry updated successfully!");
      console.log("Updated Inquiry:", response);
    } catch (error) {
      console.error("Error updating inquiry:", error);
    }
  };

  return (
    <div className="update-inquiry-page">
      <h1>Update Inquiry</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Resolved:
          <input
            type="checkbox"
            checked={formData.resolved}
            onChange={(e) => setFormData({ ...formData, resolved: e.target.checked })}
          />
        </label>
        <button type="submit">Update</button>
      </form>
    </div>
  );
};

export default UpdateSpport;