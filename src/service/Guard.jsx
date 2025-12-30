import { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApiService from "./AuthService";


// ProtectedRoute - for general authentication checks
export const ProtectedRoute = ({ element: Component }) => {
  const location = useLocation();

  return ApiService.isAuthenticated() ? (
    <Component  />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

export const AdminRoute = ({ element: Component }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!ApiService.isAuthenticated()) {
      navigate('/login', { 
        replace: true, 
        state: { from: location } 
      });
      return;
    }

    if (!ApiService.isAdmin()) {
      ApiService.logout();
      toast.error("Unauthorized access! Admin privileges required.");
      navigate('/login', {
        replace: true,
        state: { from: location }
      });
    }
  }, [navigate, location]);

  return ApiService.isAdmin() ? <Component /> : null;
};


export const SupportRoute = ({ element: Component }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!ApiService.isAuthenticated()) {
      navigate('/login', { 
        replace: true, 
        state: { from: location } 
      });
      return;
    }

    if (!ApiService.isSupport()) {
      ApiService.logout();
      toast.error("Unauthorized access! support privileges required.");
      navigate('/login', {
        replace: true,
        state: { from: location }
      });
    }
  }, [navigate, location]);

  return ApiService.isSupport() ? <Component /> : null;
};


export const CompanyRoute = ({ element: Component }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!ApiService.isAuthenticated()) {
      navigate('/login', { 
        replace: true, 
        state: { from: location } 
      });
      return;
    }

    if (!ApiService.isCompany()) {
      ApiService.logout();
      toast.error("Unauthorized access! Seller privileges required.");
      navigate('/login', {
        replace: true,
        state: { from: location }
      });
    }
  }, [navigate, location]);

  return ApiService.isCompany() ? <Component /> : null;
};



