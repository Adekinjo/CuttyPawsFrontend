import  { lazy, Suspense, useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./component/context/CartContext.jsx";
import Navbar from "./component/common/Navbar.jsx";
import Footer from "./component/common/Footer.jsx";
import LoadingSpinner from "./component/common/LoadingSpinner.jsx";
import CompanyRegister from "./component/company/CompanyResgister.jsx";
import SessionExpired from './component/pages/SessionExpired.jsx'; 
import ApiService from "./service/AuthService.js";
import "react-toastify/dist/ReactToastify.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


const Home = lazy(() => import("./component/pages/Home.jsx"));
// const ProductPage = lazy(() => import("./component/common/ProductPage.jsx"));
const ProductDetailsPage = lazy(() => import("./component/pages/ProductDetailsPage.jsx"));
const CategoryListPage = lazy(() => import("./component/pages/CategoryListPage.jsx"));
const CategoryProduct = lazy(() => import("./component/pages/CategoryProduct.jsx"));
const CartPage = lazy(() => import("./component/pages/CartPage.jsx"));
const RegisterPage = lazy(() => import("./component/pages/RegisterPage.jsx"));
const LoginPage = lazy(() => import("./component/pages/LoginPage.jsx"));
const ProfilePage = lazy(() => import("./component/profile/ProfilePage.jsx"));
const SettingsPage = lazy(() => import("./component/profile/SettingsProfile.jsx"))
const AddressPage = lazy(() => import("./component/pages/AddressPage.jsx"));
const AdminPage = lazy(() => import("./component/admin/AdminPage.jsx"));
const AdminCategory = lazy(() => import("./component/admin/AdminCategory.jsx"));
const EditCategory = lazy(() => import("./component/admin/EditCategory.jsx"));
const AddCategory = lazy(() => import("./component/admin/AddCategory.jsx"));
const AdminProduct = lazy(() => import("./component/admin/AdminProduct.jsx"));
const OrderDetails = lazy(() => import("./component/profile/OrderDetails.jsx"));
const AddProduct = lazy(() => import("./component/admin/AddProduct.jsx"));
const EditProduct = lazy(() => import("./component/admin/EditProduct.jsx"));
const AdminOrder = lazy(() => import("./component/admin/AdminOrder.jsx"));
const AdminOrderDetails = lazy(() => import("./component/admin/AdminOrderDetails.jsx"));
const CustomerSupport = lazy(() => import("./component/pages/CustomerSupport.jsx"));
const DeleteSupport = lazy(() => import("./component/admin/DeleteSupport.jsx"));
const FAQPage = lazy(() => import("./component/pages/FaqPage.jsx"));
const PrivacyPolicy = lazy(() => import("./component/pages/PrivacyPolicy.jsx"));
const TermsAndConditions = lazy(() => import("./component/pages/TermsAndConditiions.jsx"));
const SearchPricePage = lazy(() => import("./component/pages/SearchPricePage.jsx"));
const AdminReviewsPage = lazy(() => import("./component/admin/AdminReview.jsx"));
const AdminSupportPage = lazy(() => import("./component/admin/AdminSupportPage.jsx"));
const RequestResetPasswordPage = lazy(() => import("./component/pages/RequestPasswordpage.jsx"));
const ResetPasswordPage = lazy(() => import("./component/pages/ResetPassword.jsx"));
const UserList = lazy(() => import("./component/admin/AdminAllUsers.jsx"));
const SubCategoryListPage = lazy(() => import("./component/pages/SubCategoryListPage.jsx"));
const ProductSubCategory = lazy(() => import("./component/pages/ProductSubCategory.jsx"));
const SupportPage = lazy(() => import("./component/support/SupportPage.jsx"));
const SupportOrder = lazy(() => import("./component/support/SupportOrder.jsx"));
const SupportCustomerSupport = lazy(() => import("./component/support/SupportCustomerSupport.jsx"));
const SupportReviewsPage = lazy(() => import("./component/support/SupportReview.jsx"));
const PaymentSuccess = lazy(() => import("./component/pages/PaymentSuccess.jsx"));
const PaymentCallback = lazy(() => import("./component/pages/PaymentCallback.jsx"));
const PaymentFail = lazy(() => import("./component/pages/PaymentFail.jsx"));
const AboutUs = lazy(() => import("./component/pages/AboutUs.jsx"));
const AdminDeal = lazy(() => import("./component/admin/AdminDeals.jsx"));
const Deal = lazy(() => import("./component/pages/Deal.jsx"));
const NewArrivals = lazy(() => import("./component/pages/NewArrivals.jsx"));
const TrendingProducts = lazy(() => import("./component/pages/TrendinProducts.jsx"));
const SellerLanding = lazy(() => import("./component/company/LandingPage.jsx"));
const CompanyDashboard = lazy(() => import("./component/company/CompanyDashboard.jsx"));
const CompanyProduct = lazy(() => import("./component/company/CompanyProduct.jsx"));
const CompanyAddProduct = lazy(() => import("./component/company/CompanyAddProduct.jsx"));
const CompanyEditProduct = lazy(() => import("./component/company/CompanyEditProduct.jsx"));
const CompanyOrderDetails = lazy(() => import("./component/company/CompanyOrderDetails.jsx"));
const CompaniesProducts = lazy(() => import("./component/company/CompaniesProducts.jsx"));
const ProductList = lazy(() => import("./component/common/ProductList.jsx"));
const SecurityDashboard = lazy(() => import("./component/security/SecurityDashboard.jsx"));
const SecurityMonitoring = lazy(() => import("./component/security/SecurityMonitoring.jsx"));
const CacheController = lazy(() => import("./component/admin/CacheController.jsx"));
const AdminSubCategories = lazy(() => import("./component/admin/AdminSubCategories.jsx"));
const EditSubCategory = lazy(() => import("./component/admin/EditSubcategory.jsx"));
const PostDetailsPage = lazy(() => import("./component/post/PostDetailsPage.jsx"));
const PublicProfilePage = lazy(() => import("./component/profile/PublicProfilePage.jsx"));
const CreatePostPage = lazy(() => import("./component/post/CreatePostPage.jsx"));
const EditPostPage = lazy(() => import("./component/post/EditPostPage.jsx"));
const NotificationPage = lazy(() => import("./component/post/NotificationPage.jsx"));
const FollowersPage = lazy(() => import("./component/post/FollowersPage.jsx"));
const FollowingPage = lazy(() => import("./component/post/FollowingPage.jsx"));
const AddPetPage = lazy(() => import("./component/pet/AddPetPage.jsx"));
const EditPetPage = lazy(() => import("./component/pet/EditPetPage.jsx"));
const OrderHistoryPage =lazy(() => import("./component/profile/OrderHistoryPage.jsx"))
const UpdateProfile =lazy(() => import("./component/profile/UpdateProfile.jsx"))



const ProtectedRoute = lazy(() => import("./service/Guard.jsx").then(module => ({ default: module.ProtectedRoute })));
const AdminRoute = lazy(() => import("./service/Guard.jsx").then(module => ({ default: module.AdminRoute })));
const SupportRoute = lazy(() => import("./service/Guard.jsx").then(module => ({ default: module.SupportRoute })));
const CompanyRoute = lazy(() => import("./service/Guard.jsx").then(module => ({ default: module.CompanyRoute })));

function App() {
  const location = useLocation();
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    (async () => {
      await ApiService.initializeApp();
      setAuthReady(true);
    })();
  }, []);
  
  const showSessionExpired = () => {
    setShowSessionExpiredModal(true);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (!authReady) return <LoadingSpinner />;

  return (
    <CartProvider>
      <Navbar />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route exact path="/" element={<Home />} />

          <Route path="/product/:category/:subCategory/:productName/dp/:productId" element={<ProductDetailsPage />} />
          {/* <Route path="/accessories" element={<ProductPage />} /> */}
          <Route path="/categories" element={<CategoryListPage />} />
          <Route path="/category/:categoryId" element={<CategoryProduct />} />
          <Route path="/cart-view" element={<CartPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchPricePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/customer-support" element={<CustomerSupport />} />
          <Route path="/faqs" element={<FAQPage />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/request-password" element={<RequestResetPasswordPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/products-sub-category/:subCategoryId" element={<ProductSubCategory />} />
          <Route path="/categories/:categoryId/subcategories" element={<SubCategoryListPage />} />
          <Route path="/new-arrivals" element={<NewArrivals />} />
          <Route path="/trending" element={<TrendingProducts />} />
          <Route path="/deals" element={<Deal />} />
          <Route path="/products-list" element={<ProductList />} />
          <Route path="/sellers-landing-page" element={<SellerLanding />} />
          <Route path="/company-register-page" element={<CompanyRegister />} />
          <Route path="/companies/:companyName" element={<CompaniesProducts />} />

          
          {/* Social/Post Routes */}
          <Route path="/post/:postId" element={<PostDetailsPage />} />
          <Route path="/customer-profile/:userId" element={<PublicProfilePage />} />

          {/* ==================== PROTECTED ROUTES ==================== */}
          <Route path="/customer-profile" element={<ProtectedRoute element={ProfilePage} />} />
          <Route path="/add-pet" element={<ProtectedRoute element={AddPetPage} />} />
          <Route path="/settings" element={<ProtectedRoute element={SettingsPage} />} />
          <Route path="/edit-pet/:petId" element={<ProtectedRoute element={EditPetPage} />} />
          <Route path="/create-post" element={<ProtectedRoute element={CreatePostPage} />} />
          <Route path="/edit-post/:postId" element={<ProtectedRoute element={EditPostPage} />} />
          <Route path="/notifications" element={<ProtectedRoute element={NotificationPage} />} />
          <Route path="/profile/:userId/followers" element={<ProtectedRoute element={FollowersPage} />} />
          <Route path="/profile/:userId/following" element={<ProtectedRoute element={FollowingPage} />} />
          <Route path="/customer-profile/:userId/followers" element={<ProtectedRoute element={FollowersPage} />} />
          <Route path="/customer-profile/:userId/following" element={<ProtectedRoute element={FollowingPage} />} />
          <Route path="/order-history-page" element={<ProtectedRoute element={OrderHistoryPage}/>} />

          {/* Protected Routes */}
          <Route path="/customer-profile" element={<ProtectedRoute element={ProfilePage} />} />
          <Route path="/user-order-details/:itemId" element={<ProtectedRoute element={OrderDetails} />} />
          <Route path="/add-address" element={<ProtectedRoute element={AddressPage} />} />
          <Route path="/edit-address" element={<ProtectedRoute element={AddressPage} />} />
          <Route path="/payment-callback" element={<ProtectedRoute element={PaymentCallback} />} />
          <Route path="/payment-success" element={<ProtectedRoute element={PaymentSuccess} />} />
          <Route path="/payment-failed" element={<ProtectedRoute element={PaymentFail} />} />
          <Route path="/update-user-profile" element={<ProtectedRoute element={UpdateProfile} />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute element={AdminPage} />} />
          <Route path="/admin/security-dashboard" element={<AdminRoute element={SecurityDashboard} />} />
          <Route path="/admin/security-monitoring" element={<AdminRoute element={SecurityMonitoring} />} />
          <Route path="/admin/categories" element={<AdminRoute element={AdminCategory} />} />
          <Route path="/admin/add-category" element={<AdminRoute element={AddCategory} />} />
          <Route path="/admin/edit-category/:categoryId" element={<AdminRoute element={EditCategory} />} />
          <Route path="/admin/products" element={<AdminRoute element={AdminProduct} />} />
          <Route path="/admin/add-product" element={<AdminRoute element={AddProduct} />} />
          <Route path="/admin/edit-product/:productId" element={<AdminRoute element={EditProduct} />} />
          <Route path="/admin/orders" element={<AdminRoute element={AdminOrder} />} />
          <Route path="/admin/order-details/:itemId" element={<AdminRoute element={AdminOrderDetails} />} />
          <Route path="/admin/support" element={<AdminRoute element={AdminSupportPage} />} />
          <Route path="/admin/delete" element={<AdminRoute element={DeleteSupport} />} />
          <Route path="/admin/reviews" element={<AdminRoute element={AdminReviewsPage} />} />
          <Route path="/admin/all-users" element={<AdminRoute element={UserList} />} />
          <Route path="/admin/deals-management" element={<AdminRoute element={AdminDeal} />} />
          <Route path="/admin/cache-management" element={<AdminRoute element={CacheController} />} />
          <Route path="/admin/subcategories" element={<AdminRoute element={AdminSubCategories} />} />
          <Route path="/admin/edit-subcategory/:subCategoryId" element={<AdminRoute element={EditSubCategory} />} />
          


          {/* Support Routes */}
          <Route path="/support" element={<SupportRoute element={SupportPage} />} />
          <Route path="/support/orders" element={<SupportRoute element={SupportOrder} />} />
          <Route path="/support/order-details/:itemId" element={<SupportRoute element={AdminOrderDetails} />} />
          <Route path="/support/customer-view-complaines" element={<SupportRoute element={SupportCustomerSupport} />} />
          <Route path="/support/reviews" element={<SupportRoute element={SupportReviewsPage} />} />

          {/* Company Routes */}
          <Route path="/company/company-dashboard" element={<CompanyRoute element={CompanyDashboard} />} />
          <Route path="/company/company-products" element={<CompanyRoute element={CompanyProduct} />} />
          <Route path="/company/company-add-product" element={<CompanyRoute element={CompanyAddProduct} />} />
          <Route path="/company/company-edit-product/:productId" element={<CompanyRoute element={CompanyEditProduct} />} />
          <Route path="/company/company-order-details/:itemId" element={<CompanyRoute element={CompanyOrderDetails} />} />
          <Route path="*" element={
            <div className="container text-center py-5">
              <h2>404 - Page Not Found</h2>
              <p>The page you're looking for doesn't exist.</p>
              <button className="btn btn-primary" onClick={() => window.history.back()}>
                Go Back
              </button>
            </div>
          } />
        </Routes>
      </Suspense>
      <Footer />
      <ToastContainer />
      <SessionExpired
        show={showSessionExpiredModal}
        onHide={() => setShowSessionExpiredModal(false)}
      />
    </CartProvider>
  );
}

export default App;
