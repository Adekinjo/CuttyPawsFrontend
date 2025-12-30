import { useState, useEffect } from "react";
import ApiService from "../../service/ApiService";
import { useNavigate } from "react-router-dom";
import Pagination from "../common/Pagination";
import '../../style/AdminProduct.css'


const AdminProduct = () => {
	const navigate = useNavigate();
	const [products, setProducts] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [error, setError] = useState(null);
	const itemsPerPage = 10;


  const fetchProduct = async() =>{
		try {
			const response = await ApiService.getAllProduct();
			const productList = response.productList || [];
			setTotalPages(Math.ceil(productList.length /itemsPerPage));
			setProducts(productList.slice((currentPage -1) * itemsPerPage, currentPage * itemsPerPage));
		} catch (error) {
			setError(error.response?.data?.message || error.message || "unable to fetch products")
		}

  	}

	useEffect(()=> {
		fetchProduct();
	}, [currentPage]);

	const handleEdit = async(id) => {
			navigate(`/admin/edit-product/${id}`)
		}
	
	const handleDelete = async(id) => {
		const confirmed = window.confirm("Are you sure you want to delete this product")
		if(confirmed){
			try{
				await ApiService.deleteProduct(id);
				fetchProduct();
			}catch(error){
				setError(error.response?.data?.message || error.message || "unable to fetch products")
			}
		}
		
	}

	return(
		<div className="admin-product">
			{error ? (
				<p className="error-message">{error}</p>
			) : (
				<div>
					<h2>Product</h2>
					<button className="add-product" onClick={()=> navigate('/admin/add-product')}>Add Product</button>
					<ul>
						{products.map((product) => (
							<li key={product.id}>
								<span>{product.name}</span>
								<button className="edit" onClick={()=> handleEdit(product.id)}>Edit</button>
								<button className="delete" onClick={()=> handleDelete(product.id)}>Delete</button>
							</li>
						))}
					</ul>
					<Pagination currentPage={currentPage} 
					totalPages={totalPages} onPageChange={(page)=> setCurrentPage(page)} />
				</div>
			)}
		</div>
	);
}
export default AdminProduct;