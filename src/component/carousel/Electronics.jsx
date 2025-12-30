import { useEffect, useState } from 'react';
import ApiService from '../../service/ApiService';
import ProductList from '../common/ProductList';
import Pagination from '../common/Pagination';

const Electronics = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await ApiService.getProductsByNameAndCategory('', 2); // Assuming categoryId for Electronics is 2
        setProducts(response.productList || []);
        setTotalPages(Math.ceil(response.productList.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching electronics products:", error);
      }
    };

    fetchProducts();
  }, [currentPage]);

  return (
    <div>
      <h2>Electronics</h2>
      <ProductList products={products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
};

export default Electronics;