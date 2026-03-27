import { useNavigate } from "react-router-dom";
import '../../style/Admin.css'


const SellerPage = () => {
    const navigate = useNavigate();

    return(
        <div className="admin-page">
            <h1>Welcome Seller</h1>
            <button onClick={()=> navigate("/seller/seller-products")}>Manage Products</button>
            <button onClick={()=> navigate("/seller/seller-orders")}>Manage Orders</button>
        </div>
    );
};
export default SellerPage;
