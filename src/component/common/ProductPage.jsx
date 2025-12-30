import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ApiService from "../../service/ApiService";
import RecentlyViewed from "../pages/RecentView";
import CategoryCarousel from "../carousel/CategoryCarousel";
import Categories from "../common/Categories";
import Newsletter from "../pages/NewsLetter";
import Companies from "../company/Companies";
import LatestProducts from "../common/LatestProducts";
import SlideLinks from "../pages/SlideLinks";
import style from "../../style/ProductPage.module.css";

/**
 * CuttyPaws Home
 * Pet Social Media + Pet Accessories Marketplace
 */
const ProductPage = () => {
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);

  const itemsPerPage = 8;

 
  /**
   * Scroll to top on page change
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.search]);

  /**
   * Fetch products (search or all)
   */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const searchItem = queryParams.get("search");

        let allProducts = [];

        if (searchItem) {
          const response = await ApiService.searchProduct(searchItem);
          allProducts = response.productList || [];
        } else {
          const response = await ApiService.getAllProduct();
          allProducts = response.productList || [];
        }

        setTotalPages(Math.ceil(allProducts.length / itemsPerPage));
        setProducts(
          allProducts.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
          )
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load pet products"
        );
      }
    };

    fetchProducts();
  }, [location.search, currentPage]);

  return (
    <div className={style.home}>
      

      {/* Hero Slides / Promotions */}
      <SlideLinks />

      {/* Pet Categories Carousel */}
      <CategoryCarousel />

      {/* Latest & Trending Pet Products */}
      <LatestProducts />

      {/* Browse by Pet Type */}
      <Categories />

      {/* Featured Pet Brands / Sellers */}
      {products.length > 0 && (
        <Companies companyName="CuttyPaws Verified Sellers" />
      )}

      {/* Recently Viewed Pet Products */}
      <RecentlyViewed />

      {/* Newsletter & Community Updates */}
      <Newsletter />

    </div>
  );
};

export default ProductPage;
