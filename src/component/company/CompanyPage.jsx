import { useNavigate } from "react-router-dom";
import '../../style/Admin.css'


const AdminPage = () => {
    const navigate = useNavigate();

    return(
        <div className="admin-page">
            <h1>Welcome Seller</h1>
            <button onClick={()=> navigate("/company/products")}>Manage Products</button>
            <button onClick={()=> navigate("/company/orders")}>Manage Orders</button>
        </div>
    );
};
export default AdminPage;