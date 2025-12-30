import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ApiService from "../../service/ApiService";
import ProductList from "../common/ProductList";
import Pagination from "../common/Pagination";
import RecentView from "../pages/RecentView";

const CategoryProduct = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchProducts();
  }, [categoryId, currentPage]);

  const fetchProducts = async () => {
    try {
      const response = await ApiService.getAllProductByCategoryId(categoryId);
      const allProducts = response.productList || [];

      setTotalPages(Math.ceil(allProducts.length / itemsPerPage));

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      setProducts(allProducts.slice(startIndex, endIndex));
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Unable to fetch products by category");
    }
  };

  return (
    <div className="homes">
      {error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div>
          <div style={{ marginTop: "20px" }}>
            <ProductList products={products} />
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
      <div><RecentView /></div>
    </div>
  );
};

export default CategoryProduct;