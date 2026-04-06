import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/Categories.css";
import "../../style/ProductList.css";

import CategoryService from "../../service/CategoryService";
import ProductService from "../../service/ProductService";
import WishlistService from "../../service/WishlistService";

import { useCart } from "../context/CartContext";

import { FaBookmark, FaHeart } from "react-icons/fa";
import Button from "react-bootstrap/Button";

const Categories = () => {

  const navigate = useNavigate();
  const { cart, dispatch } = useCart();

  const [categories, setCategories] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);

  const [wishlist, setWishlist] = useState([]);
  const [likes, setLikes] = useState({});

  const [openCategoryId, setOpenCategoryId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(true);

  const [error, setError] = useState("");
  const [productError, setProductError] = useState("");



  /* =============================
      Load page data
  ==============================*/

  const loadPageData = async () => {

    try {

      setLoading(true);
      setProductLoading(true);

      const [
        categoryResponse,
        productResponse,
        wishlistResponse,
        likesResponse
      ] = await Promise.all([
        CategoryService.getAllCategories(),
        ProductService.getAllProduct(0,12),
        WishlistService.getWishlist().catch(()=>[]),
        ProductService.getAllLikes().catch(()=>({productList:[]}))
      ]);

      setCategories(
        Array.isArray(categoryResponse?.categoryList)
          ? categoryResponse.categoryList
          : []
      );

      setLatestProducts(
        Array.isArray(productResponse?.productList)
          ? productResponse.productList
          : []
      );

      setWishlist(Array.isArray(wishlistResponse) ? wishlistResponse : []);

      const likesMap =
        likesResponse?.productList?.reduce((acc,product)=>({
          ...acc,
          [product.id]:product.likes || 0
        }),{}) || {};

      setLikes(likesMap);

    }
    catch(err){

      console.error("Failed to load categories page:",err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load data";

      setError(message);
      setProductError(message);

    }
    finally{

      setLoading(false);
      setProductLoading(false);

    }

  };

  useEffect(()=>{
    loadPageData();
  },[]);



  /* =============================
        Helpers
  ==============================*/

  const visibleCategories = useMemo(()=>categories,[categories]);



  const generateCleanURL = (str)=>
    String(str || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g,"-")
      .replace(/^-+|-+$/g,"");



  const resolveCategoryImage = (category)=>{

    return(
      category?.imageUrl ||
      category?.image ||
      category?.categoryImageUrl ||
      category?.thumbnailImageUrl ||
      ""
    );

  };



  const calculateDiscount = (oldPrice,newPrice)=>

    oldPrice > newPrice
      ? Math.round(((oldPrice-newPrice)/oldPrice)*100)
      : 0;



  /* =============================
        Navigation
  ==============================*/

  const handleCategoryClick = (category)=>{
    navigate(`/category/${category.id}`);
  };


  const handleSubCategoryClick = (subCategory)=>{

    const id =
      subCategory?.id ||
      subCategory?.subCategoryId ||
      subCategory?.sub_category_id;

    if(!id) return;

    navigate(`/products-sub-category/${id}`);

  };



  const handleProductClick = (product)=>{

    const categorySlug = generateCleanURL(product.category);
    const subCategorySlug = generateCleanURL(product.subCategory);
    const productSlug = generateCleanURL(product.name);

    navigate(
      `/product/${categorySlug}/${subCategorySlug}/${productSlug}/dp/${product.id}`
    );

  };



  /* =============================
        Wishlist
  ==============================*/

  const toggleWishlist = async(productId)=>{

    if(!CategoryService.isAuthenticated()) return;

    try{

      const exists = wishlist.some(w=>w.productId===productId);

      if(exists){

        await WishlistService.removeFromWishlist(productId);

        setWishlist(prev =>
          prev.filter(w=>w.productId!==productId)
        );

      }
      else{

        await WishlistService.addToWishlist(productId);

        const updated = await WishlistService.getWishlist();
        setWishlist(updated);

      }

    }
    catch(err){
      console.error("Wishlist error",err);
    }

  };



  /* =============================
        Likes
  ==============================*/

  const handleLike = async(productId)=>{

    try{

      await ProductService.likeProduct(productId);

      setLikes(prev=>({
        ...prev,
        [productId]:(prev[productId] || 0)+1
      }));

    }
    catch(err){
      console.error("Like failed",err);
    }

  };



  /* =============================
        Cart
  ==============================*/

  const cartActions = {

    addToCart:(product)=>
      dispatch({type:"ADD_ITEM",payload:product}),

    incrementItem:(product)=>
      dispatch({type:"INCREMENT_ITEM",payload:product}),

    decrementItem:(product)=>{

      const item = cart.find(i=>i.id===product.id);

      dispatch({
        type:item?.quantity>1 ? "DECREMENT_ITEM":"REMOVE_ITEM",
        payload:product
      });

    }

  };



  /* =============================
        Loading UI
  ==============================*/

  if(loading){

    return(
      <section className="categories-page">

        <section className="categories-section">

          <div className="categories-header">

            <div>
              <h3 className="categories-title">Available Categories</h3>
              <p className="categories-subtitle">
                Explore our product groups organized for faster discovery.
              </p>
            </div>

          </div>

          <div className="categories-center-card">
            Loading categories...
          </div>

        </section>

      </section>
    );

  }



  /* =============================
        Render
  ==============================*/

  return(

    <section className="categories-page">

      {/* =========================
            Categories
      ==========================*/}

      <section className="categories-section">

        <div className="categories-header">

          <div>
            <h3 className="categories-title">Available Categories</h3>
            <p className="categories-subtitle">
              Explore our product groups organized for faster discovery.
            </p>
          </div>

        </div>


        <div className="categories-row">

          {visibleCategories.map(category=>{

            const isOpen = openCategoryId===category.id;

            const imageUrl = resolveCategoryImage(category);

            const subCategories =
              Array.isArray(category?.subCategories)
                ? category.subCategories
                : [];

            return(

              <div key={category.id} className="category-column">

                <button
                  className={`category-card ${isOpen?"active":""}`}
                  onClick={()=>handleCategoryClick(category)}
                >

                  <div className="category-image-wrap">

                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={category.name}
                        className="category-image"
                      />
                    ):(
                      <div className="category-image-fallback">
                        No Image
                      </div>
                    )}

                  </div>

                </button>

                <p className="category-title">{category.name}</p>

                <button
                  className="category-filter-btn"
                  onClick={()=>setOpenCategoryId(
                    prev => prev===category.id ? null : category.id
                  )}
                >
                  {isOpen?"Hide":"Filter"}
                </button>


                {isOpen && (

                  <div className="category-dropdown">

                    {subCategories.map((sub,index)=>(
                      <button
                        key={sub.id || index}
                        className="category-dropdown-item"
                        onClick={()=>handleSubCategoryClick(sub)}
                      >
                        {sub.name}
                      </button>
                    ))}

                  </div>

                )}

              </div>

            );

          })}

        </div>

      </section>



      {/* =========================
            Latest Products
      ==========================*/}

      <section className="latest-products-section">

        <div className="latest-products-header">

          <h3 className="latest-products-title">
            Latest Products
          </h3>

        </div>


        {productLoading ? (

          <div className="categories-center-card">
            Loading latest products...
          </div>

        ) : (

          <div className="row g-3">

            {latestProducts.map(product=>{

              const cartItem =
                cart.find(item=>item.id===product.id);

              const isInWishlist =
                wishlist.some(w=>w.productId===product.id);

              const discount =
                calculateDiscount(product.oldPrice,product.newPrice);

              const imageUrl =
                product.thumbnailImageUrl ||
                product.imageUrls?.[0] ||
                "https://via.placeholder.com/300";

              return(

                <div key={product.id} className="col-6 col-md-3">

                  <div className="card h-100 shadow-sm position-relative product-card">

                    {discount>0 && (
                      <span className="position-absolute top-0 start-0 m-2 text-danger fw-bold">
                        -{discount}%
                      </span>
                    )}

                    <FaBookmark
                      onClick={()=>toggleWishlist(product.id)}
                      className="position-absolute top-0 end-0 m-2 fs-5 wishlist-icon"
                      style={{
                        color:isInWishlist?"orange":"#ddd",
                        cursor:"pointer"
                      }}
                    />

                    <div
                      onClick={()=>handleProductClick(product)}
                      style={{cursor:"pointer"}}
                    >

                      <div className="ratio ratio-1x1">

                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="card-img-top p-2 object-fit-contain"
                        />

                      </div>

                    </div>


                    <div className="card-body d-flex flex-column p-2">

                      <p className="card-title mb-1 text-truncate fs-6">
                        {product.name}
                      </p>

                      {product.oldPrice>0 && (
                        <p className="text-danger text-decoration-line-through mb-1 small">
                          ${product.oldPrice.toFixed(2)}
                        </p>
                      )}

                      <p className="h6 mb-1 text-primary">
                        ${product.newPrice.toFixed(2)}
                      </p>


                      {cartItem ? (

                        <div className="d-flex align-items-center justify-content-center mt-1">

                          <Button
                            size="sm"
                            onClick={()=>cartActions.decrementItem(product)}
                          >
                            -
                          </Button>

                          <span className="mx-2">
                            {cartItem.quantity}
                          </span>

                          <Button
                            size="sm"
                            onClick={()=>cartActions.incrementItem(product)}
                          >
                            +
                          </Button>

                        </div>

                      ):(
                        <Button
                          size="sm"
                          onClick={()=>cartActions.addToCart(product)}
                        >
                          Add to Cart
                        </Button>
                      )}


                      <div className="d-flex align-items-center mt-1">

                        <Button
                          variant="link"
                          size="sm"
                          onClick={()=>handleLike(product.id)}
                          className="p-0 me-1"
                        >
                          <FaHeart color={likes[product.id] ? "red":"#ccc"} />
                        </Button>

                        <p className="mb-0 h6">
                          {likes[product.id] || 0} Likes
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        )}

      </section>

    </section>

  );

};

export default Categories;