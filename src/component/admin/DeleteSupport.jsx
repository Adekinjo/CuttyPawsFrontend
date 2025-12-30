import ApiService from "../../service/ApiService";

const DeleteSupport = ({ inquiryId }) => {
  const handleDelete = async () => {
    const confirm = window.confirm("Are you sure you want to delete this inquiry?");
    if (confirm) {
      try {
        await ApiService.deleteInquiry(inquiryId);
        alert("Inquiry deleted successfully!");
      } catch (error) {
        console.error("Error deleting inquiry:", error);
      }
    }
  };

  return (
    <button onClick={handleDelete}>Delete Inquiry</button>
  );
};

export default DeleteSupport;