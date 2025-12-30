import { useState, useEffect } from "react";

const RecentlyViews = () => {
  const [recentProducts, setRecentProducts] = useState([]);

  // Load recently viewed products on component mount
  useEffect(() => {
    const storedProducts = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    setRecentProducts(storedProducts);
  }, []);

  // Function to add a product to recently viewed
  const addToRecentlyViewed = (product) => {
    const storedProducts = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    const isProductAlreadyViewed = storedProducts.some((p) => p.id === product.id);

    if (!isProductAlreadyViewed) {
      const updatedProducts = [product, ...storedProducts].slice(0, 5); // Limit to 5 products
      localStorage.setItem("recentlyViewed", JSON.stringify(updatedProducts));
      setRecentProducts(updatedProducts);
    }
  };

  // Function to clear all recently viewed products
  const clearRecentlyViewed = () => {
    localStorage.removeItem("recentlyViewed"); // Remove the data from localStorage
    setRecentProducts([]); // Update state to an empty array
  };

  // Function to simulate viewing a product
  const viewProduct = (product) => {
    console.log(`Viewing product: ${product.name}`);
    addToRecentlyViewed(product);
  };

  return (
    <div>
      <h2>Recently Viewed Products</h2>
      {recentProducts.length > 0 ? (
        <div>
          <ul>
            {recentProducts.map((product) => (
              <li key={product.id}>
                <img src={product.image} alt={product.name} width="50" />
                <span>{product.name}</span>
              </li>
            ))}
          </ul>
          <button onClick={clearRecentlyViewed}>Clear All</button>
        </div>
      ) : (
        <p>No recently viewed products.</p>
      )}

      <h3>Products</h3>
      <button onClick={() => viewProduct({ id: 1, name: "Product A", image: "image-url-a.jpg" })}>
        View Product A
      </button>
      <button onClick={() => viewProduct({ id: 2, name: "Product B", image: "image-url-b.jpg" })}>
        View Product B
      </button>
      <button onClick={() => viewProduct({ id: 3, name: "Product C", image: "image-url-c.jpg" })}>
        View Product C
      </button>
    </div>
  );
};

export default RecentlyViews;