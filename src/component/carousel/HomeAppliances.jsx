import { useEffect, useState } from 'react';
import ApiService from '../../service/ApiService';
import ProductList from '../common/ProductList';
import Pagination from '../common/Pagination';

const HomeAppliances = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await ApiService.getProductsByNameAndCategory('', 3); // Assuming categoryId for Home Appliances is 3
        setProducts(response.productList || []);
        setTotalPages(Math.ceil(response.productList.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching home appliances products:", error);
      }
    };

    fetchProducts();
  }, [currentPage]);

  return (
    <div>
      <h2>Home Appliances</h2>
      <ProductList products={products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
};

export default HomeAppliances;